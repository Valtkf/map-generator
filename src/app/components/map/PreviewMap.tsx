import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAP_STYLES } from "../inputs/ColorSelector";
import { GeoJson } from "../../utils/gpx";

interface PreviewMapProps {
  backgroundColor: string;
  gpxGeoJson: GeoJson;
  center: [number, number];
  zoom: number;
  showGrid?: boolean;
  selectedStyle: string;
}

const PreviewMap = ({
  backgroundColor,
  gpxGeoJson,
  center,
  zoom,
  showGrid = false,
  selectedStyle,
}: PreviewMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Vérifier que les coordonnées sont valides
    const validCenter: [number, number] = [
      isNaN(center[0]) ? 0 : center[0],
      isNaN(center[1]) ? 0 : center[1],
    ];

    const validZoom = isNaN(zoom) ? 1 : zoom;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    // Trouver le style sélectionné
    const style = MAP_STYLES.find((s) => s.id === selectedStyle);

    // Utiliser le style par défaut si aucun style n'est trouvé
    const mapStyle = style?.url || "mapbox://styles/mapbox/streets-v11";

    // Nettoyer les marqueurs existants
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Nettoyer la carte précédente avec vérification
    if (map.current) {
      try {
        map.current.remove();
      } catch (e) {
        console.warn("Erreur lors de la suppression de la carte:", e);
      }
    }

    // Créer une nouvelle carte
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
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

      map.current.jumpTo({ center: validCenter, zoom: validZoom });
    } catch (e) {
      console.error("Erreur lors de la création de la carte:", e);
      return;
    }

    map.current.on("load", () => {
      if (!map.current) return;

      // Ajouter le tracé GPX
      if (gpxGeoJson?.features?.length > 0) {
        // Si la source existe déjà, la supprimer
        if (map.current.getSource("route")) {
          map.current.removeLayer("route");
          map.current.removeSource("route");
        }

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

        // Ajouter des marqueurs au début et à la fin du tracé
        const lineFeature = gpxGeoJson.features.find(
          (feature) => feature.geometry.type === "LineString"
        );

        if (lineFeature && lineFeature.geometry.type === "LineString") {
          const coordinates = lineFeature.geometry.coordinates as [
            number,
            number
          ][];

          if (coordinates.length >= 2) {
            // Créer un élément DOM personnalisé pour le marqueur de départ
            const startEl = document.createElement("div");
            startEl.className = "custom-marker";
            startEl.style.width = "12px";
            startEl.style.height = "12px";
            startEl.style.borderRadius = "50%";
            startEl.style.backgroundColor = "white";
            startEl.style.border = "2px solid black";

            // Créer un élément DOM personnalisé pour le marqueur d'arrivée
            const endEl = document.createElement("div");
            endEl.className = "custom-marker";
            endEl.style.width = "12px";
            endEl.style.height = "12px";
            endEl.style.borderRadius = "50%";
            endEl.style.backgroundColor = "white";
            endEl.style.border = "2px solid black";

            // Ajouter les marqueurs personnalisés
            const startMarker = new mapboxgl.Marker({
              element: startEl,
              anchor: "center",
            })
              .setLngLat(coordinates[0])
              .addTo(map.current);

            const endMarker = new mapboxgl.Marker({
              element: endEl,
              anchor: "center",
            })
              .setLngLat(coordinates[coordinates.length - 1])
              .addTo(map.current);

            markersRef.current = [startMarker, endMarker];
          }
        }
      }
    });

    return () => {
      // Nettoyer avec vérification
      if (map.current) {
        try {
          // Vérifier si la carte est toujours valide avant de la supprimer
          if (map.current._loaded && !map.current._removed) {
            map.current.remove();
          }
        } catch (e) {
          console.warn("Erreur lors du nettoyage de la carte:", e);
        }
      }
    };
  }, [center, zoom, gpxGeoJson, selectedStyle, backgroundColor]);

  return (
    <div
      style={{
        backgroundColor:
          selectedStyle === "trace-only" ? backgroundColor : undefined,
      }}
      className="ml-20 relative w-[400px] h-[610px] md:h-[610px] border border-gray-300"
    >
      <div ref={mapContainer} className="w-full h-full" />

      {/* Grille de repérage */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Lignes horizontales */}
          <div className="grid-lines-horizontal">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute w-full border-t border-dashed border-red-500 border-opacity-30"
                style={{ top: `${(i + 1) * 20}%`, left: 0, right: 0 }}
              />
            ))}
          </div>

          {/* Lignes verticales */}
          <div className="grid-lines-vertical">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute h-full border-l border-dashed border-red-500 border-opacity-30"
                style={{ left: `${(i + 1) * 20}%`, top: 0, bottom: 0 }}
              />
            ))}
          </div>

          {/* Lignes centrales */}
          <div
            className="absolute top-1/2 w-full border-t-2 border-dashed border-red-500 border-opacity-40"
            style={{ transform: "translateY(-1px)" }}
          />
          <div
            className="absolute left-1/2 h-full border-l-2 border-dashed border-red-500 border-opacity-40"
            style={{ transform: "translateX(-1px)" }}
          />

          {/* Point central */}
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-red-500 bg-opacity-60 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}
    </div>
  );
};

export default PreviewMap;
