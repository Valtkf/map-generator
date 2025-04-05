import React from "react";

// Définir les styles de carte disponibles
export type MapStyle = {
  id: string;
  name: string;
  traceColor: string;
  url?: string;
};

export const MAP_STYLES: MapStyle[] = [
  {
    id: "vintage",
    name: "Vintage",
    url: "mapbox://styles/pyr25/cm91uzik8000f01sfb70d7qu7",
    traceColor: "#da9887",
  },
  {
    id: "azure",
    name: "Azuré",
    url: "mapbox://styles/pyr25/cm91vjgbc000i01sf0ow0he8n",
    traceColor: "#638b98",
  },
  {
    id: "monochrome",
    name: "Minimaliste",
    url: "mapbox://styles/pyr25/cm91ui4lv000c01qyf9wyexrg",
    traceColor: "#020202",
  },
  {
    id: "trace-only",
    name: "Solitaire",
    traceColor: "#000000",
  },
];

interface ColorSelectorProps {
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  selectedStyle: string;
  setSelectedStyle: (styleId: string) => void;
}

const ColorSelector = ({
  backgroundColor,
  setBackgroundColor,
  selectedStyle,
  setSelectedStyle,
}: ColorSelectorProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Style de carte</h2>

      {/* Sélecteur de style de carte */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {MAP_STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => setSelectedStyle(style.id)}
            className={`p-2 text-sm rounded transition-colors ${
              selectedStyle === style.id
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            {style.name}
          </button>
        ))}
      </div>

      {/* Sélecteur de couleur de fond (pour le style "tracé uniquement") */}
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Couleur de fond</h3>
        <div className="flex items-center">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer mr-2"
          />
          <span className="text-sm text-gray-600">{backgroundColor}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          (Utilisé pour le style &quot;Tracé uniquement&quot;)
        </p>
      </div>
    </div>
  );
};

export default ColorSelector;
