import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { EMAIL_SIGNUP_CONSENT, saveEmailSignup } from "./emailSignup";

test("submits every required signup field to a safe local destination", async (t) => {
  const received: unknown[] = [];
  const server = createServer((request, response) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      if (request.method === "POST" && request.url === "/rest/v1/email_signups") {
        received.push(JSON.parse(body));
        response.writeHead(201, { "Content-Type": "application/json" });
        response.end("[]");
        return;
      }
      response.writeHead(404);
      response.end();
    });
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());

  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const destination = `http://127.0.0.1:${address.port}/rest/v1/email_signups`;
  const startedAt = Date.now();
  const saved = await saveEmailSignup(
    {
      email: "  Local.Test@Example.com ",
      consent_text: EMAIL_SIGNUP_CONSENT,
      source_action: "walk_here",
      submission_kind: "observation",
      map_source: "seasonal_guide",
      ff_location_id: "123",
      species: "Plum",
      lat: 37.88,
      lng: -122.27,
      referral_params: { utm_source: "local_test" },
    },
    async (row) => {
      const response = await fetch(destination, {
        method: "POST",
        headers: {
          apikey: "safe-local-test-key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify([row]),
      });
      return response.ok;
    }
  );

  assert.equal(saved, true);
  assert.equal(received.length, 1);
  const rows = received[0] as Array<Record<string, unknown>>;
  assert.equal(rows.length, 1);
  assert.equal(rows[0].email, "local.test@example.com");
  assert.equal(rows[0].consent_text, EMAIL_SIGNUP_CONSENT);
  assert.equal(rows[0].source_action, "walk_here");
  assert.equal(rows[0].submission_kind, "observation");
  assert.equal(rows[0].map_source, "seasonal_guide");
  assert.equal(rows[0].ff_location_id, "123");
  assert.equal(rows[0].species, "Plum");
  assert.deepEqual(rows[0].referral_params, { utm_source: "local_test" });
  assert.ok(typeof rows[0].created_at === "string");
  assert.ok(Date.parse(rows[0].created_at as string) >= startedAt);
});
