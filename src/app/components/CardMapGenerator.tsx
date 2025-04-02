"use client";

import React, { useState } from "react";
import TextInput from "./TextInput";
import FileUpload from "./FileUpload";
import ColorSelector from "./ColorSelector";
import ZoomSelector from "./ZoomSelector";
import GenerateMapButton from "./GenerateMapButton";
import PreviewMap from "./PreviewMap";
import { generateMapboxPreviewUrl } from "../utils/mapbox";

const CardMap = () => {
  const [raceName, setRaceName] = useState("");
  // const [gpxFile, setGpxFile] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
  const [mapZoom, setMapZoom] = useState(1);

  const mapboxUrl = generateMapboxPreviewUrl({
    center: mapCenter,
    zoom: mapZoom,
    token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "",
  });

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Générateur de carte</h1>

      <TextInput
        value={raceName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setRaceName(e.target.value)
        }
      />
      <FileUpload onChange={() => void 0} />
      <ColorSelector
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
      />
      <ZoomSelector zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
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
      <PreviewMap
        mapboxStaticUrl={mapboxUrl}
        backgroundColor={backgroundColor}
        gpxGeoJson={{
          features: [],
        }}
      />
    </div>
  );
};

export default CardMap;
