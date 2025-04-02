interface MapControlsProps {
  onMove: (direction: "up" | "down" | "left" | "right") => void;
  onZoom: (type: "in" | "out") => void;
}

export const MapControls = ({ onMove, onZoom }: MapControlsProps) => {
  return (
    <div className="grid grid-cols-3 gap-2 p-2">
      <button onClick={() => onMove("up")} className="p-2 border">
        ↑
      </button>
      <button onClick={() => onZoom("in")} className="p-2 border">
        +
      </button>
      <button onClick={() => onMove("right")} className="p-2 border">
        →
      </button>
      <button onClick={() => onMove("left")} className="p-2 border">
        ←
      </button>
      <button onClick={() => onZoom("out")} className="p-2 border">
        -
      </button>
      <button onClick={() => onMove("down")} className="p-2 border">
        ↓
      </button>
    </div>
  );
};
