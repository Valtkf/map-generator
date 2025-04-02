import { useState, useCallback } from "react";
import { GeoJson, calculateBounds } from "../utils/gpx";

interface MapState {
  center: [number, number];
  zoom: number;
  backgroundColor: string;
  geoJson: GeoJson | null;
}

export function useMapState() {
  const [state, setState] = useState<MapState>({
    center: [0, 0],
    zoom: 1,
    backgroundColor: "#FFFFFF",
    geoJson: null,
  });

  const setGeoJson = useCallback((geoJson: GeoJson) => {
    const { center, zoom } = calculateBounds(geoJson);
    setState((prev) => ({
      ...prev,
      geoJson,
      center,
      zoom,
    }));
  }, []);

  const moveMap = useCallback((direction: "up" | "down" | "left" | "right") => {
    const step = 0.01;
    setState((prev) => {
      const [lng, lat] = prev.center;
      let newCenter: [number, number];

      switch (direction) {
        case "up":
          newCenter = [lng, lat + step];
          break;
        case "down":
          newCenter = [lng, lat - step];
          break;
        case "left":
          newCenter = [lng - step, lat];
          break;
        case "right":
          newCenter = [lng + step, lat];
          break;
        default:
          newCenter = [lng, lat];
      }

      return { ...prev, center: newCenter };
    });
  }, []);

  const zoomMap = useCallback((type: "in" | "out") => {
    setState((prev) => {
      const newZoom = type === "in" ? prev.zoom + 0.5 : prev.zoom - 0.5;
      return { ...prev, zoom: Math.max(1, Math.min(20, newZoom)) };
    });
  }, []);

  const setBackgroundColor = useCallback((backgroundColor: string) => {
    setState((prev) => ({ ...prev, backgroundColor }));
  }, []);

  const setCenter = useCallback((center: [number, number]) => {
    setState((prev) => ({ ...prev, center }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({ ...prev, zoom: Math.max(1, Math.min(20, zoom)) }));
  }, []);

  return {
    ...state,
    setGeoJson,
    moveMap,
    zoomMap,
    setBackgroundColor,
    setCenter,
    setZoom,
  };
}
