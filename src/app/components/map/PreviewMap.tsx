import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAP_STYLES } from "../inputs/ColorSelector";

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
      className="ml-10 relative w-[400px] h-[610px] md:h-[610px] border border-gray-300"
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
                className="absolute w-full border-t border-white border-opacity-40"
                style={{ top: `${(i + 1) * 20}%`, left: 0, right: 0 }}
              />
            ))}
          </div>

          {/* Lignes verticales */}
          <div className="grid-lines-vertical">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute h-full border-l border-white border-opacity-40"
                style={{ left: `${(i + 1) * 20}%`, top: 0, bottom: 0 }}
              />
            ))}
          </div>

          {/* Lignes centrales (plus visibles) */}
          <div
            className="absolute top-1/2 w-full border-t border-white border-opacity-60"
            style={{ transform: "translateY(-0.5px)" }}
          />
          <div
            className="absolute left-1/2 h-full border-l border-white border-opacity-60"
            style={{ transform: "translateX(-0.5px)" }}
          />

          {/* Point central */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      )}
    </div>
  );
};

export default PreviewMap;
