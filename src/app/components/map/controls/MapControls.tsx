import React from "react";

interface MapControlsProps {
  onMove: (direction: "up" | "down" | "left" | "right") => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onMove,
  zoom,
  onZoomChange,
}) => {
  return (
    <div className="flex gap-4 mb-4">
      {/* Contrôles directionnels */}
      <div className="grid grid-cols-3 gap-1">
        <div className="col-start-2">
          <button
            onClick={() => onMove("up")}
            className="cursor-pointer w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100"
            aria-label="Déplacer vers le haut"
          >
            ↑
          </button>
        </div>
        <div className="col-start-1 row-start-2">
          <button
            onClick={() => onMove("left")}
            className="cursor-pointer w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100"
            aria-label="Déplacer vers la gauche"
          >
            ←
          </button>
        </div>
        <div className="col-start-3 row-start-2">
          <button
            onClick={() => onMove("right")}
            className="cursor-pointer w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100"
            aria-label="Déplacer vers la droite"
          >
            →
          </button>
        </div>
        <div className="col-start-2 row-start-3">
          <button
            onClick={() => onMove("down")}
            className="cursor-pointer w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100"
            aria-label="Déplacer vers le bas"
          >
            ↓
          </button>
        </div>
      </div>

      {/* Contrôle de zoom avec slider */}
      <div className="flex flex-col gap-1 items-center">
        <input
          type="range"
          min="1"
          max="20"
          step="0.1"
          value={zoom}
          onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          aria-label="Niveau de zoom"
        />
        <div className="text-xs text-gray-600">{zoom.toFixed(1)}x</div>
      </div>
    </div>
  );
};
