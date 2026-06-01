// Server-rendered static OSM map image with a marker. No client JS.
// Coordinates are always also rendered as text by the page for SEO.

export function StaticMap({
  lat,
  lng,
  alt,
}: {
  lat: number;
  lng: number;
  alt: string;
}) {
  const src =
    `https://staticmap.openstreetmap.de/staticmap.php` +
    `?center=${lat},${lng}&zoom=17&size=640x300&maptype=mapnik` +
    `&markers=${lat},${lng},red-pushpin`;
  const osmLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
  return (
    <div className="map-box">
      <a href={osmLink} rel="noopener" aria-label="View on OpenStreetMap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} width={640} height={300} loading="lazy" />
      </a>
    </div>
  );
}
