import React from "react";
import { GeoJson } from "../../utils/gpx";
import mapboxgl from "mapbox-gl";

interface GenerateMapButtonProps {
  onClick: () => void;
  center: [number, number];
  zoom: number;
  gpxGeoJson: GeoJson | null;
  isLoading?: boolean;
}

const GenerateMapButton = ({
  onClick,
  center,
  zoom,
  gpxGeoJson,
  isLoading = false,
}: GenerateMapButtonProps) => {
  const handleGenerateMap = async () => {
    try {
      // Appeler la fonction onClick pour toute logique supplémentaire
      onClick();

      // Créer un élément canvas temporaire avec les dimensions A3
      const mapContainer = document.createElement("div");
      mapContainer.style.width = "3508px"; // Largeur A3 en pixels
      mapContainer.style.height = "4961px"; // Hauteur A3 en pixels
      mapContainer.style.position = "absolute";
      mapContainer.style.visibility = "hidden";
      document.body.appendChild(mapContainer);

      // Initialiser la carte Mapbox
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
      const map = new mapboxgl.Map({
        container: mapContainer,
        style: "mapbox://styles/mapbox/light-v10",
        center: center,
        zoom: zoom + 1,
        preserveDrawingBuffer: true,
      });

      // Gérer les images manquantes
      map.on("styleimagemissing", (e) => {
        const emptyImage = new ImageData(1, 1);
        map.addImage(e.id, emptyImage);
        console.log(`Image manquante remplacée: ${e.id}`);
      });

      // Attendre que la carte soit chargée
      map.on("load", () => {
        // Ajouter le tracé GPX
        if (gpxGeoJson) {
          map.addSource("route", {
            type: "geojson",
            data: JSON.parse(
              JSON.stringify(gpxGeoJson)
            ) as GeoJSON.FeatureCollection,
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
              "line-color": "#0066CC",
              "line-width": 8,
            },
          });
        }

        // Attendre que tous les éléments soient rendus
        map.once("idle", async () => {
          try {
            // Rendre le conteneur visible temporairement
            mapContainer.style.visibility = "visible";

            // Attendre un peu pour s'assurer que tout est rendu
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Capturer directement le canvas de la carte
            const canvas = map.getCanvas();
            const dataUrl = canvas.toDataURL("image/png");

            // Afficher l'indicateur de chargement
            const loadingElement = document.createElement("div");
            loadingElement.innerHTML = `
              <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                          background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 10px; z-index: 9999;">
                <p>Conversion en SVG en cours...</p>
                <p>Veuillez patienter, cela peut prendre quelques instants.</p>
              </div>
            `;
            document.body.appendChild(loadingElement);

            // Convertir le dataURL en Blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();

            // Créer un formulaire pour envoyer l'image à l'API de conversion
            const formData = new FormData();
            formData.append("image", blob, "carte.png");

            // Envoyer à l'API de conversion
            const svgResponse = await fetch("/api/convert-to-svg", {
              method: "POST",
              body: formData,
            });

            // Supprimer l'indicateur de chargement
            document.body.removeChild(loadingElement);

            if (svgResponse.ok) {
              const svgBlob = await svgResponse.blob();
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
            } else {
              alert("Erreur lors de la conversion en SVG. Veuillez réessayer.");
            }

            // Nettoyer
            setTimeout(() => {
              map.remove();
              document.body.removeChild(mapContainer);
            }, 1000);
          } catch (error) {
            console.error("Erreur détaillée:", error);

            // Essayer de télécharger au moins le PNG si la conversion SVG échoue
            try {
              const canvas = map.getCanvas();
              const dataUrl = canvas.toDataURL("image/png");

              const link = document.createElement("a");
              link.href = dataUrl;
              link.download = `carte-${
                new Date().toISOString().split("T")[0]
              }.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              alert(
                "La conversion en SVG a échoué, mais l'image PNG a été téléchargée."
              );
            } catch (pngError) {
              console.error("Erreur lors de la sauvegarde du PNG:", pngError);
              alert(
                `Erreur: ${
                  error instanceof Error ? error.message : String(error)
                }`
              );
            }

            map.remove();
            document.body.removeChild(mapContainer);
          }
        });
      });
    } catch (error) {
      console.error("Erreur complète:", error);
      alert(
        `Une erreur est survenue: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  return (
    <button
      onClick={handleGenerateMap}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6 cursor-pointer"
      disabled={isLoading}
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
