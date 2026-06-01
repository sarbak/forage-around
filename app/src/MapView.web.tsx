import { useEffect, useRef } from "react";
import { Find } from "./lib";
import { C } from "./theme";

// Web map via Leaflet + OpenStreetMap tiles (no API key). Native gets MapView.tsx.
declare global {
  interface Window {
    L?: any;
  }
}

let leafletPromise: Promise<void> | null = null;
function loadLeaflet(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.L) return Promise.resolve();
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise<void>((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    js.onload = () => resolve();
    js.onerror = () => reject(new Error("leaflet failed to load"));
    document.head.appendChild(js);
  });
  return leafletPromise;
}

type Props = {
  center: { lat: number; lng: number };
  finds: Find[];
  onSelect: (f: Find) => void;
};

export default function MapView({ center, finds, onSelect }: Props) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then(() => {
      if (cancelled || !elRef.current) return;
      const L = window.L;
      if (!mapRef.current) {
        mapRef.current = L.map(elRef.current, { zoomControl: true, attributionControl: true });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap",
        }).addTo(mapRef.current);
        markersRef.current = L.layerGroup().addTo(mapRef.current);
      }
      const map = mapRef.current;
      map.setView([center.lat, center.lng], 16);
      // give the container a beat to size, then fix tile layout
      setTimeout(() => map.invalidateSize(), 60);

      markersRef.current.clearLayers();
      // "you are here"
      L.circleMarker([center.lat, center.lng], {
        radius: 8,
        color: "#fff",
        weight: 2,
        fillColor: C.forest,
        fillOpacity: 1,
      })
        .addTo(markersRef.current)
        .bindTooltip("You", { direction: "top" });

      finds.slice(0, 150).forEach((f) => {
        const ripe = f.inSeason;
        const icon = L.divIcon({
          className: "",
          html:
            `<div style="font-size:18px;line-height:28px;text-align:center;` +
            `width:30px;height:30px;border-radius:16px;` +
            `background:${ripe ? C.ripe : C.white};` +
            `border:2px solid ${ripe ? C.ripe : C.line};` +
            `box-shadow:0 1px 4px rgba(31,42,32,0.25)">${f.species.emoji}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        const m = L.marker([f.lat, f.lng], { icon }).addTo(markersRef.current);
        m.bindTooltip(`${f.type}${ripe ? " · ripe" : ""}`, { direction: "top" });
        m.on("click", () => onSelect(f));
      });
    });
    return () => {
      cancelled = true;
    };
  }, [center.lat, center.lng, finds, onSelect]);

  // A plain DOM div is fine here — this file only loads on web.
  return (
    <div
      ref={elRef}
      style={{ width: "100%", height: "100%", minHeight: 420, borderRadius: 16, overflow: "hidden" }}
    />
  );
}
