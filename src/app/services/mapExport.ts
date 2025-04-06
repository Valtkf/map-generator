import { ExportFormat } from "../components/inputs/FormatSelector";
import { MAP_STYLES } from "../components/inputs/ColorSelector";

interface ExportResult {
  content: string | Blob;
  fileName: string;
}

export const generateMapExport = async (
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  styleName: string
): Promise<ExportResult> => {
  // Trouver la couleur du tracé correspondant au style
  const style = MAP_STYLES.find((s) => s.id === styleName);
  const traceColor = style?.traceColor || "#000000";

  // Créer un canvas temporaire pour modifier la couleur du tracé
  const tempCanvas = document.createElement("canvas");
  const ctx = tempCanvas.getContext("2d");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;

  if (ctx) {
    // Dessiner l'image originale
    ctx.drawImage(canvas, 0, 0);

    // Modifier la couleur du tracé
    const imageData = ctx.getImageData(
      0,
      0,
      tempCanvas.width,
      tempCanvas.height
    );
    const data = imageData.data;

    // Parcourir tous les pixels et changer la couleur du tracé
    for (let i = 0; i < data.length; i += 4) {
      // Si le pixel est proche du noir (tracé)
      // On vérifie que les composantes RGB sont toutes très sombres
      const isTracePixel =
        data[i] < 30 && // Rouge
        data[i + 1] < 30 && // Vert
        data[i + 2] < 30 && // Bleu
        data[i + 3] > 200; // Alpha (opacité)

      if (isTracePixel) {
        // Convertir la couleur hex en RGB
        const r = parseInt(traceColor.slice(1, 3), 16);
        const g = parseInt(traceColor.slice(3, 5), 16);
        const b = parseInt(traceColor.slice(5, 7), 16);

        // Appliquer la nouvelle couleur
        data[i] = r; // Rouge
        data[i + 1] = g; // Vert
        data[i + 2] = b; // Bleu
        // Garder l'alpha tel quel
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  const compressedCanvas = await compressCanvas(tempCanvas);

  switch (format) {
    case "svg":
      return generateSvgExport(compressedCanvas, styleName);
    case "png":
      return generatePngExport(compressedCanvas, styleName);
    case "jpeg":
      return generateJpegExport(compressedCanvas, styleName);
    default:
      throw new Error(`Format non supporté: ${format}`);
  }
};

const compressCanvas = async (canvas: HTMLCanvasElement) => {
  const compressedCanvas = document.createElement("canvas");
  const ctx = compressedCanvas.getContext("2d");
  const scaleFactor = 0.7;

  compressedCanvas.width = canvas.width * scaleFactor;
  compressedCanvas.height = canvas.height * scaleFactor;

  if (ctx) {
    ctx.drawImage(
      canvas,
      0,
      0,
      compressedCanvas.width,
      compressedCanvas.height
    );
  }

  return compressedCanvas;
};

const generateSvgExport = async (
  canvas: HTMLCanvasElement,
  styleName: string
): Promise<ExportResult> => {
  const dataUrl = canvas.toDataURL("image/png");
  const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="3508" height="4961" viewBox="0 0 3508 4961" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image x="0" y="0" width="3508" height="4961" xlink:href="${dataUrl}"/>
</svg>`;

  return {
    content: svgContent,
    fileName: `carte-${styleName}-${
      new Date().toISOString().split("T")[0]
    }.svg`,
  };
};

const generatePngExport = async (
  canvas: HTMLCanvasElement,
  styleName: string
): Promise<ExportResult> => {
  const dataUrl = canvas.toDataURL("image/png");
  const binaryString = atob(dataUrl.split(",")[1]);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return {
    content: new Blob([bytes], { type: "image/png" }),
    fileName: `carte-${styleName}-${
      new Date().toISOString().split("T")[0]
    }.png`,
  };
};

const generateJpegExport = async (
  canvas: HTMLCanvasElement,
  styleName: string
): Promise<ExportResult> => {
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  const binaryString = atob(dataUrl.split(",")[1]);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return {
    content: new Blob([bytes], { type: "image/jpeg" }),
    fileName: `carte-${styleName}-${
      new Date().toISOString().split("T")[0]
    }.jpg`,
  };
};
