import React, { useRef, useState } from "react";
import { ExportFormat } from "../inputs/FormatSelector";
import { generateMapExport } from "../../services/mapExport";
import { MAP_STYLES } from "../inputs/ColorSelector";
import PreviewMap from "./PreviewMap";
import { GeoJson } from "../../utils/gpx";

import "mapbox-gl/dist/mapbox-gl.css";

interface CardMapProps {
  gpxGeoJson: GeoJson | null;
  center: [number, number];
  zoom: number;
  lineWidth: number;
}

export const CardMap = ({
  gpxGeoJson,
  center,
  zoom,
  lineWidth,
}: CardMapProps) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("png");
  const [selectedStyle, setSelectedStyle] = useState("vintage");

  const handleExport = async () => {
    if (!mapRef.current) return;

    // Créer une promesse qui se résout quand la carte est chargée
    const waitForMap = new Promise<void>((resolve) => {
      const map = mapRef.current;
      if (!map) return;

      if (map.loaded() && map.isStyleLoaded()) {
        resolve();
      } else {
        map.once("styledata", () => {
          if (map.isStyleLoaded()) resolve();
        });
      }
    });

    await waitForMap;
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Augmenter le délai

    try {
      const map = mapRef.current;
      if (!map) return;

      const canvas = map.getCanvas();
      const result = await generateMapExport(
        canvas,
        selectedFormat,
        selectedStyle
      );

      // Créer un lien de téléchargement
      const link = document.createElement("a");
      const url =
        result.content instanceof Blob
          ? URL.createObjectURL(result.content)
          : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
              result.content
            )}`;

      link.href = url;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (result.content instanceof Blob) URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
    }
  };

  return (
    <div>
      <PreviewMap
        ref={mapRef}
        backgroundColor="#FFFFFF"
        gpxGeoJson={gpxGeoJson}
        center={center}
        zoom={zoom}
        selectedStyle={selectedStyle}
        isExport={true}
        lineWidth={lineWidth}
      />
      <select
        value={selectedFormat}
        onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
      >
        <option value="png">PNG</option>
        <option value="jpeg">JPEG</option>
        <option value="svg">SVG</option>
      </select>
      <select
        value={selectedStyle}
        onChange={(e) => setSelectedStyle(e.target.value)}
      >
        {MAP_STYLES.map((style) => (
          <option key={style.id} value={style.id}>
            {style.name}
          </option>
        ))}
      </select>
      <button onClick={handleExport}>Exporter</button>
    </div>
  );
};
