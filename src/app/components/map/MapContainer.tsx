import React from "react";
import { MAP_CONFIG } from "../../constants/map";

interface MapContainerProps {
  backgroundColor?: string;
  selectedStyle: string;
  children: React.ReactNode;
}

export const MapContainer = ({
  backgroundColor,
  selectedStyle,
  children,
}: MapContainerProps) => (
  <div
    style={{
      backgroundColor:
        selectedStyle === "trace-only" ? backgroundColor : undefined,
    }}
    className="ml-20 relative w-[400px] h-[610px] md:h-[610px] border border-gray-300"
  >
    {children}
  </div>
);
