import React, { useEffect, useRef, forwardRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { GeoJson } from "../../utils/gpx";

import { useMapStyle } from "../../hooks/map/useMapStyle";
import { MapGrid } from "./grid/MapGrid";
import { RouteLayer } from "./layers/RouteLayer";

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
  } = props;

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const mapStyle = useMapStyle(selectedStyle, backgroundColor);
  const isMapReady = useRef<boolean>(false);

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

    mapInstance.current.setCenter(center);
    mapInstance.current.setZoom(zoom);
  }, [center, zoom]);

  return (
    <div
      style={{
        backgroundColor:
          selectedStyle === "trace-only" ? backgroundColor : undefined,
      }}
      className="ml-20 relative w-[400px] h-[610px] md:h-[610px] border border-gray-300"
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
        />
      )}
    </div>
  );
});

PreviewMap.displayName = "PreviewMap";

export default PreviewMap;
