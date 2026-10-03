"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";

const HIGHLIGHTED = [
  "United States of America",
  "Nigeria",
  "Ghana",
  "United Kingdom",
  "Kenya",
  "South Africa",
  "Canada",
  "Uganda",
];

const LABELS: Record<string, string> = {
  "United States of America": "United States",
};

export function NationsMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void import("leaflet/dist/leaflet.css").then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || mapInstance.current) return;
    let cancelled = false;

    void import("leaflet").then(async (leaflet) => {
      if (cancelled || !mapRef.current) return;
      const L = leaflet.default ?? leaflet;
      const map = L.map(mapRef.current, {
        center: [12, 8],
        zoom: 2,
        minZoom: 2,
        maxZoom: 6,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 16,
        attribution: "Tiles &copy; Esri",
      }).addTo(map);

      try {
        const response = await fetch("/nations.geojson");
        const geojson = await response.json();
        const features = {
          ...geojson,
          features: geojson.features.filter((feature: { properties?: { name?: string } }) =>
            HIGHLIGHTED.includes(feature.properties?.name ?? ""),
          ),
        };
        L.geoJSON(features, {
          style: {
            fillColor: "#8bc34a",
            fillOpacity: 0.55,
            color: "#8bc34a",
            weight: 1.5,
          },
          onEachFeature: (feature, layer) => {
            const name = feature.properties?.name ?? "";
            layer.bindPopup(LABELS[name] ?? name);
            layer.on({
              mouseover: (event) => {
                event.target.setStyle({ fillOpacity: 0.8, weight: 2.5 });
              },
              mouseout: (event) => {
                event.target.setStyle({ fillOpacity: 0.55, weight: 1.5 });
              },
            });
          },
        }).addTo(map);
      } catch {
        // The highlighted shapes are local. The page still shows the base map if they fail.
      }

      mapInstance.current = map;
      window.setTimeout(() => map.invalidateSize(), 200);
    });

    return () => {
      cancelled = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [ready]);

  return <div className="nations-map" ref={mapRef} role="img" aria-label="Map of nations reached: United States, Nigeria, Ghana, United Kingdom, Kenya, South Africa, Canada, and Uganda" />;
}
