"use client";

import React, { useState, useCallback } from "react";
import FileUpload from "./inputs/FileUpload";
import ColorSelector from "./inputs/ColorSelector";
import GenerateMapButton from "./buttons/GenerateMapButton";
import PreviewMap from "./map/PreviewMap";
import { MapControls } from "./map/MapControls";
import { GeoJson, calculateBounds } from "../utils/gpx";

// Types
interface MapState {
  center: [number, number];
  zoom: number;
  backgroundColor: string;
  geoJson: GeoJson | null;
}

const CardMap = () => {
  // État regroupé
  const [mapState, setMapState] = useState<MapState>({
    center: [0, 0],
    zoom: 1,
    backgroundColor: "#FFFFFF",
    geoJson: null,
  });

  // Nouvel état pour la grille
  const [showGrid, setShowGrid] = useState(false);

  // Nouvel état pour la génération de la carte
  const [isGenerating, setIsGenerating] = useState(false);

  // Nouvel état pour le style de carte
  const [selectedStyle, setSelectedStyle] = useState<string>("minimaliste");

  // Gestionnaires d'événements avec useCallback
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
    // Réinitialiser l'état après un délai pour l'animation
    setTimeout(() => setIsGenerating(false), 3000);
  }, []);

  // Extraction des valeurs pour plus de lisibilité
  const { center, zoom, backgroundColor, geoJson } = mapState;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Conteneur principal avec flex */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Colonne de gauche avec le titre et les contrôles - réduire la largeur */}
        <div className="flex flex-col md:w-1/4">
          <h1 className="text-2xl font-bold mb-6">Générateur de carte</h1>

          <FileUpload onChange={handleGpxFile} />
          <ColorSelector
            backgroundColor={backgroundColor}
            setBackgroundColor={handleBackgroundChange}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
          />

          <GenerateMapButton
            onClick={handleGenerateMap}
            center={center}
            zoom={zoom}
            gpxGeoJson={geoJson}
            isLoading={isGenerating}
            backgroundColor={backgroundColor}
          />

          <MapControls onMove={handleMove} onZoom={handleZoom} />
        </div>

        {/* Colonne de droite avec la carte - augmenter la largeur */}
        <div className="md:w-3/4">
          {/* Bouton de grille au-dessus de la carte, aligné à droite */}
          <div className="w-full flex justify-end mb-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`cursor-pointer px-3 py-1 text-sm rounded ${
                showGrid
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {showGrid ? "Masquer grille" : "Afficher grille"}
            </button>
          </div>

          {/* Carte */}
          <PreviewMap
            backgroundColor={backgroundColor}
            gpxGeoJson={geoJson || { type: "FeatureCollection", features: [] }}
            center={center}
            zoom={zoom}
            showGrid={showGrid}
            selectedStyle={selectedStyle}
          />
        </div>
      </div>
    </div>
  );
};

export default CardMap;
