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

// Définir l'interface pour les props de CoordinateInputs
interface CoordinateInputsProps {
  center: [number, number];
  zoom: number;
  onCenterChange: (center: [number, number]) => void;
  onZoomChange: (zoom: number) => void;
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

  // Extraction des valeurs pour plus de lisibilité
  const { center, zoom, backgroundColor, geoJson } = mapState;

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Générateur de carte</h1>

      <FileUpload onChange={handleGpxFile} />
      <ColorSelector
        backgroundColor={backgroundColor}
        setBackgroundColor={handleBackgroundChange}
      />

      <GenerateMapButton
        onClick={() => {
          /* Logique pour générer la carte à implémenter plus tard */
        }}
      />

      <CoordinateInputs
        center={center}
        zoom={zoom}
        onCenterChange={(newCenter) =>
          setMapState((prev) => ({ ...prev, center: newCenter }))
        }
        onZoomChange={(newZoom) =>
          setMapState((prev) => ({ ...prev, zoom: newZoom }))
        }
      />

      <MapControls onMove={handleMove} onZoom={handleZoom} />

      {/* Bouton de grille au-dessus de la carte, aligné à droite */}
      <div className="w-full max-w-2xl flex justify-end mb-2">
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
      />
    </div>
  );
};

// Composant pour les entrées de coordonnées
const CoordinateInputs = ({
  center,
  zoom,
  onCenterChange,
  onZoomChange,
}: CoordinateInputsProps) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">
        Position de la carte
      </label>
      <div className="flex gap-4 mt-2">
        <input
          type="number"
          value={center[0]}
          onChange={(e) =>
            onCenterChange([parseFloat(e.target.value), center[1]])
          }
          placeholder="Longitude"
          className="border p-2"
        />
        <input
          type="number"
          value={center[1]}
          onChange={(e) =>
            onCenterChange([center[0], parseFloat(e.target.value)])
          }
          placeholder="Latitude"
          className="border p-2"
        />
        <input
          type="number"
          value={zoom}
          onChange={(e) =>
            onZoomChange(Math.max(0, Math.min(22, parseFloat(e.target.value))))
          }
          placeholder="Zoom"
          className="border p-2"
        />
      </div>
    </div>
  );
};

export default CardMap;
