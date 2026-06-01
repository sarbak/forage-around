import type { Metadata } from "next";
import Image from "next/image";
import { Credits, APP_URL } from "../components";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why I built Forage Around — a simple map of the fruit growing wild and unpicked around Berkeley.",
};

export default function About() {
  return (
    <>
      <p className="kicker">About</p>
      <h1 className="title">Why I built this</h1>

      <p className="lead">
        I moved to Berkeley about nine months ago and got into fermentation
        around the same time.
      </p>
      <p>
        Walking around, I kept noticing how much fruit grows wild and unpicked
        right on the sidewalk: loquats, plums, figs, lemons, mostly going to the
        birds or the pavement. I wanted a simple way to see what was ripe near
        me and what I could make with it, so I built this for myself on top of
        Falling Fruit&apos;s lovely open map.
      </p>
      <p>
        I&apos;m sharing it in case your neighborhood is as quietly generous as
        mine. Take only what would otherwise fall, knock before reaching over a
        fence, and always leave plenty for the birds and the next person.
      </p>

      <div className="author">
        <Image
          src="/emre.jpg"
          alt="Emre Sarbak"
          width={64}
          height={64}
        />
        <p style={{ margin: 0 }}>
          Made by{" "}
          <a href="https://emresarbak.com" rel="noopener">
            Emre Sarbak
          </a>
          , in Berkeley
        </p>
      </div>

      <p style={{ margin: "22px 0" }}>
        <a className="btn" href={APP_URL}>
          Open the live map →
        </a>
      </p>

      <Credits />
    </>
  );
}
