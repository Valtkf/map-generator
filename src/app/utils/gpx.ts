import { FeatureCollection, Geometry } from "geojson";

export type GeoJson = FeatureCollection<Geometry>;

export const parseGpxFile = async (file: File): Promise<GeoJson> => {
  try {
    const text = await file.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");

    // Vérifier si le parsing a échoué
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      throw new Error("Format XML invalide");
    }

    // Extraire uniquement les points de trace (trkpt)
    const trackSegments = xmlDoc.getElementsByTagName("trkseg");
    if (trackSegments.length === 0) {
      throw new Error("Aucun segment de trace trouvé dans le fichier GPX");
    }

    const routePoints: [number, number][] = [];

    for (let i = 0; i < trackSegments.length; i++) {
      const trackPoints = trackSegments[i].getElementsByTagName("trkpt");

      if (trackPoints.length === 0) {
        console.warn(`Segment ${i + 1} ne contient aucun point`);
        continue;
      }

      for (let j = 0; j < trackPoints.length; j++) {
        const point = trackPoints[j];
        const lon = parseFloat(point.getAttribute("lon") || "0");
        const lat = parseFloat(point.getAttribute("lat") || "0");

        // Vérifier que les coordonnées sont valides
        if (!isNaN(lon) && !isNaN(lat)) {
          routePoints.push([lon, lat]);
        }
      }
    }

    if (routePoints.length === 0) {
      throw new Error("Aucun point de trace valide trouvé");
    }

    console.log(`Points de trace extraits: ${routePoints.length}`);

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: routePoints,
          },
          properties: {},
        },
      ],
    };
  } catch (error) {
    console.error("Erreur lors du parsing du fichier GPX:", error);
    throw new Error(
      `Impossible de parser le fichier GPX: ${
        error instanceof Error ? error.message : "Erreur inconnue"
      }`
    );
  }
};

export const calculateBounds = (
  geoJson: GeoJson
): { center: [number, number]; zoom: number } => {
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  geoJson.features.forEach((feature) => {
    if (feature.geometry.type === "LineString") {
      // Assertion de type pour indiquer que coordinates est un tableau de [number, number]
      const coordinates = feature.geometry.coordinates as [number, number][];
      coordinates.forEach(([lng, lat]) => {
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      });
    }
  });

  // Ajouter une marge de 20% aux bounds
  const margin = {
    lat: (maxLat - minLat) * 0.2,
    lng: (maxLng - minLng) * 0.2,
  };

  minLat -= margin.lat;
  maxLat += margin.lat;
  minLng -= margin.lng;
  maxLng += margin.lng;

  // Calcul du zoom optimal
  const latDiff = maxLat - minLat;
  const lngDiff = maxLng - minLng;
  const maxDiff = Math.max(latDiff, lngDiff);

  // Formule pour calculer le zoom optimal (ajuster les valeurs selon vos besoins)
  const zoom = Math.floor(Math.log2(360 / maxDiff)) + 1;

  // Réduire légèrement le zoom pour s'assurer que tout le tracé est visible
  return {
    center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2] as [number, number],
    zoom: Math.max(1, zoom - 0.5),
  };
};
