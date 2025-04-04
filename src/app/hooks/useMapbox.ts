import { useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { MAP_STYLES } from "../components/inputs/ColorSelector";
import { MAP_DEFAULTS } from "../constants/map";
import { GeoJson } from "../utils/gpx";

interface UseMapboxProps {
  container: HTMLDivElement | null;
  center: [number, number];
  zoom: number;
  selectedStyle: string;
  backgroundColor: string;
  gpxGeoJson?: GeoJson;
}

export const useMapbox = ({
  container,
  center,
  zoom,
  selectedStyle,
  backgroundColor,
  gpxGeoJson,
}: UseMapboxProps) => {
  const map = useRef<mapboxgl.Map | null>(null);

  const initializeMap = useCallback(() => {
    if (!container) return null;

    // Définir le token Mapbox
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    if (!mapboxgl.accessToken) {
      console.error("Mapbox token is missing!");
      return null;
    }

    const validCenter: [number, number] = [
      isNaN(center[0]) ? MAP_DEFAULTS.CENTER[0] : center[0],
      isNaN(center[1]) ? MAP_DEFAULTS.CENTER[1] : center[1],
    ];

    const validZoom = isNaN(zoom) ? MAP_DEFAULTS.ZOOM : zoom;
    const style = MAP_STYLES.find((s) => s.id === selectedStyle);
    const mapStyle = style?.url || "mapbox://styles/mapbox/streets-v11";

    return new mapboxgl.Map({
      container,
      style:
        selectedStyle === "trace-only"
          ? {
              version: 8,
              sources: {},
              layers: [
                {
                  id: "background",
                  type: "background",
                  paint: { "background-color": backgroundColor },
                },
              ],
            }
          : mapStyle,
      center: validCenter,
      zoom: validZoom,
      bearing: 0,
      pitch: 0,
      fadeDuration: 0,
    });
  }, [container, center, zoom, selectedStyle, backgroundColor]);

  const addGpxLayer = useCallback(
    (map: mapboxgl.Map) => {
      if (!gpxGeoJson?.features?.length) return;

      if (map.getSource("route")) {
        map.removeLayer("route");
        map.removeSource("route");
      }

      map.addSource("route", {
        type: "geojson",
        data: JSON.parse(JSON.stringify(gpxGeoJson)),
      });

      map.addLayer({
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
    },
    [gpxGeoJson]
  );

  return { map, initializeMap, addGpxLayer };
};
