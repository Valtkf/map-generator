import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { GeoJson } from "../../../utils/gpx";
import { Feature, LineString } from "geojson";
import { MAP_STYLES } from "../../inputs/ColorSelector";

interface RouteLayerProps {
  map: mapboxgl.Map;
  gpxGeoJson: GeoJson | null;
  selectedStyle: string;
  isExport: boolean;
  isMapReady: boolean;
  lineWidth: number;
}

const createCustomMarker = (
  color: string,
  isExport: boolean,
  lineWidth: number
) => {
  const el = document.createElement("div");
  el.className = "custom-marker";
  el.style.width = "13px";
  el.style.height = "13px";
  el.style.borderRadius = "50%";
  el.style.backgroundColor = "white";
  el.style.border = `${
    isExport ? lineWidth * 4.77 * 0.75 : lineWidth * 0.75
  }px solid ${color}`;
  return el;
};

export const RouteLayer = ({
  map,
  gpxGeoJson,
  selectedStyle,
  isExport,
  isMapReady,
  lineWidth,
}: RouteLayerProps) => {
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!gpxGeoJson?.features?.length || !map || !isMapReady) return;

    const removeExistingLayers = () => {
      try {
        if (map.getLayer("route")) {
          map.removeLayer("route");
        }
        if (map.getSource("route")) {
          map.removeSource("route");
        }
      } catch {
        // Ignorer silencieusement les erreurs de suppression
      }
    };

    const addRoute = () => {
      try {
        // Nettoyer les marqueurs existants
        markers.current.forEach((marker) => marker.remove());
        markers.current = [];

        // Supprimer l'ancien tracé
        removeExistingLayers();

        // Récupérer la couleur du style
        const traceColor =
          MAP_STYLES.find((s) => s.id === selectedStyle)?.traceColor ||
          "#000000";

        // Ajouter le nouveau tracé
        map.addSource("route", {
          type: "geojson",
          data: gpxGeoJson,
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
            "line-color": traceColor,
            "line-width": isExport ? lineWidth * 4.77 : lineWidth,
          },
        });

        // Ajouter les marqueurs personnalisés
        const lineFeature = gpxGeoJson.features.find(
          (feature): feature is Feature<LineString> =>
            feature.geometry.type === "LineString"
        );

        if (lineFeature) {
          const coordinates = lineFeature.geometry.coordinates;
          const startPoint = coordinates[0] as [number, number];
          const endPoint = coordinates[coordinates.length - 1] as [
            number,
            number
          ];

          const startMarker = new mapboxgl.Marker({
            element: createCustomMarker(traceColor, isExport, lineWidth),
            scale: 1,
          })
            .setLngLat(startPoint)
            .addTo(map);

          const endMarker = new mapboxgl.Marker({
            element: createCustomMarker(traceColor, isExport, lineWidth),
            scale: 1,
          })
            .setLngLat(endPoint)
            .addTo(map);

          markers.current = [startMarker, endMarker];
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout du tracé:", error);
      }
    };

    // Attendre que le style soit chargé
    const waitForStyle = () => {
      if (map.isStyleLoaded()) {
        addRoute();
      } else {
        map.once("style.load", addRoute);
      }
    };

    // Écouter les changements de style
    map.on("style.load", waitForStyle);
    waitForStyle();

    // Ajouter un délai pour s'assurer que le style est bien chargé
    const timeoutId = setTimeout(() => {
      if (map.isStyleLoaded()) {
        addRoute();
      }
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      map.off("style.load", waitForStyle);
      markers.current.forEach((marker) => marker.remove());
      removeExistingLayers();
    };
  }, [map, gpxGeoJson, selectedStyle, isExport, isMapReady, lineWidth]);

  return null;
};
