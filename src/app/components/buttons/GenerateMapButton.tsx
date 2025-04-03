import React from "react";
import { GeoJson } from "../../utils/gpx";
import mapboxgl from "mapbox-gl";
import type { GeoJSON } from "geojson";

interface GenerateMapButtonProps {
  center: [number, number];
  zoom: number;
  gpxGeoJson: GeoJson | null;
  isLoading?: boolean;
  onClick: () => void;
}

const GenerateMapButton = ({
  center,
  zoom,
  gpxGeoJson,
  isLoading = false,
  onClick,
}: GenerateMapButtonProps) => {
  const handleGenerateMap = async () => {
    // Appeler la fonction onClick pour toute logique supplémentaire
    onClick();

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

    const map = new mapboxgl.Map({
      container: mapContainer,
      style: "mapbox://styles/mapbox/light-v10",
      center: center,
      zoom: zoom,
      preserveDrawingBuffer: true,
      interactive: false,
      attributionControl: false,
      logoPosition: "bottom-right",
    });

    // Gérer les images manquantes
    map.on("styleimagemissing", (e) => {
      const emptyImage = new ImageData(1, 1);
      map.addImage(e.id, emptyImage);
      console.log(`Image manquante remplacée: ${e.id}`);
    });

    map.on("load", () => {
      // Ajouter le tracé GPX si disponible
      if (gpxGeoJson && gpxGeoJson.features.length > 0) {
        // Convertir GeoJson en GeoJSON compatible avec Mapbox
        const mapboxGeoJson = {
          type: "FeatureCollection",
          features: gpxGeoJson.features,
        } as unknown as GeoJSON;

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
            "line-color": "#000000",
            "line-width": 8,
          },
          filter: ["==", "$type", "LineString"],
        });
      }

      map.once("idle", async () => {
        try {
          // Rendre le conteneur visible temporairement
          mapContainer.style.visibility = "visible";

          // Attendre un peu pour s'assurer que tout est rendu
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Capturer directement le canvas de la carte
          const canvas = map.getCanvas();

          // Réduire davantage la taille et utiliser JPEG pour une meilleure compression
          const compressedCanvas = document.createElement("canvas");
          const ctx = compressedCanvas.getContext("2d");
          const scaleFactor = 0.7; // Réduction plus importante (70%)

          // Définir les dimensions du canvas compressé
          compressedCanvas.width = canvas.width * scaleFactor;
          compressedCanvas.height = canvas.height * scaleFactor;

          // Dessiner l'image redimensionnée
          if (ctx) {
            ctx.drawImage(
              canvas,
              0,
              0,
              compressedCanvas.width,
              compressedCanvas.height
            );
          }

          // Utiliser JPEG au lieu de PNG pour une meilleure compression
          const dataUrl = compressedCanvas.toDataURL("image/jpeg", 0.85);

          // Afficher l'indicateur de chargement
          const loadingElement = document.createElement("div");
          loadingElement.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 10px; z-index: 9999;">
              <p>Génération du SVG en cours...</p>
              <p>Veuillez patienter, cela peut prendre quelques instants.</p>
            </div>
          `;
          document.body.appendChild(loadingElement);

          // Créer le SVG avec l'image compressée
          const svgContent = `<svg width="3508" height="4961" xmlns="http://www.w3.org/2000/svg">
            <image x="0" y="0" width="3508" height="4961" href="${dataUrl}"/>
          </svg>`;

          // Convertir le SVG en Blob
          const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
          const svgUrl = URL.createObjectURL(svgBlob);

          // Télécharger le SVG
          const svgLink = document.createElement("a");
          svgLink.href = svgUrl;
          svgLink.download = `carte-${
            new Date().toISOString().split("T")[0]
          }.svg`;
          document.body.appendChild(svgLink);
          svgLink.click();
          document.body.removeChild(svgLink);
          URL.revokeObjectURL(svgUrl);

          // Supprimer l'indicateur de chargement
          document.body.removeChild(loadingElement);
        } catch (error) {
          console.error("Erreur lors de la génération de la carte:", error);
          alert(
            "Une erreur est survenue lors de la génération de la carte. Veuillez réessayer."
          );
          map.remove();
          document.body.removeChild(mapContainer);
        }
      });
    });

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

      // Rendre le fond complètement blanc
      if (map.getLayer("background")) {
        map.setPaintProperty("background", "background-color", "#ffffff");
      }

      // Rendre toutes les routes en noir
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
        "Générer la carte"
      )}
    </button>
  );
};

export default GenerateMapButton;
