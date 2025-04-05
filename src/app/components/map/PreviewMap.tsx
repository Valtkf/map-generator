import React, { useEffect, useRef, forwardRef } from "react";
import mapboxgl, { Style } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAP_STYLES } from "../inputs/ColorSelector";
import { GeoJson } from "../../utils/gpx";
import { FeatureCollection, Geometry } from "geojson";

interface PreviewMapProps {
  backgroundColor: string;
  gpxGeoJson: GeoJson | null;
  center: [number, number];
  zoom: number;
  showGrid?: boolean;
  selectedStyle: string;
  isExport?: boolean;
  onMapLoad?: () => void;
}
// Type pour le style personnalisé
interface CustomStyle extends Omit<Style, "version" | "sources" | "layers"> {
  version: 8;
  sources: Record<string, never>;
  layers: Array<{
    id: string;
    type: "background";
    paint: {
      "background-color": string;
    };
  }>;
}

const PreviewMap = forwardRef<mapboxgl.Map, PreviewMapProps>((props, ref) => {
  const {
    center,
    zoom,
    selectedStyle,
    backgroundColor,
    gpxGeoJson,
    onMapLoad,
  } = props;
  const mapContainer = useRef<HTMLDivElement>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  // Créer le style personnalisé
  const createCustomStyle = (backgroundColor: string): CustomStyle => ({
    version: 8,
    sources: {},
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": backgroundColor,
        },
      },
    ],
  });

  // Initialiser la carte
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
    (mapboxgl as { accessToken: string }).accessToken = token;

    // Fonction pour ajouter le tracé GPX
    const addGpxLayer = (map: mapboxgl.Map) => {
      if (!gpxGeoJson?.features?.length) return;
      try {
        if (map.getSource("route")) {
          map.removeLayer("route");
          map.removeSource("route");
        }

        const style = MAP_STYLES.find((s) => s.id === selectedStyle);
        const traceColor = style?.traceColor || "#000000";

        map.addSource("route", {
          type: "geojson",
          data: gpxGeoJson as FeatureCollection<Geometry>,
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
            "line-width": props.isExport ? 3 : 2,
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
              .addTo(map);

            const endMarker = new mapboxgl.Marker({
              element: endEl,
              anchor: "center",
            })
              .setLngLat(coordinates[coordinates.length - 1])
              .addTo(map);

            markers.current = [startMarker, endMarker];
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout du tracé:", error);
      }
    };

    const style = MAP_STYLES.find((s) => s.id === selectedStyle);
    const mapStyle =
      selectedStyle === "trace-only"
        ? createCustomStyle(backgroundColor)
        : style?.url || "mapbox://styles/mapbox/streets-v11";

    mapInstance.current = new mapboxgl.Map({
      container: mapContainer.current,
      style:
        typeof mapStyle === "string" ? mapStyle : (mapStyle as mapboxgl.Style),
      center,
      zoom,
      bearing: 0,
      pitch: 0,
    });

    // Assigner la ref externe
    if (typeof ref === "function") {
      ref(mapInstance.current);
    } else if (ref) {
      ref.current = mapInstance.current;
    }

    mapInstance.current.on("load", () => {
      console.log("Carte chargée");
      if (onMapLoad) {
        onMapLoad();
      }
      addGpxLayer(mapInstance.current!);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        if (typeof ref === "function") {
          ref(null);
        } else if (ref) {
          ref.current = null;
        }
      }
    };
  }, [
    center,
    zoom,
    selectedStyle,
    backgroundColor,
    ref,
    onMapLoad,
    gpxGeoJson,
  ]);

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
      {props.showGrid && (
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
});

PreviewMap.displayName = "PreviewMap";

export default PreviewMap;
