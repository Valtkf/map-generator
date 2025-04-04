import { ExportFormat } from "../components/inputs/FormatSelector";

interface ExportResult {
  content: string | Blob;
  fileName: string;
}

export const generateMapExport = async (
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  styleName: string
): Promise<ExportResult> => {
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
