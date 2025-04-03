import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

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
      // Redimensionner l'image avec sharp
      console.log("Redimensionnement de l'image...");
      const resizedBuffer = await sharp(buffer)
        .resize({
          width: 1754, // Moitié de 3508
          height: 2480, // Moitié de 4961
          fit: "contain",
          background: { r: 255, g: 255, b: 255 },
        })
        .png({
          compressionLevel: 9, // Maximum compression
          adaptiveFiltering: true,
        })
        .toBuffer();

      console.log(
        `Image redimensionnée, nouvelle taille: ${resizedBuffer.length} octets`
      );

      // Convertir l'image en base64 pour l'inclure dans le SVG
      const base64Image = `data:image/png;base64,${resizedBuffer.toString(
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
