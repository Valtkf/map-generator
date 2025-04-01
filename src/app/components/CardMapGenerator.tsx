"use client";

import React, { useState } from "react";
import TextInput from "./TextInput";
import FileUpload from "./FileUpload";
import ColorSelector from "./ColorSelector";
import ZoomSelector from "./ZoomSelector";
import PreviewArea from "./PreviewArea";
import GenerateMapButton from "./GenerateMapButton";

const CardMap = () => {
  const [raceName, setRaceName] = useState("");
  const [gpxFile, setGpxFile] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [zoomLevel, setZoomLevel] = useState(100);

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Générateur de carte</h1>

      <TextInput
        value={raceName}
        onChange={(e) => setRaceName(e.target.value)}
      />
      <FileUpload onChange={(e) => setGpxFile(e.target.files[0])} />
      <ColorSelector
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
      />
      <ZoomSelector zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} />
      <PreviewArea backgroundColor={backgroundColor} />
      <GenerateMapButton
        onClick={() => {
          /* Logique pour générer la carte à implémenter plus tard */
        }}
      />
    </div>
  );
};

export default CardMap;
