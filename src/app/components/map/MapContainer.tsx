import React from "react";

interface MapContainerProps {
  backgroundColor?: string;
  selectedStyle: string;
  children: React.ReactNode;
}

export const MapContainer = ({
  backgroundColor,
  selectedStyle,
  children,
}: MapContainerProps) => {
  // Dimensions A3 : 297mm × 420mm
  // Augmentons à une largeur de 600px tout en gardant le ratio
  const previewWidth = 600;
  const ratio = 420 / 297; // ≈ 1.414
  const previewHeight = Math.round(previewWidth * ratio); // ≈ 849px

  return (
    <div
      style={{
        backgroundColor:
          selectedStyle === "trace-only" ? backgroundColor : undefined,
        width: `${previewWidth}px`,
        height: `${previewHeight}px`,
      }}
      className="ml-20 relative border border-gray-300"
    >
      {children}
    </div>
  );
};
