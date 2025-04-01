import React, { useEffect, useRef } from "react";

const PreviewArea = ({ backgroundColor }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Exemple de dessin sur le canvas (vous pouvez remplacer cela par votre logique de carte)
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)"; // Couleur de la carte (exemple)
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

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
        width={400}
        height={600}
        style={{ width: "100%", height: "100%" }}
      />
      <p className="text-gray-500 absolute">Aperçu de la carte ici</p>
      {/* Logique d'affichage de la carte et du tracé GPX à implémenter plus tard */}
    </div>
  );
};

export default PreviewArea;
