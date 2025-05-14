import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

interface ElevationProfileProps {
  gpxData: {
    elevation: number[];
    distance: number[];
  };
  isMinimal?: boolean;
  traceColor?: string;
  id?: string;
}

export const ElevationProfile: React.FC<ElevationProfileProps> = ({
  gpxData,
  isMinimal = false,
  traceColor,
  id = "elevation-profile",
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: !isMinimal,
      },
    },
    scales: {
      y: {
        display: !isMinimal,
        grid: {
          display: !isMinimal,
        },
      },
      x: {
        display: !isMinimal,
        grid: {
          display: !isMinimal,
        },
      },
    },
  };

  const color = traceColor || "rgb(75, 192, 192)";
  const bgColor = traceColor
    ? color.replace("rgb", "rgba").replace(")", ", 0.5)")
    : "rgba(75, 192, 192, 0.5)";

  const data = {
    labels: gpxData.distance.map((d) => (d / 1000).toFixed(1)),
    datasets: [
      {
        data: gpxData.elevation,
        borderColor: color,
        backgroundColor: bgColor,
        tension: 0.4,
        pointRadius: isMinimal ? 0 : 3,
      },
    ],
  };

  return (
    <div
      id={id}
      className={`w-full h-full ${
        isMinimal ? "" : "h-32 mt-4 p-4 rounded-lg shadow"
      }`}
      style={
        isMinimal
          ? {
              background: "transparent",
              boxShadow: "none",
              padding: 0,
              borderRadius: 0,
            }
          : {}
      }
    >
      <Line options={options} data={data} />
    </div>
  );
};

// Fonction pour exporter le profil altimétrique sous forme d'image
export const exportElevationProfile = (
  elementId: string = "elevation-profile",
  fileName: string = "profil-altimetrique.png"
) => {
  const chartContainer = document.getElementById(elementId);
  if (!chartContainer) return;

  const canvas = chartContainer.querySelector("canvas");
  if (!canvas) return;

  // Créer un lien de téléchargement et déclencher le téléchargement
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = fileName;
  link.click();
};
