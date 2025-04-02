interface MapControlsProps {
  onMove: (direction: "up" | "down" | "left" | "right") => void;
  onZoom: (type: "in" | "out") => void;
}

export const MapControls = ({ onMove, onZoom }: MapControlsProps) => {
  return (
    <div className="flex gap-4 mb-4">
      {/* Contrôles directionnels */}
      <div className="grid grid-cols-3 gap-1">
        <div className="col-start-2">
          <button
            onClick={() => onMove("up")}
            className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100"
            aria-label="Déplacer vers le haut"
          >
            ↑
          </button>
        </div>
        <div className="col-start-1 row-start-2">
          <button
            onClick={() => onMove("left")}
            className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100"
            aria-label="Déplacer vers la gauche"
          >
            ←
          </button>
        </div>
        <div className="col-start-3 row-start-2">
          <button
            onClick={() => onMove("right")}
            className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100"
            aria-label="Déplacer vers la droite"
          >
            →
          </button>
        </div>
        <div className="col-start-2 row-start-3">
          <button
            onClick={() => onMove("down")}
            className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100"
            aria-label="Déplacer vers le bas"
          >
            ↓
          </button>
        </div>
      </div>

      {/* Contrôles de zoom */}
      <div className="flex flex-col gap-1">
        <button
          onClick={() => onZoom("in")}
          className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100 text-lg font-bold"
          aria-label="Zoomer"
        >
          +
        </button>
        <button
          onClick={() => onZoom("out")}
          className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100 text-lg font-bold"
          aria-label="Dézoomer"
        >
          -
        </button>
      </div>
    </div>
  );
};
