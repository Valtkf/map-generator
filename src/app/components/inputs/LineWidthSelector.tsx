import React from "react";

interface LineWidthSelectorProps {
  lineWidth: number;
  setLineWidth: (width: number) => void;
}

const LineWidthSelector = ({
  lineWidth,
  setLineWidth,
}: LineWidthSelectorProps) => {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">Épaisseur du tracé</h2>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min="1"
          max="10"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-600">{lineWidth}px</span>
      </div>
    </div>
  );
};

export default LineWidthSelector;
