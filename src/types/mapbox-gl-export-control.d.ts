declare module "mapbox-gl-export-control" {
  import { IControl } from "mapbox-gl";

  export interface MapboxExportControlOptions {
    PageSize?:
      | {
          Width: number;
          Height: number;
          Unit: string;
        }
      | string;
    Format?: string;
    DPI?: number;
    Filename?: string;
    [key: string]: unknown;
  }

  export class MapboxExportControl implements IControl {
    constructor(options?: MapboxExportControlOptions);
    onAdd(map: mapboxgl.Map): HTMLElement;
    onRemove(map: mapboxgl.Map): void;
  }
}
