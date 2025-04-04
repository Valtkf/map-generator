declare module "html-to-image" {
  interface Options {
    width?: number;
    height?: number;
    quality?: number;
    backgroundColor?: string;
    style?: Partial<CSSStyleDeclaration>;
    filter?: (node: HTMLElement) => boolean;
    skipFonts?: boolean;
    pixelRatio?: number;
    cacheBust?: boolean;
    [key: string]: unknown;
  }

  export function toSvg(node: HTMLElement, options?: Options): Promise<string>;
  export function toPng(node: HTMLElement, options?: Options): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: Options): Promise<string>;
  export function toBlob(node: HTMLElement, options?: Options): Promise<Blob>;
  export function toPixelData(
    node: HTMLElement,
    options?: Options
  ): Promise<Uint8ClampedArray>;
  export function toCanvas(
    node: HTMLElement,
    options?: Options
  ): Promise<HTMLCanvasElement>;
}
