interface MapboxUrlParams {
  style?: string; // style de la carte
  center?: [number, number]; // [longitude, latitude]
  zoom?: number; // niveau de zoom
  width?: number; // largeur en pixels
  height?: number; // hauteur en pixels
  token: string; // token Mapbox
}

export const generateMapboxPreviewUrl = ({
  style = "streets-v11",
  center = [0, 0],
  zoom = 1,
  token,
}: MapboxUrlParams): string => {
  // Ajout des paramètres pour le style de la carte
  return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/pin-s+f00(${center[0]},${center[1]})/${center[0]},${center[1]},${zoom}/800x1000?access_token=${token}`;
};

export const generateMapboxExportUrl = ({
  style = "streets-v11",
  center = [0, 0],
  zoom = 1,
  token,
}: MapboxUrlParams): string => {
  // Taille complète pour l'export
  return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${center.join(
    ","
  )},${zoom}/3508x4961?access_token=${token}`;
};
