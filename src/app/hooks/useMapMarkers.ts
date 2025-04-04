import { useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { MAP_CONFIG } from "../constants/map";

interface MarkerConfig {
  size: number;
  borderWidth: number;
}

export const useMapMarkers = (isExport = false) => {
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const createMarkerElement = useCallback(
    ({ size, borderWidth }: MarkerConfig) => {
      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "white";
      el.style.border = `${borderWidth}px solid black`;
      return el;
    },
    []
  );

  const addRouteMarkers = useCallback(
    (map: mapboxgl.Map, coordinates: [number, number][]) => {
      if (!map || !coordinates.length) return;

      // Nettoyer les marqueurs existants d'abord
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      const configSource = isExport
        ? MAP_CONFIG.MARKERS.EXPORT
        : MAP_CONFIG.MARKERS.PREVIEW;

      // Convertir la config au bon format
      const config: MarkerConfig = {
        size: configSource.SIZE,
        borderWidth: configSource.BORDER,
      };

      if (coordinates.length >= 2) {
        const startEl = createMarkerElement(config);
        const endEl = createMarkerElement(config);

        const startMarker = new mapboxgl.Marker({
          element: startEl,
          anchor: "center",
        })
          .setLngLat(coordinates[0])
          .addTo(map);

        const endMarker = new mapboxgl.Marker({
          element: endEl,
          anchor: "center",
        })
          .setLngLat(coordinates[coordinates.length - 1])
          .addTo(map);

        markersRef.current = [startMarker, endMarker];
      }
    },
    [isExport, createMarkerElement]
  );

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  }, []);

  return { addRouteMarkers, clearMarkers };
};
