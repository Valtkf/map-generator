// Définition du type GeoJSON
export type GeoJson = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: {
      type: "LineString" | "Point" | "Polygon";
      coordinates: number[][] | number[] | number[][][];
    };
    properties?: Record<string, unknown>;
  }>;
};

export const parseGpxFile = async (file: File): Promise<GeoJson> => {
  const text = await file.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, "text/xml");

  // Extraire uniquement les points de trace (trkpt)
  const trackSegments = xmlDoc.getElementsByTagName("trkseg");
  const routePoints: [number, number][] = [];

  for (let i = 0; i < trackSegments.length; i++) {
    const trackPoints = trackSegments[i].getElementsByTagName("trkpt");

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
};

export const calculateBounds = (geoJson: GeoJson) => {
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

  return {
    center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2] as [number, number],
    zoom: Math.min(Math.max(zoom, 1), 20), // Limiter le zoom entre 1 et 20
    bounds: [
      [minLng, minLat],
      [maxLng, maxLat],
    ] as [[number, number], [number, number]],
  };
};
