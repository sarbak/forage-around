// Read approved community submissions from Supabase via the REST API.
// The `submissions` table may not exist yet — every path returns [] on error.

export type Submission = {
  id: string;
  status: string;
  kind: "observation" | "new_tree";
  ff_location_id: string | null;
  species: string | null;
  lat: number | null;
  lng: number | null;
  note: string | null;
  plan: string | null;
  photo_url: string | null;
  author_name: string | null;
  created_at: string;
};

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function query(params: string): Promise<Submission[]> {
  if (!URL || !KEY) return [];
  try {
    const res = await fetch(`${URL}/rest/v1/submissions?${params}`, {
      next: { revalidate: 3600 },
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data as Submission[];
  } catch {
    return [];
  }
}

export async function submissionsForTree(
  ffLocationId: string
): Promise<Submission[]> {
  const p = new URLSearchParams({
    select: "*",
    status: "eq.approved",
    ff_location_id: `eq.${ffLocationId}`,
    order: "created_at.desc",
  });
  return query(p.toString());
}

export async function submissionsForSpecies(
  speciesName: string
): Promise<Submission[]> {
  const p = new URLSearchParams({
    select: "*",
    status: "eq.approved",
    species: `eq.${speciesName}`,
    order: "created_at.desc",
  });
  return query(p.toString());
}
