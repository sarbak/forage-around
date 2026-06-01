import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <span className="emoji-big">🍃</span>
      <h1 className="title">Nothing growing here</h1>
      <p className="lead">
        This page wandered off. Head back to the map or browse the plants.
      </p>
      <p style={{ margin: "22px 0" }}>
        <Link className="btn" href="/">
          Back to Forage Around →
        </Link>
      </p>
    </>
  );
}
