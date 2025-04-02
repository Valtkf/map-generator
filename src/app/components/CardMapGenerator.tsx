"use client";

import React, { useState } from "react";

import FileUpload from "./FileUpload";
import ColorSelector from "./ColorSelector";

import GenerateMapButton from "./GenerateMapButton";
import PreviewMap from "./PreviewMap";
import { GeoJson, calculateBounds } from "../utils/gpx";
import { MapControls } from "./MapControls";

const CardMap = () => {
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
  const [mapZoom, setMapZoom] = useState(1);
  const [geoJson, setGeoJson] = useState<GeoJson | null>(null);

  const handleGpxFile = (parsedGeoJson: GeoJson) => {
    console.log("GeoJSON parsé:", parsedGeoJson);
    setGeoJson(parsedGeoJson);
    const { center, zoom } = calculateBounds(parsedGeoJson);
    console.log("Centre calculé:", center, "Zoom calculé:", zoom);
    setMapCenter(center);
    setMapZoom(zoom);
  };

  const handleMove = (direction: "up" | "down" | "left" | "right") => {
    const step = 0.01;
    switch (direction) {
      case "up":
        setMapCenter([mapCenter[0], mapCenter[1] + step]);
        break;
      case "down":
        setMapCenter([mapCenter[0], mapCenter[1] - step]);
        break;
      case "left":
        setMapCenter([mapCenter[0] - step, mapCenter[1]]);
        break;
      case "right":
        setMapCenter([mapCenter[0] + step, mapCenter[1]]);
        break;
    }
  };

  const handleZoom = (type: "in" | "out") => {
    const newZoom = type === "in" ? mapZoom + 0.5 : mapZoom - 0.5;
    setMapZoom(Math.max(1, Math.min(20, newZoom)));
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Générateur de carte</h1>

      <FileUpload onChange={handleGpxFile} />
      <ColorSelector
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
      />

      <GenerateMapButton
        onClick={() => {
          /* Logique pour générer la carte à implémenter plus tard */
        }}
      />
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Position de la carte
        </label>
        <div className="flex gap-4 mt-2">
          <input
            type="number"
            value={mapCenter[0]}
            onChange={(e) =>
              setMapCenter([parseFloat(e.target.value), mapCenter[1]])
            }
            placeholder="Longitude"
            className="border p-2"
          />
          <input
            type="number"
            value={mapCenter[1]}
            onChange={(e) =>
              setMapCenter([mapCenter[0], parseFloat(e.target.value)])
            }
            placeholder="Latitude"
            className="border p-2"
          />
          <input
            type="number"
            value={mapZoom}
            onChange={(e) =>
              setMapZoom(Math.max(0, Math.min(22, parseFloat(e.target.value))))
            }
            placeholder="Zoom"
            className="border p-2"
          />
        </div>
      </div>
      <MapControls onMove={handleMove} onZoom={handleZoom} />
      <PreviewMap
        backgroundColor={backgroundColor}
        gpxGeoJson={geoJson || { type: "FeatureCollection", features: [] }}
        center={mapCenter}
        zoom={mapZoom}
      />
    </div>
  );
};

export default CardMap;
