import { spawn } from "node:child_process";
import http from "node:http";
import net from "node:net";
import { fileURLToPath } from "node:url";

const siteDirectory = fileURLToPath(new URL("../", import.meta.url));

function availablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

function request(port, host, path) {
  return new Promise((resolve, reject) => {
    const request = http.get(
      {
        hostname: "127.0.0.1",
        port,
        path,
        headers: { host },
      },
      (response) => {
        response.resume();
        response.once("end", () => {
          resolve({
            status: response.statusCode,
            location: response.headers.location,
          });
        });
      },
    );
    request.once("error", reject);
  });
}

async function waitForServer(port, process) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (process.exitCode !== null) {
      throw new Error(`Next.js exited before the routing check (code ${process.exitCode}).`);
    }

    try {
      await request(port, "foragearound.com", "/");
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  throw new Error("Timed out waiting for the production server.");
}

function assertRedirect(response, expectedLocation, label) {
  const actualLocation = response.location
    ? new URL(response.location).href
    : undefined;
  const normalizedExpectedLocation = new URL(expectedLocation).href;

  if (
    response.status !== 308 ||
    actualLocation !== normalizedExpectedLocation
  ) {
    throw new Error(
      `${label} expected 308 to ${expectedLocation}; received ${response.status} to ${response.location || "no location"}.`,
    );
  }
}

function assertNoRedirect(response, label) {
  if (response.status !== 200) {
    throw new Error(
      `${label} expected to stay on the preferred host with status 200; received ${response.status}${response.location ? ` to ${response.location}` : ""}.`,
    );
  }
}

const port = await availablePort();
const nextProcess = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)],
  {
    cwd: siteDirectory,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  },
);

let serverOutput = "";
nextProcess.stdout.on("data", (chunk) => {
  serverOutput += chunk;
});
nextProcess.stderr.on("data", (chunk) => {
  serverOutput += chunk;
});

try {
  await waitForServer(port, nextProcess);

  const homepage = await request(port, "www.foragearound.com", "/");
  assertRedirect(homepage, "https://foragearound.com/", "www homepage");

  const localSearchPath =
    "/locations/seattle?utm_source=directory&fruit=cherry%20plum";
  const localSearch = await request(
    port,
    "www.foragearound.com",
    localSearchPath,
  );
  assertRedirect(
    localSearch,
    `https://foragearound.com${localSearchPath}`,
    "www local-search path",
  );

  const preferredHost = await request(
    port,
    "foragearound.com",
    "/locations/seattle?fruit=cherry%20plum",
  );
  assertNoRedirect(preferredHost, "Preferred host");

  console.log(
    "www redirect check passed: homepage and local-search path redirect permanently with query intact; preferred host does not redirect.",
  );
} catch (error) {
  if (serverOutput.trim()) {
    console.error(serverOutput.trim());
  }
  throw error;
} finally {
  nextProcess.kill("SIGTERM");
}
