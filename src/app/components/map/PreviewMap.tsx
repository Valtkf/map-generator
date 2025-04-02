import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Définition du type GeoJSON
type GeoJSON = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: {
      type: "LineString" | "Point" | "Polygon";
      coordinates: number[][] | number[] | number[][][];
    };
    properties?: Record<string, unknown>;
  }>;
};

interface PreviewMapProps {
  backgroundColor: string;
  gpxGeoJson: GeoJSON;
  center: [number, number];
  zoom: number;
}

const PreviewMap = ({
  backgroundColor,
  gpxGeoJson,
  center,
  zoom,
}: PreviewMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Vérifier que les coordonnées sont valides
    const validCenter: [number, number] = [
      isNaN(center[0]) ? 0 : center[0],
      isNaN(center[1]) ? 0 : center[1],
    ];

    const validZoom = isNaN(zoom) ? 1 : zoom;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    // Ajoutez une vérification pour déboguer
    console.log(
      "Token Mapbox disponible:",
      !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    );

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: validCenter,
      zoom: validZoom,
    });

    map.current.on("load", () => {
      if (!map.current) return;

      // Ajouter le tracé GPX
      if (gpxGeoJson?.features?.length > 0) {
        map.current.addSource("route", {
          type: "geojson",
          data: JSON.parse(JSON.stringify(gpxGeoJson)),
        });

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#000000",
            "line-width": 2,
          },
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [center, zoom, gpxGeoJson]);

  return (
    <div
      style={{ backgroundColor }}
      className="relative w-full max-w-2xl h-96 border border-gray-300"
    >
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default PreviewMap;
