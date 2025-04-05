import { useMemo } from "react";
import { Style } from "mapbox-gl";
import { MAP_STYLES } from "../../components/inputs/ColorSelector";

interface CustomStyle extends Omit<Style, "version" | "sources" | "layers"> {
  version: 8;
  sources: Record<string, never>;
  layers: Array<{
    id: string;
    type: "background";
    paint: {
      "background-color": string;
    };
  }>;
}

const createCustomStyle = (backgroundColor: string): CustomStyle => ({
  version: 8,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": backgroundColor,
      },
    },
  ],
});

export const useMapStyle = (selectedStyle: string, backgroundColor: string) => {
  return useMemo(() => {
    const style = MAP_STYLES.find((s) => s.id === selectedStyle);
    return selectedStyle === "trace-only"
      ? createCustomStyle(backgroundColor)
      : style?.url || "mapbox://styles/mapbox/streets-v11";
  }, [selectedStyle, backgroundColor]);
};
