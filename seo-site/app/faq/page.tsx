import type { Metadata } from "next";
import Link from "next/link";
import { SITE_ORIGIN } from "@/lib/site-origin";
import { APP_URL, Credits } from "../components";
import { FaqPageViewed, ToAppLink } from "../analytics";

const PAGE_PATH = "/faq";
const META_DESCRIPTION =
  "Forage Around is a free urban foraging map. Learn what the name means, how the map works, where its data comes from, and what to check before picking.";

export const metadata: Metadata = {
  title: "What is Forage Around? Map FAQ and meaning",
  description: META_DESCRIPTION,
  alternates: {
    canonical: `${SITE_ORIGIN}${PAGE_PATH}`,
  },
  openGraph: {
    type: "website",
    title: "What is Forage Around?",
    description: META_DESCRIPTION,
    url: PAGE_PATH,
  },
};

const FAQS = [
  {
    question: "What is Forage Around?",
    answer:
      "Forage Around is a free, open-source urban foraging map. It helps you explore reported fruit trees, herbs, greens, and other edible plants near an address, then check usual season timing and plant notes before visiting.",
  },
  {
    question: 'What does "forage around" mean?',
    answer:
      "As a phrase, to forage around means to search an area for food or useful things. On this site, Forage Around is the name of the urban foraging map. The same words may appear in sayings or crossword clues, but this product is built for finding reported edible plants.",
  },
  {
    question: "How do I use the Forage Around map?",
    answer:
      "Share your location or search an address, compare nearby plant reports, and open a report for distance, season context, plant notes, and walking directions. Treat each report as a lead to check in person.",
  },
  {
    question: "Is Forage Around free, and do I need an account?",
    answer:
      "Forage Around is free and non-commercial. You do not need an account to search the map, read plant details, or open walking directions.",
  },
  {
    question: "Where does Forage Around get its data?",
    answer:
      "Reported plant locations come from the crowd-sourced Falling Fruit map under its CC BY-NC-SA license. Forage Around adds curated season windows, edible-part notes, uses, and preservation ideas. Plant photos and descriptions come from Wikipedia and Wikimedia Commons, and maps use OpenStreetMap.",
  },
  {
    question: "Does Forage Around work in my city?",
    answer:
      "The map searches Falling Fruit's live data by location, so you can try it in any city. Coverage depends on community reports, and some areas have many more mapped plants than others.",
  },
  {
    question: "Does a map marker mean a plant is safe and available to pick?",
    answer:
      "No. A marker does not confirm plant identity, current ripeness, land ownership, public access, local rules, or permission to harvest. Confirm all of those yourself, and leave the plant alone if anything is unclear.",
  },
  {
    question: "Can I add a plant or report a correction?",
    answer:
      "Yes. You can submit a new edible plant from the map or report a correction to an existing location. When you add a new plant, you can also choose to share it with Falling Fruit.",
  },
] as const;

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

export default function FaqPage() {
  return (
    <>
      <FaqPageViewed />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(FAQ_SCHEMA).replaceAll("<", "\\u003c"),
        }}
      />

      <section className="faq-hero" aria-labelledby="faq-title">
        <div>
          <p className="kicker">Forage Around FAQ</p>
          <h1 className="title" id="faq-title">
            What is Forage Around?
          </h1>
          <p className="lead">
            A free urban foraging map for exploring reported fruit, herbs, and
            greens near you. Search a place, check the clues, then verify the
            plant and permission before picking.
          </p>
          <div className="faq-hero-action">
            <ToAppLink className="btn" href={APP_URL} from="faq">
              Open the free map →
            </ToAppLink>
            <span className="muted">No account needed</span>
          </div>
        </div>

        <div className="faq-field-note" aria-label="How Forage Around works">
          <span className="faq-field-note-mark" aria-hidden="true">
            🍐
          </span>
          <strong>Map first. Confirm in person.</strong>
          <p>
            Each marker is a crowd-sourced starting point, not a promise that a
            plant is still there, ripe, correctly identified, or yours to pick.
          </p>
        </div>
      </section>

      <section aria-labelledby="faq-three-checks">
        <h2 className="section" id="faq-three-checks">
          From address to a careful foraging walk
        </h2>
        <div className="faq-steps">
          <div>
            <span aria-hidden="true">1</span>
            <strong>Search nearby</strong>
            <p>Share your location or type an address.</p>
          </div>
          <div>
            <span aria-hidden="true">2</span>
            <strong>Check the report</strong>
            <p>Compare distance, season timing, and plant notes.</p>
          </div>
          <div>
            <span aria-hidden="true">3</span>
            <strong>Verify before picking</strong>
            <p>Confirm identity, access, rules, and permission.</p>
          </div>
        </div>
      </section>

      <section className="faq-page-block" aria-labelledby="faq-answers">
        <h2 className="section" id="faq-answers">
          Questions about the map
        </h2>
        <div className="faq-page-list">
          {FAQS.map(({ question, answer }) => (
            <article key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="faq-next-step">
        <div>
          <h2>Start with one nearby search</h2>
          <p>
            Open the map, choose two or three reports for a short walk, and
            check every plant and site when you arrive.
          </p>
        </div>
        <ToAppLink className="faq-next-link" href={APP_URL} from="faq">
          Find edible plants near me →
        </ToAppLink>
      </div>

      <p className="muted">
        Want the source details? Read{" "}
        <Link href="/about">where the map data comes from</Link>, or see{" "}
        <Link href="/foraging-map">how the foraging map works</Link>.
      </p>

      <Credits />
    </>
  );
}
