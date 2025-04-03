import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// Marquer cette fonction comme une Edge Function
export const config = {
  runtime: "edge",
};

export async function POST(req: NextRequest) {
  try {
    console.log("Début de la conversion en SVG");

    // Récupérer l'image depuis la requête
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      console.error("Aucune image fournie");
      return NextResponse.json(
        { error: "Aucune image fournie" },
        { status: 400 }
      );
    }

    console.log(
      `Image reçue: ${imageFile.name}, taille: ${imageFile.size} octets`
    );

    // Convertir le File en Buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    console.log(`Buffer créé, taille: ${buffer.length} octets`);

    try {
      // Redimensionner l'image avec sharp et optimiser fortement
      console.log("Redimensionnement et optimisation de l'image...");
      const resizedBuffer = await sharp(buffer)
        .resize({
          width: 1000, // Réduire davantage la taille
          height: 1400, // Proportionnel à A3
          fit: "contain",
          background: { r: 255, g: 255, b: 255 },
        })
        .jpeg({
          // Utiliser JPEG pour une meilleure compression
          quality: 70, // Qualité réduite mais suffisante pour l'impression
          progressive: true,
        })
        .toBuffer();

      console.log(
        `Image optimisée, nouvelle taille: ${resizedBuffer.length} octets`
      );

      // Convertir l'image en base64 pour l'inclure dans le SVG
      const base64Image = `data:image/jpeg;base64,${resizedBuffer.toString(
        "base64"
      )}`;

      // Créer un SVG compact
      const svgString = `<svg width="3508" height="4961" xmlns="http://www.w3.org/2000/svg"><image x="0" y="0" width="3508" height="4961" href="${base64Image}"/></svg>`;

      console.log("SVG généré avec succès");

      // Renvoyer le SVG
      return new NextResponse(svgString, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": 'attachment; filename="carte.svg"',
        },
      });
    } catch (sharpError) {
      console.error("Erreur lors du traitement de l'image:", sharpError);
      throw sharpError;
    }
  } catch (error) {
    console.error("Erreur lors de la conversion en SVG:", error);

    // Renvoyer une réponse d'erreur détaillée
    return NextResponse.json(
      {
        error: "Erreur lors de la conversion en SVG",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
