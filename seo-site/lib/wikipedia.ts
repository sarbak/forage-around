export type WikiInfo = {
  title: string;
  extract: string | null;
  image: string | null;
  url: string | null;
};

export async function getWikipedia(title: string): Promise<WikiInfo | null> {
  if (!title) return null;
  try {
    const url =
      "https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query" +
      "&redirects=1&prop=extracts|pageimages&exintro=1&explaintext=1" +
      "&piprop=original|thumbnail&pithumbsize=900&titles=" +
      encodeURIComponent(title);
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "ForageAround/1.0 (https://foragearound.com)" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0] as any;
    if (!page || page.missing !== undefined) return null;
    const image =
      page.original?.source ?? page.thumbnail?.source ?? null;
    const realTitle = page.title ?? title;
    return {
      title: realTitle,
      extract: page.extract ?? null,
      image,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(
        realTitle.replace(/ /g, "_")
      )}`,
    };
  } catch {
    return null;
  }
}
