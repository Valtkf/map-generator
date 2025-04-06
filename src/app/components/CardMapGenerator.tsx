"use client";

import React, { useState, useCallback } from "react";
import FileUpload from "./inputs/FileUpload";
import ColorSelector from "./inputs/ColorSelector";
import GenerateMapButton from "./buttons/GenerateMapButton";
import PreviewMap from "./map/PreviewMap";
import { MapControls } from "./map/MapControls";
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
}

const CardMap = () => {
  // États
  const [mapState, setMapState] = useState<MapState>({
    center: [0, 0],
    zoom: 1,
    backgroundColor: "#FFFFFF",
    geoJson: null,
  });
  const [showGrid, setShowGrid] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>("minimaliste");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("svg");
  const [lineWidth, setLineWidth] = useState(2);

  // Gestionnaires d'événements
  const handleGpxFile = useCallback((parsedGeoJson: GeoJson) => {
    const { center, zoom } = calculateBounds(parsedGeoJson);
    setMapState((prev) => ({
      ...prev,
      geoJson: parsedGeoJson,
      center,
      zoom,
    }));
  }, []);

  const handleMove = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      const step = 0.01;
      setMapState((prev) => {
        const [lng, lat] = prev.center;
        let newCenter: [number, number] = [lng, lat];

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
        }

        return { ...prev, center: newCenter };
      });
    },
    []
  );

  const handleZoom = useCallback((type: "in" | "out") => {
    setMapState((prev) => {
      const newZoom = type === "in" ? prev.zoom + 0.5 : prev.zoom - 0.5;
      return { ...prev, zoom: Math.max(1, Math.min(20, newZoom)) };
    });
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

  // Extraction des valeurs
  const { center, zoom, backgroundColor, geoJson } = mapState;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Générateur de carte
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
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
            />

            {/* Contrôles de carte superposés */}
            <div className="absolute bottom-4 right-4 bg-white bg-opacity-80 p-2 rounded-lg shadow-md">
              <MapControls onMove={handleMove} onZoom={handleZoom} />
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
              backgroundColor={backgroundColor}
              exportFormat={exportFormat}
              lineWidth={lineWidth}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardMap;
