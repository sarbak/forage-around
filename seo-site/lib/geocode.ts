// Reverse-geocode lat,lng -> city via Nominatim. Cached by ISR fetch.
export async function reverseGeocodeCity(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
      {
        next: { revalidate: 604800 },
        headers: {
          "User-Agent": "ForageAround/1.0 (https://foragearound.com)",
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const a = data?.address;
    if (!a) return null;
    return (
      a.city ||
      a.town ||
      a.village ||
      a.suburb ||
      a.neighbourhood ||
      a.county ||
      null
    );
  } catch {
    return null;
  }
}
