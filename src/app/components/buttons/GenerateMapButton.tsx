import React from "react";
import { GeoJson } from "../../utils/gpx";
import mapboxgl, { Style as MapboxStyle } from "mapbox-gl";
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
  exportFormat: ExportFormat;
  lineWidth: number;
  elevationData?: {
    elevation: number[];
    distance: number[];
  } | null;
}

const GenerateMapButton = ({
  center,
  zoom,
  gpxGeoJson,
  isLoading = false,
  onClick,
  exportFormat,
  lineWidth,
  elevationData,
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

  const createCustomStyle = (backgroundColor: string): MapboxStyle => {
    const version = 8 as const;
    return {
      version,
      sources: {},
      layers: [
        {
          id: "background",
          type: "background",
          paint: {
            "background-color": backgroundColor,
          },
        },
      ],
    };
  };

  const generateMapForStyle = async (
    styleId: string,
    styleName: string,
    styleUrl: string
  ): Promise<{
    content: Blob | string;
    fileName: string;
    styleName: string;
  }> => {
    return new Promise<{
      content: Blob | string;
      fileName: string;
      styleName: string;
    }>((resolve, reject) => {
      try {
        // Calculer l'ajustement de zoom basé sur le rapport des tailles
        // PreviewMap: 550x778px, Image générée: 3508x4961px
        const previewWidth = 550;
        const profilePreviewHeight = 100;
        const previewHeight = 778;
        const exportWidth = 3508;
        const exportHeight = 4961;
        // Calcul dynamique de la hauteur du profil exporté
        const profileExportHeight = Math.round(
          profilePreviewHeight * (exportWidth / previewWidth)
        );

        // Calculer le rapport de taille
        const widthRatio = exportWidth / previewWidth;
        const heightRatio = exportHeight / previewHeight;
        const sizeRatio = Math.max(widthRatio, heightRatio);

        // Ajuster le zoom en fonction du rapport logarithmique
        // Chaque niveau de zoom x2 = zoom+1, donc log2(ratio) donne le nombre de niveaux à ajuster
        const zoomOffset = Math.log2(sizeRatio);
        const adjustedZoom = zoom + zoomOffset;

        // Créer un conteneur pour la carte
        const mapContainer = document.createElement("div");
        mapContainer.style.width = "3508px";
        mapContainer.style.height = "4961px";
        mapContainer.style.position = "absolute";
        mapContainer.style.left = "-9999px";
        document.body.appendChild(mapContainer);

        // Déterminer le style à utiliser pour la carte
        let styleToUse: string | MapboxStyle = styleUrl;
        if (styleId === "trace-only") {
          styleToUse = createCustomStyle("#FFFFFF");
        }

        // Créer la carte
        const map = new mapboxgl.Map({
          container: mapContainer,
          style: styleToUse,
          center,
          zoom: adjustedZoom,
          bearing: 0,
          pitch: 0,
          interactive: false,
        });

        // Attendre que la carte soit chargée
        map.once("idle", async () => {
          try {
            // Ajouter le tracé GPX
            if (gpxGeoJson) {
              map.addSource("route", {
                type: "geojson",
                data: gpxGeoJson,
              });

              map.addLayer({
                id: "route",
                type: "line",
                source: "route",
                layout: {
                  "line-join": "round",
                  "line-cap": "round",
                },
                paint: {
                  "line-color":
                    MAP_STYLES.find((s) => s.id === styleId)?.traceColor ||
                    "#000000",
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

                // Ajouter une couche pour les cercles blancs
                map.addLayer({
                  id: "route-points-bg",
                  type: "circle",
                  source: "route-points",
                  paint: {
                    "circle-radius": 13 * Math.sqrt(exportWidth / previewWidth),
                    "circle-color": "white",
                    "circle-stroke-color":
                      MAP_STYLES.find((s) => s.id === styleId)?.traceColor ||
                      "#000000",
                    "circle-stroke-width": lineWidth * 4.77 * 0.75,
                  },
                });
              }
            }

            // Attendre que le tracé soit chargé
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Créer un canvas pour la capture
            const canvas = document.createElement("canvas");
            canvas.width = 3508;
            canvas.height = 4961;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              throw new Error("Impossible de créer le contexte canvas");
            }

            // Capturer la carte
            const mapCanvas = map.getCanvas();
            ctx.drawImage(
              mapCanvas,
              0,
              0,
              exportWidth,
              exportHeight - profileExportHeight
            );

            // Si nous avons des données d'élévation, dessiner le profil
            if (elevationData) {
              // Créer un canvas temporaire pour le profil
              const profileCanvas = document.createElement("canvas");
              profileCanvas.width = exportWidth;
              profileCanvas.height = profileExportHeight;
              const profileCtx = profileCanvas.getContext("2d");

              if (!profileCtx) {
                throw new Error(
                  "Impossible de créer le contexte canvas pour le profil"
                );
              }

              // Ne pas remplir de fond blanc, laisser le fond transparent

              // Dessiner la ligne du profil
              profileCtx.strokeStyle = "rgb(75, 192, 192)";
              profileCtx.lineWidth = 2;
              profileCtx.beginPath();

              const maxElevation = Math.max(...elevationData.elevation);
              const minElevation = Math.min(...elevationData.elevation);
              const elevationRange = maxElevation - minElevation;
              const padding = 20;

              elevationData.elevation.forEach((elevation, index) => {
                const x =
                  (index / (elevationData.elevation.length - 1)) *
                    (exportWidth - 2 * padding) +
                  padding;
                const y =
                  profileExportHeight -
                  padding -
                  ((elevation - minElevation) / elevationRange) *
                    (profileExportHeight - 2 * padding);

                if (index === 0) {
                  profileCtx.moveTo(x, y);
                } else {
                  profileCtx.lineTo(x, y);
                }
              });

              profileCtx.stroke();

              // Dessiner le profil sur le canvas principal
              ctx.drawImage(
                profileCanvas,
                0,
                exportHeight - profileExportHeight,
                exportWidth,
                profileExportHeight
              );
            }

            // Compresser le canvas
            const compressedCanvas = document.createElement("canvas");
            compressedCanvas.width = 3508;
            compressedCanvas.height = 4961;
            const compressedCtx = compressedCanvas.getContext("2d");

            if (!compressedCtx) {
              throw new Error(
                "Impossible de créer le contexte canvas compressé"
              );
            }

            compressedCtx.drawImage(canvas, 0, 0);

            let fileContent: Blob | string;
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
            reject(error);
          }
        });
      } catch (error) {
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
