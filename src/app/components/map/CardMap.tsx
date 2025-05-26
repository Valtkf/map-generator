import React, { useRef, useState } from "react";
import { ExportFormat } from "../inputs/FormatSelector";
import { MAP_STYLES } from "../inputs/ColorSelector";
import StaticMapPreview from "./PreviewMap";
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

  // À adapter selon où tu stockes le styleId et le token
  const styleId = "tonuser/abc123xyz"; // Remplace par ton vrai styleId
  const accessToken = "TON_TOKEN_MAPBOX"; // Remplace par ton vrai token
  const width = 550; // ou 3508 pour export HD
  const height = 778; // ou 4961 pour export HD

  return (
    <div>
      <StaticMapPreview
        styleId={styleId}
        accessToken={accessToken}
        center={center}
        zoom={zoom}
        width={width}
        height={height}
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
