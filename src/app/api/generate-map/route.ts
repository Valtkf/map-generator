import { NextRequest, NextResponse } from "next/server";
import { GeoJson } from "../../utils/gpx";
import { encodePolyline } from "../../utils/mapbox";

export async function POST(req: NextRequest) {
  try {
    const { center, zoom, style, gpxGeoJson } = (await req.json()) as {
      center: [number, number];
      zoom: number;
      style?: string;
      gpxGeoJson?: GeoJson;
    };

    // Vérifier les paramètres requis
    if (!center || !zoom) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      );
    }

    // Utiliser le token serveur ou le token public comme fallback
    const token =
      process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
    if (!token) {
      return NextResponse.json(
        { error: "Token Mapbox non configuré" },
        { status: 500 }
      );
    }

    // Utiliser un style plus minimaliste similaire à celui de l'image
    const mapStyle = style || "light-v10"; // Utiliser light-v10 comme style par défaut

    // Générer l'URL Mapbox avec le tracé
    let mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static`;

    // Ajouter des logs pour déboguer
    console.log("Début du traitement de la requête");
    console.log("Token disponible:", !!token);
    console.log("GeoJSON reçu:", !!gpxGeoJson);

    // Ajouter le tracé si disponible
    if (gpxGeoJson && gpxGeoJson.features && gpxGeoJson.features.length > 0) {
      console.log("Nombre de features:", gpxGeoJson.features.length);

      const lineFeature = gpxGeoJson.features.find(
        (feature) => feature.geometry.type === "LineString"
      );

      console.log("LineFeature trouvé:", !!lineFeature);

      if (lineFeature && lineFeature.geometry.coordinates.length > 0) {
        console.log(
          "Nombre de coordonnées:",
          lineFeature.geometry.coordinates.length
        );

        // Simplifier davantage les coordonnées pour éviter les URL trop longues
        const coordinates = lineFeature.geometry.coordinates;
        // Vérifier que coordinates est bien un tableau de coordonnées
        if (
          Array.isArray(coordinates) &&
          coordinates.length > 0 &&
          Array.isArray(coordinates[0])
        ) {
          const simplified = coordinates.filter((_, i) => i % 10 === 0) as [
            number,
            number
          ][];

          // Essayer l'approche avec encodage polyline
          try {
            // Encoder les coordonnées en format polyline
            const encodedPolyline = encodePolyline(simplified);

            // Utiliser le format encodé polyline de Mapbox
            const path = `path-4+0066CC-0.9(${encodedPolyline})`;
            mapboxUrl += `/${path}`;

            console.log("Utilisation de l'encodage polyline");
          } catch (error) {
            console.error("Erreur lors de l'encodage polyline:", error);

            // Fallback à l'approche standard
            const path = `path-4+FF0000-1.0(${simplified
              .map(([lng, lat]) => `${lng},${lat}`)
              .join(",")})`;
            mapboxUrl += `/${path}`;

            console.log("Utilisation de l'approche standard");
          }
        }
      }
    }

    // Compléter l'URL
    mapboxUrl += `/${center[0]},${center[1]},${zoom}/1280x1280?access_token=${token}`;

    // Récupérer l'image depuis Mapbox
    const response = await fetch(mapboxUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur Mapbox:", errorText);
      return NextResponse.json(
        { error: "Erreur lors de la génération de l'image" },
        { status: 500 }
      );
    }

    // Récupérer l'image et la renvoyer
    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="carte.png"',
      },
    });
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
