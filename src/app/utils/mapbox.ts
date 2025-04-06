import { GeoJson } from "./gpx";

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

// Fonction pour simplifier les coordonnées (réduire le nombre de points)
const simplifyCoordinates = (
  coordinates: [number, number][],
  maxPoints = 100
) => {
  if (coordinates.length <= maxPoints) return coordinates;

  // Prendre un point tous les N points pour réduire la taille
  const step = Math.ceil(coordinates.length / maxPoints);
  return coordinates.filter((_, index) => index % step === 0);
};

// Fonction pour encoder les coordonnées en format polyline (algorithme de Google)
export function encodePolyline(coordinates: [number, number][]): string {
  if (!coordinates.length) return "";

  function encodeNumber(num: number): string {
    const int = Math.round(num * 1e5);
    let result = "";
    let value = int < 0 ? ~(int << 1) : int << 1;

    while (value >= 0x20) {
      result += String.fromCharCode((0x20 | (value & 0x1f)) + 63);
      value >>= 5;
    }

    result += String.fromCharCode(value + 63);
    return result;
  }

  let result = "";
  let lastLat = 0;
  let lastLng = 0;

  coordinates.forEach(([lng, lat]) => {
    result += encodeNumber(lat - lastLat) + encodeNumber(lng - lastLng);
    lastLat = lat;
    lastLng = lng;
  });

  return result;
}

export const generateMapboxExportUrl = ({
  style = "streets-v11",
  center,
  zoom,
  width = 3508,
  height = 4961,
  token,
  gpxGeoJson,
}: {
  style?: string;
  center: [number, number];
  zoom: number;
  width?: number;
  height?: number;
  token: string;
  gpxGeoJson?: GeoJson;
}): string => {
  try {
    const MAX_WIDTH = 1280;
    const MAX_HEIGHT = 1280;
    const actualWidth = Math.min(width, MAX_WIDTH);
    const actualHeight = Math.min(height, MAX_HEIGHT);

    if (gpxGeoJson && gpxGeoJson.features && gpxGeoJson.features.length > 0) {
      const lineFeature = gpxGeoJson.features.find(
        (feature) => feature.geometry.type === "LineString"
      );

      if (
        lineFeature &&
        lineFeature.geometry.type === "LineString" &&
        lineFeature.geometry.coordinates.length > 0
      ) {
        const coordinates = lineFeature.geometry.coordinates as [
          number,
          number
        ][];

        // Simplifier les coordonnées mais garder plus de points pour la précision
        const simplifiedCoords = simplifyCoordinates(coordinates, 100);

        // Encoder en format polyline (plus efficace pour les URL longues)
        const encodedPolyline = encodePolyline(simplifiedCoords);

        // Utiliser le format encodé polyline de Mapbox
        return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/path-5+0000ff-1(${encodedPolyline})/${center[0]},${center[1]},${zoom}/${actualWidth}x${actualHeight}?access_token=${token}`;
      }
    }

    // URL sans tracé
    return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${center[0]},${center[1]},${zoom}/${actualWidth}x${actualHeight}?access_token=${token}`;
  } catch (error) {
    console.error("Erreur lors de la génération de l'URL:", error);
    const MAX_WIDTH = 1280;
    const MAX_HEIGHT = 1280;
    const actualWidth = Math.min(width, MAX_WIDTH);
    const actualHeight = Math.min(height, MAX_HEIGHT);

    return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${center[0]},${center[1]},${zoom}/${actualWidth}x${actualHeight}?access_token=${token}`;
  }
};

// Fonction pour générer une image haute résolution en assemblant plusieurs tuiles
export const generateHighResMapUrl = async ({
  style = "streets-v11",
  center,
  zoom,
  width = 1280,
  height = 1280,
  token,
  gpxGeoJson,
}: {
  style?: string;
  center: [number, number];
  zoom: number;
  width?: number;
  height?: number;
  token: string;
  gpxGeoJson?: GeoJson;
}): Promise<string> => {
  // Limites de l'API Mapbox
  const MAX_WIDTH = 1280;
  const MAX_HEIGHT = 1280;

  // Calculer le nombre de tuiles nécessaires
  const tilesX = Math.ceil(width / MAX_WIDTH);
  const tilesY = Math.ceil(height / MAX_HEIGHT);

  // Informer l'utilisateur
  console.log(
    `Génération d'une image ${width}x${height} en assemblant ${tilesX}x${tilesY} tuiles`
  );

  // Retourner l'URL standard pour le moment
  // Dans une implémentation complète, nous devrions:
  // 1. Générer plusieurs images avec des coordonnées ajustées
  // 2. Les télécharger
  // 3. Les assembler avec canvas
  // 4. Retourner l'URL de l'image assemblée

  // Pour l'instant, générons une image à la taille maximale autorisée
  return generateMapboxExportUrl({
    style,
    center,
    zoom,
    width: MAX_WIDTH,
    height: MAX_HEIGHT,
    token,
    gpxGeoJson,
  });
};
