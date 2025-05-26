import React, { useRef, useState } from "react";
import { ExportFormat } from "../inputs/FormatSelector";
import { MAP_STYLES } from "../inputs/ColorSelector";
import PreviewMap from "./PreviewMap";
// import { GeoJson } from "../../utils/gpx";

import "mapbox-gl/dist/mapbox-gl.css";

interface CardMapProps {
  // gpxGeoJson: GeoJson | null;
  center: [number, number];
  zoom: number;
  // lineWidth: number;
}

export const CardMap = ({
  // gpxGeoJson,
  center,
  zoom,
}: CardMapProps) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("png");
  const [selectedStyle, setSelectedStyle] = useState("vintage");

  const handleExport = async () => {
    if (!mapRef.current) return;

    // Attendre que la carte soit complètement chargée (événement 'idle')
    await new Promise<void>((resolve) => {
      const map = mapRef.current;
      if (map && map.loaded() && map.isStyleLoaded()) resolve();
      else if (map) map.once("idle", () => resolve());
    });

    // Délai de sécurité pour Safari (rendu final)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const map = mapRef.current;
      if (!map) return;

      const canvas = map.getCanvas();

      // Utiliser toDataURL (plus fiable sur Safari)
      const dataUrl = canvas.toDataURL("image/png");

      // Création et déclenchement du téléchargement
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "carte.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert(
        "Export impossible sur ce navigateur. Essayez sur Chrome ou Firefox."
      );
      console.error("Erreur lors de l'export:", error);
    }
  };

  return (
    <div>
      <PreviewMap
        ref={mapRef}
        backgroundColor="#ffffff"
        gpxGeoJson={null}
        center={center}
        zoom={zoom}
        selectedStyle={selectedStyle}
        lineWidth={2}
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
