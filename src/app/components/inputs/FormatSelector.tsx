import React from "react";

export type ExportFormat = "svg" | "png" | "jpeg";

interface FormatSelectorProps {
  selectedFormat: ExportFormat;
  setSelectedFormat: (format: ExportFormat) => void;
}

const FormatSelector = ({
  selectedFormat,
  setSelectedFormat,
}: FormatSelectorProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Format d&apos;export</h2>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setSelectedFormat("svg")}
          className={`p-2 text-sm rounded transition-colors ${
            selectedFormat === "svg"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          SVG
        </button>
        <button
          onClick={() => setSelectedFormat("png")}
          className={`p-2 text-sm rounded transition-colors ${
            selectedFormat === "png"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          PNG
        </button>
        <button
          onClick={() => setSelectedFormat("jpeg")}
          className={`p-2 text-sm rounded transition-colors ${
            selectedFormat === "jpeg"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          JPEG
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {selectedFormat === "svg" &&
          "Format vectoriel idéal pour l'édition (Illustrator, Figma)"}
        {selectedFormat === "png" && "Format avec transparence, bonne qualité"}
        {selectedFormat === "jpeg" && "Format compressé, fichier plus léger"}
      </p>
    </div>
  );
};

export default FormatSelector;
