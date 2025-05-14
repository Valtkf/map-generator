import React, { useEffect, useRef, forwardRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { GeoJson } from "../../utils/gpx";

import { useMapStyle } from "../../hooks/map/useMapStyle";
import { MapGrid } from "./grid/MapGrid";
import { RouteLayer } from "./layers/RouteLayer";
import { ElevationProfile, exportElevationProfile } from "./ElevationProfile";
import { MAP_STYLES } from "../inputs/ColorSelector";

interface PreviewMapProps {
  backgroundColor: string;
  gpxGeoJson: GeoJson | null;
  center: [number, number];
  zoom: number;
  showGrid?: boolean;
  selectedStyle: string;
  isExport?: boolean;
  onMapLoad?: () => void;
  lineWidth: number;
  elevationData?: {
    elevation: number[];
    distance: number[];
  } | null;
  onViewChange?: (center: [number, number], zoom: number) => void;
}
// Type pour le style personnalisé

const PreviewMap = forwardRef<mapboxgl.Map, PreviewMapProps>((props, ref) => {
  const {
    center,
    zoom,
    selectedStyle,
    backgroundColor,
    gpxGeoJson,
    onMapLoad,
    showGrid = false,
    isExport = false,
    lineWidth,
    elevationData,
    onViewChange,
  } = props;

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const mapStyle = useMapStyle(selectedStyle, backgroundColor);
  const isMapReady = useRef<boolean>(false);
  const profileId = "preview-elevation-profile";

  const handleDownloadElevationProfile = () => {
    if (elevationData) {
      exportElevationProfile(
        profileId,
        `profil-altimetrique-${new Date().toISOString().split("T")[0]}.png`
      );
    }
  };

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style:
        typeof mapStyle === "string" ? mapStyle : (mapStyle as mapboxgl.Style),
      center,
      zoom,
      bearing: 0,
      pitch: 0,
    });

    map.on("load", () => {
      isMapReady.current = true;
      if (onMapLoad) onMapLoad();
    });

    // Ajouter les écouteurs d'événements pour le mouvement et le zoom
    map.on("moveend", () => {
      if (onViewChange) {
        const newCenter = map.getCenter().toArray() as [number, number];
        const newZoom = map.getZoom();

        // Ne mettre à jour que si les valeurs ont réellement changé
        if (
          newCenter[0] !== center[0] ||
          newCenter[1] !== center[1] ||
          newZoom !== zoom
        ) {
          onViewChange(newCenter, newZoom);
        }
      }
    });

    mapInstance.current = map;

    if (typeof ref === "function") {
      ref(map);
    } else if (ref) {
      ref.current = map;
    }

    return () => {
      isMapReady.current = false;
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
  }, []);

  // Gérer les changements de style
  useEffect(() => {
    if (!mapInstance.current) return;

    mapInstance.current.setStyle(
      typeof mapStyle === "string" ? mapStyle : (mapStyle as mapboxgl.Style)
    );
  }, [mapStyle]);

  // Gérer les changements de position et zoom
  useEffect(() => {
    if (!mapInstance.current) return;

    const currentCenter = mapInstance.current.getCenter().toArray() as [
      number,
      number
    ];
    const currentZoom = mapInstance.current.getZoom();

    // Ne mettre à jour que si les valeurs ont réellement changé
    if (
      currentCenter[0] !== center[0] ||
      currentCenter[1] !== center[1] ||
      currentZoom !== zoom
    ) {
      mapInstance.current.setCenter(center);
      mapInstance.current.setZoom(zoom);
    }
  }, [center, zoom]);

  return (
    <div
      style={{
        backgroundColor:
          selectedStyle === "trace-only" ? backgroundColor : undefined,
      }}
      className="ml-20 relative w-[550px] h-[778px] md:h-[778px] border border-gray-300"
    >
      <div ref={mapContainer} className="w-full h-full" />
      <MapGrid visible={showGrid} />
      {mapInstance.current && (
        <RouteLayer
          map={mapInstance.current}
          gpxGeoJson={gpxGeoJson}
          selectedStyle={selectedStyle}
          isExport={isExport}
          isMapReady={isMapReady.current}
          lineWidth={lineWidth}
        />
      )}
      {elevationData && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-[160px] w-[90%] pointer-events-none flex justify-center items-end">
          <ElevationProfile
            gpxData={elevationData}
            isMinimal={true}
            traceColor={
              MAP_STYLES.find((s) => s.id === selectedStyle)?.traceColor
            }
            id={profileId}
          />
          {!isExport && (
            <button
              onClick={handleDownloadElevationProfile}
              className="absolute bottom-0 right-0 bg-white bg-opacity-80 p-2 rounded-lg shadow-md text-sm pointer-events-auto"
              title="Télécharger le profil altimétrique"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
});

PreviewMap.displayName = "PreviewMap";

export default PreviewMap;
