import type { Submission } from "@/lib/submissions";

export function SubmissionList({ items }: { items: Submission[] }) {
  if (!items || items.length === 0) return null;
  return (
    <>
      <h2 className="section">From people nearby</h2>
      {items.map((s) => (
        <div className="card" key={s.id}>
          <div className="sub">
            {s.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.photo_url} alt={s.species || "Community photo"} loading="lazy" />
            ) : null}
            <div>
              {s.note ? <p style={{ margin: "0 0 6px" }}>{s.note}</p> : null}
              {s.plan ? (
                <p className="muted" style={{ margin: "0 0 6px" }}>
                  Planning to make: {s.plan}
                </p>
              ) : null}
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                {s.author_name ? `— ${s.author_name}` : "— a neighbor"}
                {s.created_at
                  ? ` · ${new Date(s.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
