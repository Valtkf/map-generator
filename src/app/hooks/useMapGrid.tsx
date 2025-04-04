import React from "react";
import { MAP_CONFIG } from "../constants/map";

export const useMapGrid = () => {
  const renderGrid = (showGrid: boolean) => {
    if (!showGrid) return null;

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Lignes horizontales */}
        <div className="grid-lines-horizontal">
          {Array.from({ length: MAP_CONFIG.GRID.LINES }).map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute w-full border-t border-dashed border-red-500 border-opacity-30"
              style={{ top: `${(i + 1) * 20}%`, left: 0, right: 0 }}
            />
          ))}
        </div>

        {/* Lignes verticales */}
        <div className="grid-lines-vertical">
          {Array.from({ length: MAP_CONFIG.GRID.LINES }).map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute h-full border-l border-dashed border-red-500 border-opacity-30"
              style={{ left: `${(i + 1) * 20}%`, top: 0, bottom: 0 }}
            />
          ))}
        </div>

        {/* Lignes centrales */}
        <div
          className="absolute top-1/2 w-full border-t-2 border-dashed border-red-500 border-opacity-40"
          style={{ transform: "translateY(-1px)" }}
        />
        <div
          className="absolute left-1/2 h-full border-l-2 border-dashed border-red-500 border-opacity-40"
          style={{ transform: "translateX(-1px)" }}
        />

        {/* Point central */}
        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-red-500 bg-opacity-60 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
      </div>
    );
  };

  return { renderGrid };
};
