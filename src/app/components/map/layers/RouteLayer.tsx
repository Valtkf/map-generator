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
}

const createCustomMarker = (color: string) => {
  const el = document.createElement("div");
  el.className = "custom-marker";
  el.style.width = "12px";
  el.style.height = "12px";
  el.style.borderRadius = "50%";
  el.style.backgroundColor = "white";
  el.style.border = `2px solid ${color}`;
  return el;
};

export const RouteLayer = ({
  map,
  gpxGeoJson,
  selectedStyle,
  isExport,
  isMapReady,
}: RouteLayerProps) => {
  const markers = useRef<mapboxgl.Marker[]>([]);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    if (!gpxGeoJson?.features?.length || !map || !isMapReady) return;

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

        // Vérifier si la carte est prête
        if (!map.isStyleLoaded()) {
          if (retryCount.current < maxRetries) {
            retryCount.current++;
            setTimeout(addRoute, 100);
            return;
          }
          console.warn("Style non chargé après plusieurs tentatives");
          return;
        }

        // Réinitialiser le compteur de tentatives
        retryCount.current = 0;

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
            "line-width": isExport ? 3 : 2,
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
            element: createCustomMarker(traceColor),
            scale: isExport ? 1.5 : 1,
          })
            .setLngLat(startPoint)
            .addTo(map);

          const endMarker = new mapboxgl.Marker({
            element: createCustomMarker(traceColor),
            scale: isExport ? 1.5 : 1,
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

    return () => {
      map.off("style.load", waitForStyle);
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
  }, [map, gpxGeoJson, selectedStyle, isExport, isMapReady]);

  return null;
};
