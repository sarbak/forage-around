const FF_KEY = "AKDJGHSD";
const FF_BASE = "https://fallingfruit.org/api/0.3";

export type FFLocation = {
  id: number;
  lat: number;
  lng: number;
  type_ids: number[];
  author?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  access?: string | null;
  unverified?: boolean;
  season_start?: number | null;
  season_stop?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type FFNearby = {
  id: number;
  lat: number;
  lng: number;
  type_ids: number[];
  distance: number;
};

// Single location by id. Verified shape: returns city/state/country/address/description.
export async function getFFLocation(id: string | number): Promise<FFLocation | null> {
  try {
    const res = await fetch(`${FF_BASE}/locations/${id}?api_key=${FF_KEY}`, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "ForageAround/1.0 (https://foragearound.com)" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as FFLocation;
    if (!data || typeof data.lat !== "number") return null;
    return data;
  } catch {
    return null;
  }
}

export async function getFFNearby(
  lat: number,
  lng: number
): Promise<FFNearby[]> {
  try {
    const res = await fetch(
      `${FF_BASE}/locations?api_key=${FF_KEY}&center=${lat},${lng}`,
      {
        next: { revalidate: 3600 },
        headers: { "User-Agent": "ForageAround/1.0 (https://foragearound.com)" },
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as FFNearby[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
