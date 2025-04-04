import { ExportFormat } from "../components/inputs/FormatSelector";

export const generateMapExport = async (
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  styleName: string
) => {
  const compressedCanvas = await compressCanvas(canvas);

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

// Implémenter les fonctions generateSvgExport, generatePngExport, generateJpegExport...
