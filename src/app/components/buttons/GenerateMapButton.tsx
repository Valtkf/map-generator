import React from "react";
import { GeoJson } from "../../utils/gpx";
import mapboxgl from "mapbox-gl";
import { MAP_STYLES } from "../inputs/ColorSelector";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ExportFormat } from "../inputs/FormatSelector";

interface GenerateMapButtonProps {
  center: [number, number];
  zoom: number;
  gpxGeoJson: GeoJson | null;
  isLoading?: boolean;
  onClick: () => void;
  backgroundColor: string;
  exportFormat: ExportFormat;
  lineWidth: number;
}

// Définir un type pour le GeoJSON de Mapbox
interface MapboxGeoJSON {
  type: "FeatureCollection";
  features: Array<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const GenerateMapButton = ({
  center,
  zoom,
  gpxGeoJson,
  isLoading = false,
  onClick,
  backgroundColor,
  exportFormat,
  lineWidth,
}: GenerateMapButtonProps) => {
  const handleGenerateMap = async () => {
    // Appeler la fonction onClick pour toute logique supplémentaire
    onClick();

    // Créer un élément de chargement
    const loadingElement = document.createElement("div");
    loadingElement.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 10px; z-index: 9999;">
        <p>Génération des cartes en cours...</p>
        <p>Veuillez patienter, cela peut prendre quelques instants.</p>
      </div>
    `;
    document.body.appendChild(loadingElement);

    try {
      // Créer un nouvel objet ZIP
      const zip = new JSZip();

      // Générer les cartes pour tous les styles
      const fileContents = await Promise.all(
        MAP_STYLES.map(async (mapStyle) => {
          const { content, fileName, styleName } = await generateMapForStyle(
            mapStyle.id,
            mapStyle.name,
            mapStyle.url || "mapbox://styles/mapbox/streets-v11"
          );
          return { content, fileName, styleName };
        })
      );

      // Ajouter chaque fichier au ZIP
      fileContents.forEach(({ content, fileName }) => {
        zip.file(fileName, content);
      });

      // Générer le ZIP et le télécharger
      const zipContent = await zip.generateAsync({ type: "blob" });
      saveAs(
        zipContent,
        `cartes-${exportFormat}-${new Date().toISOString().split("T")[0]}.zip`
      );
    } catch (error) {
      console.error("Erreur lors de la génération des cartes:", error);
      alert(
        "Une erreur est survenue lors de la génération des cartes. Veuillez réessayer."
      );
    } finally {
      // Supprimer l'indicateur de chargement
      document.body.removeChild(loadingElement);
    }
  };

  const generateMapForStyle = async (
    styleId: string,
    styleName: string,
    styleUrl: string
  ) => {
    // Créer un conteneur temporaire pour la carte
    const mapContainer = document.createElement("div");
    mapContainer.style.width = "3508px";
    mapContainer.style.height = "4961px";
    mapContainer.style.position = "absolute";
    mapContainer.style.left = "-9999px";
    mapContainer.style.visibility = "hidden";
    document.body.appendChild(mapContainer);

    // Initialiser la carte Mapbox
    mapboxgl.accessToken =
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
      "pk.eyJ1IjoicHlyMjUiLCJhIjoiY204dTAwazVrMDVhbDJrcXdveGpnZmI3aSJ9.ZV6Um_KXZL-SxHqpZPMWxQ";

    return new Promise<{
      content: string | Blob;
      fileName: string;
      styleName: string;
    }>((resolve, reject) => {
      try {
        // Calculer l'ajustement de zoom basé sur le rapport des tailles
        // PreviewMap: 550x778px, Image générée: 3508x4961px
        const previewWidth = 550;
        const previewHeight = 778;
        const exportWidth = 3508;
        const exportHeight = 4961;

        // Calculer le rapport de taille
        const widthRatio = exportWidth / previewWidth;
        const heightRatio = exportHeight / previewHeight;
        const sizeRatio = Math.max(widthRatio, heightRatio);

        // Ajuster le zoom en fonction du rapport logarithmique
        // Chaque niveau de zoom x2 = zoom+1, donc log2(ratio) donne le nombre de niveaux à ajuster
        const zoomOffset = Math.log2(sizeRatio);
        const adjustedZoom = zoom + zoomOffset;

        console.log(
          `Zoom original: ${zoom}, Offset: ${zoomOffset}, Zoom ajusté: ${adjustedZoom}`
        );

        const map = new mapboxgl.Map({
          container: mapContainer,
          style:
            styleId === "trace-only"
              ? {
                  version: 8,
                  sources: {},
                  layers: [
                    {
                      id: "background",
                      type: "background",
                      paint: {
                        "background-color": backgroundColor || "#FFFFFF",
                      },
                    },
                  ],
                }
              : styleUrl,
          center: center,
          zoom: adjustedZoom,
          preserveDrawingBuffer: true,
          interactive: false,
          attributionControl: false,
          logoPosition: "bottom-right",
          bearing: 0,
          pitch: 0,
          fadeDuration: 0,
        });

        map.jumpTo({ center, zoom: adjustedZoom });

        // Gérer les images manquantes
        map.on("styleimagemissing", (e) => {
          const emptyImage = new ImageData(1, 1);
          map.addImage(e.id, emptyImage);
        });

        map.on("load", () => {
          // Ajouter le tracé GPX si disponible
          if (gpxGeoJson && gpxGeoJson.features.length > 0) {
            // Convertir GeoJson en GeoJSON compatible avec Mapbox
            const mapboxGeoJson: MapboxGeoJSON = {
              type: "FeatureCollection",
              features: gpxGeoJson.features,
            };

            // Trouver la couleur du style
            const style = MAP_STYLES.find((s) => s.id === styleId);
            const traceColor = style?.traceColor || "#000000";

            // Ajouter la source avec le format correct
            map.addSource("gpx-track", {
              type: "geojson",
              data: mapboxGeoJson,
            });

            // Ajouter la couche de ligne pour le tracé
            map.addLayer({
              id: "gpx-track-line",
              type: "line",
              source: "gpx-track",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": traceColor,
                "line-width": lineWidth * 4.77,
              },
            });

            // Ajouter les points de début et fin
            const lineFeature = gpxGeoJson.features.find(
              (feature) => feature.geometry.type === "LineString"
            );

            if (lineFeature && lineFeature.geometry.type === "LineString") {
              const coordinates = lineFeature.geometry.coordinates;

              // Créer une source pour les points
              map.addSource("route-points", {
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: [
                    {
                      type: "Feature",
                      geometry: {
                        type: "Point",
                        coordinates: coordinates[0],
                      },
                      properties: {},
                    },
                    {
                      type: "Feature",
                      geometry: {
                        type: "Point",
                        coordinates: coordinates[coordinates.length - 1],
                      },
                      properties: {},
                    },
                  ],
                },
              });

              // Ajouter une couche pour les cercles blancs (plus grands)
              map.addLayer({
                id: "route-points-bg",
                type: "circle",
                source: "route-points",
                paint: {
                  "circle-radius": 13,
                  "circle-color": "white",
                  "circle-stroke-color": traceColor,
                  "circle-stroke-width": lineWidth * 4.77 * 0.75,
                },
              });
            }
          }

          map.once("style.load", () => {
            // Simplifier la carte en supprimant les couches non essentielles
            const layersToRemove = [
              "poi-label",
              "transit-label",
              "natural-point-label",
              "natural-line-label",
            ];
            layersToRemove.forEach((layer) => {
              if (map.getLayer(layer)) {
                map.removeLayer(layer);
              }
            });

            // Pour le style trace-only, pas besoin de modifications supplémentaires
            if (styleId !== "trace-only") {
              // Rendre toutes les routes en noir pour le style minimaliste
              if (styleId === "minimaliste") {
                const roadLayers = [
                  "road",
                  "road-secondary-tertiary",
                  "road-primary",
                  "road-motorway-trunk",
                ];
                roadLayers.forEach((layer) => {
                  if (map.getLayer(layer)) {
                    map.setPaintProperty(layer, "line-color", "#000000");
                  }
                });
              }
            }
          });
        });

        // Attendre que tout soit chargé
        map.once("idle", async () => {
          try {
            // Attendre un peu pour s'assurer que tout est rendu
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Rendre le conteneur visible temporairement
            mapContainer.style.visibility = "visible";

            // Capturer le canvas
            const canvas = map.getCanvas();

            // Réduire la taille
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

            // Générer le contenu selon le format sélectionné
            let fileContent: string | Blob;
            let fileName: string;

            if (exportFormat === "svg") {
              const dataUrl = compressedCanvas.toDataURL("image/png");
              fileContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
                <svg width="3508" height="4961" xmlns="http://www.w3.org/2000/svg">
                  <image href="${dataUrl}" width="3508" height="4961"/>
                </svg>`;
              fileName = `carte-${styleName}-${
                new Date().toISOString().split("T")[0]
              }.svg`;
            } else if (exportFormat === "png") {
              const dataUrl = compressedCanvas.toDataURL("image/png");
              const binaryString = atob(dataUrl.split(",")[1]);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              fileContent = new Blob([bytes], { type: "image/png" });
              fileName = `carte-${styleName}-${
                new Date().toISOString().split("T")[0]
              }.png`;
            } else {
              const dataUrl = compressedCanvas.toDataURL("image/jpeg", 0.85);
              const binaryString = atob(dataUrl.split(",")[1]);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              fileContent = new Blob([bytes], { type: "image/jpeg" });
              fileName = `carte-${styleName}-${
                new Date().toISOString().split("T")[0]
              }.jpg`;
            }

            // Nettoyer
            map.remove();
            document.body.removeChild(mapContainer);

            // Retourner le contenu
            resolve({
              content: fileContent,
              fileName: fileName,
              styleName: styleName,
            });
          } catch (error) {
            console.error("Erreur lors de la génération de la carte:", error);
            reject(error);
          }
        });
      } catch (error) {
        console.error(
          `Erreur lors de l'initialisation de la carte ${styleName}:`,
          error
        );
        document.body.removeChild(mapContainer);
        reject(error);
      }
    });
  };

  return (
    <button
      onClick={handleGenerateMap}
      className="mb-4 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
      disabled={isLoading || !gpxGeoJson}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Génération en cours...
        </span>
      ) : (
        "Générer les 4 styles de carte"
      )}
    </button>
  );
};

export default GenerateMapButton;
