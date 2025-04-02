import React, { useEffect, useRef } from "react";

interface PreviewMapProps {
  mapboxStaticUrl: string;
  backgroundColor: string;
  gpxGeoJson: {
    features: Array<{
      geometry: {
        type: string;
        coordinates: [number, number][];
      };
    }>;
  };
}

const PreviewMap = ({
  mapboxStaticUrl,
  backgroundColor,
  gpxGeoJson,
}: PreviewMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fonction de projection simplifiée : à adapter selon le rendu Mapbox
  const project = (
    lng: number,
    lat: number,
    width: number,
    height: number
  ): [number, number] => {
    // Cette implémentation suppose une correspondance linéaire pour l'exemple
    // Dans un cas réel, il faut tenir compte du centre et du zoom utilisés pour l'image statique
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return [x, y];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Chargement de l'image de fond depuis Mapbox Static API
    const image = new Image();
    image.crossOrigin = "anonymous"; // pour éviter les problèmes de CORS
    image.src = mapboxStaticUrl;
    image.onload = () => {
      // Affichage de l'image de fond sur le canvas
      ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);

      // Si un tracé GPX (converti en GeoJSON) est fourni, on le dessine
      if (gpxGeoJson && gpxGeoJson.features) {
        ctx.beginPath();
        gpxGeoJson.features.forEach((feature) => {
          if (feature.geometry.type === "LineString") {
            const coords = feature.geometry.coordinates;
            coords.forEach((coord, index) => {
              const [x, y] = project(
                coord[0],
                coord[1],
                canvasWidth,
                canvasHeight
              );
              if (index === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            });
          }
        });
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    };

    // Gestion d'erreur lors du chargement de l'image
    image.onerror = () => {
      console.error("Erreur lors du chargement de l'image Mapbox");
    };
  }, [mapboxStaticUrl, gpxGeoJson]);

  return (
    <div
      style={{ backgroundColor }}
      className="relative w-full max-w-md h-64 border border-gray-300 flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        className="maplibregl-canvas"
        tabIndex={0}
        aria-label="Map"
        role="region"
        width={600}
        height={800}
        style={{ width: "100%", height: "100%" }}
      />
      <p className="text-gray-500 absolute">Aperçu de la carte</p>
    </div>
  );
};

export default PreviewMap;
