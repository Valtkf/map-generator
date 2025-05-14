"use client";

import React, { useState, useCallback } from "react";
import FileUpload from "./inputs/FileUpload";
import ColorSelector from "./inputs/ColorSelector";
import GenerateMapButton from "./buttons/GenerateMapButton";
import PreviewMap from "./map/PreviewMap";
import { MapControls } from "./map/controls/MapControls";
import { GeoJson, calculateBounds } from "../utils/gpx";
import CitySearch from "./inputs/CitySearch";
import FormatSelector, { ExportFormat } from "./inputs/FormatSelector";
import LineWidthSelector from "./inputs/LineWidthSelector";

// Types
interface MapState {
  center: [number, number];
  zoom: number;
  backgroundColor: string;
  geoJson: GeoJson | null;
  elevationData: {
    elevation: number[];
    distance: number[];
  } | null;
}

const CardMap = () => {
  // États
  const [mapState, setMapState] = useState<MapState>({
    center: [0, 0],
    zoom: 1,
    backgroundColor: "#FFFFFF",
    geoJson: null,
    elevationData: null,
  });
  const [showGrid, setShowGrid] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>("minimaliste");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("svg");
  const [lineWidth, setLineWidth] = useState(2);

  // Fonction pour calculer la distance entre deux points
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
  };

  // Gestionnaires d'événements
  const handleGpxFile = useCallback((parsedGeoJson: GeoJson) => {
    const { center, zoom } = calculateBounds(parsedGeoJson);

    // Extraction des données d'élévation et calcul des distances
    const elevationData = {
      elevation: [] as number[],
      distance: [] as number[],
    };

    let totalDistance = 0;
    let prevLat = 0;
    let prevLon = 0;
    let isFirstPoint = true;

    parsedGeoJson.features.forEach((feature) => {
      if (feature.geometry.type === "LineString") {
        feature.geometry.coordinates.forEach((coord) => {
          const [lon, lat, ele] = coord;

          if (isFirstPoint) {
            prevLat = lat;
            prevLon = lon;
            isFirstPoint = false;
          } else {
            totalDistance += calculateDistance(prevLat, prevLon, lat, lon);
            prevLat = lat;
            prevLon = lon;
          }

          elevationData.elevation.push(ele);
          elevationData.distance.push(totalDistance);
        });
      }
    });

    setMapState((prev) => ({
      ...prev,
      geoJson: parsedGeoJson,
      center,
      zoom,
      elevationData,
    }));
  }, []);

  const handleMove = (direction: "up" | "down" | "left" | "right") => {
    console.log(`handleMove called with direction: ${direction}`);
    console.log(`Current mapState:`, mapState);

    // Ajustement du pas en fonction du zoom
    // Plus le zoom est élevé, plus le pas est petit
    const baseStep = 0.1;
    const step = baseStep / Math.pow(1.5, mapState.zoom - 1);
    console.log(`Calculated step: ${step}`);

    setMapState((prev) => {
      const [lng, lat] = prev.center;
      const newState = { ...prev };

      switch (direction) {
        case "up":
          newState.center = [lng, Math.min(90, lat + step)];
          break;
        case "down":
          newState.center = [lng, Math.max(-90, lat - step)];
          break;
        case "left":
          newState.center = [Math.max(-180, lng - step), lat];
          break;
        case "right":
          newState.center = [Math.min(180, lng + step), lat];
          break;
      }

      console.log(`New mapState:`, newState);
      return newState;
    });
  };

  const handleZoomChange = useCallback((newZoom: number) => {
    setMapState((prev) => ({
      ...prev,
      zoom: Math.max(1, Math.min(20, newZoom)),
    }));
  }, []);

  const handleBackgroundChange = useCallback((color: string) => {
    setMapState((prev) => ({ ...prev, backgroundColor: color }));
  }, []);

  const handleGenerateMap = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  }, []);

  const handleCitySelect = useCallback((newCenter: [number, number]) => {
    setMapState((prev) => ({
      ...prev,
      center: newCenter,
      zoom: 12,
    }));
  }, []);

  const handleViewChange = useCallback(
    (newCenter: [number, number], newZoom: number) => {
      setMapState((prev) => ({
        ...prev,
        center: newCenter,
        zoom: newZoom,
      }));
    },
    []
  );

  // Extraction des valeurs
  const { center, zoom, backgroundColor, geoJson, elevationData } = mapState;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Générateur de carte
      </h1>

      <div className="flex flex-col lg:flex-row gap-20">
        {/* Panneau de gauche: Prévisualisation */}
        <div className="lg:w-1/2 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Prévisualisation</h2>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                showGrid
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {showGrid ? "Masquer grille" : "Afficher grille"}
            </button>
          </div>

          <div className="relative">
            <PreviewMap
              backgroundColor={backgroundColor}
              gpxGeoJson={
                geoJson || { type: "FeatureCollection", features: [] }
              }
              center={center}
              zoom={zoom}
              showGrid={showGrid}
              selectedStyle={selectedStyle}
              lineWidth={lineWidth}
              elevationData={elevationData}
              onViewChange={handleViewChange}
            />

            {/* Contrôles de carte superposés */}
            <div className="absolute bottom-4 right-4 bg-white bg-opacity-80 p-2 rounded-lg shadow-md">
              <MapControls
                onMove={handleMove}
                zoom={zoom}
                onZoomChange={handleZoomChange}
              />
            </div>
          </div>
        </div>

        {/* Panneau de droite: Contrôles */}
        <div className="lg:w-1/2 flex flex-col">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Données</h2>
            <FileUpload onChange={handleGpxFile} />
            <CitySearch onCitySelect={handleCitySelect} />
          </div>

          <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Apparence</h2>
            <ColorSelector
              backgroundColor={backgroundColor}
              setBackgroundColor={handleBackgroundChange}
              selectedStyle={selectedStyle}
              setSelectedStyle={setSelectedStyle}
            />
            <LineWidthSelector
              lineWidth={lineWidth}
              setLineWidth={setLineWidth}
            />
          </div>

          <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Export</h2>
            <FormatSelector
              selectedFormat={exportFormat}
              setSelectedFormat={setExportFormat}
            />

            <GenerateMapButton
              onClick={handleGenerateMap}
              center={center}
              zoom={zoom}
              gpxGeoJson={geoJson}
              isLoading={isGenerating}
              exportFormat={exportFormat}
              lineWidth={lineWidth}
              elevationData={elevationData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardMap;
