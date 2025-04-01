import React from "react";

const ZoomSelector = ({ zoomLevel, setZoomLevel }) => {
  return (
    <div className="mb-4">
      <label className="block mb-2">Niveau de zoom :</label>
      <input
        type="range"
        min="50"
        max="200"
        step="10"
        value={zoomLevel}
        onChange={(e) => setZoomLevel(e.target.value)}
        className="w-full"
      />
      <span>{zoomLevel}%</span>
    </div>
  );
};

export default ZoomSelector;
