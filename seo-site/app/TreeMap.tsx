"use client";

// Client-side Leaflet map (OpenStreetMap tiles, no API key).
// The literal coordinates are rendered as text by the page for SEO;
// this component only adds the visual map.

import { useEffect, useRef } from "react";

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

declare global {
  interface Window {
    L?: any;
  }
}

function loadCss(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      `script[src="${src}"]`
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject());
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject());
    document.head.appendChild(script);
  });
}

export function TreeMap({ lat, lng }: { lat: number; lng: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    loadCss(LEAFLET_CSS);
    loadScript(LEAFLET_JS)
      .then(() => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        const L = window.L;
        if (!L) return;

        const map = L.map(containerRef.current, {
          center: [lat, lng],
          zoom: 16,
          scrollWheelZoom: false,
          attributionControl: true,
        });
        mapRef.current = map;

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap",
        }).addTo(map);

        const icon = L.divIcon({
          className: "tree-marker",
          html:
            '<span style="display:block;width:18px;height:18px;border-radius:999px;' +
            "background:#2E5E3A;border:3px solid #fffdf8;" +
            'box-shadow:0 1px 4px rgba(0,0,0,0.35);"></span>',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        L.marker([lat, lng], { icon }).addTo(map);
      })
      .catch(() => {
        /* leaflet failed to load; text coordinates remain for users */
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="tree-map"
      role="img"
      aria-label="Map showing the foraging spot location"
    />
  );
}
