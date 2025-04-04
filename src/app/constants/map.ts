export const MAP_CONFIG = {
  PREVIEW: {
    WIDTH: 400,
    HEIGHT: 610,
  },
  EXPORT: {
    WIDTH: 3508,
    HEIGHT: 4961,
  },
  MARKERS: {
    PREVIEW: {
      SIZE: 12,
      BORDER: 2,
    },
    EXPORT: {
      SIZE: 24,
      BORDER: 4,
    },
  },
  GRID: {
    LINES: 5,
    OPACITY: {
      NORMAL: 0.3,
      CENTER: 0.4,
    },
  },
};

export const MAP_DEFAULTS = {
  CENTER: [0, 0] as [number, number],
  ZOOM: 1,
  BACKGROUND: "#FFFFFF",
};
