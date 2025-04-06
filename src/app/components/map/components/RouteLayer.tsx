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
}

export const RouteLayer = ({
  map,
  gpxGeoJson,
  selectedStyle,
  isExport,
}: RouteLayerProps) => {
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!gpxGeoJson?.features?.length || !map) return;

    const addRoute = () => {
      try {
        // Nettoyer les marqueurs existants
        markers.current.forEach((marker) => marker.remove());
        markers.current = [];

        // Supprimer l'ancien tracé s'il existe
        try {
          if (map.getSource("route")) {
            map.removeLayer("route");
            map.removeSource("route");
          }
        } catch {
          // Ignorer les erreurs de source non trouvée
        }

        const style = MAP_STYLES.find((s) => s.id === selectedStyle);
        const traceColor = style?.traceColor || "#000000";

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
            "line-width": isExport ? 3 : 2,
          },
        });

        // Ajouter les marqueurs
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

          const startMarker = new mapboxgl.Marker()
            .setLngLat(startPoint)
            .addTo(map);

          const endMarker = new mapboxgl.Marker()
            .setLngLat(endPoint)
            .addTo(map);

          markers.current = [startMarker, endMarker];
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout du tracé:", error);
      }
    };

    // Fonction pour attendre que la carte soit prête
    const waitForMap = () => {
      if (map.isStyleLoaded()) {
        addRoute();
      } else {
        map.once("style.load", addRoute);
      }
    };

    // Attendre que la carte soit prête après chaque changement de style
    map.once("style.load", waitForMap);
    waitForMap();

    return () => {
      markers.current.forEach((marker) => marker.remove());
      try {
        if (map.getSource("route")) {
          map.removeLayer("route");
          map.removeSource("route");
        }
      } catch {
        // Ignorer les erreurs de nettoyage
      }
    };
  }, [map, gpxGeoJson, selectedStyle, isExport]);

  return null;
};
