import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

interface ElevationProfileProps {
  id: string;
  elevationData: {
    elevation: number[];
    distance: number[];
  };
  onDownload?: () => void;
}

export const ElevationProfile: React.FC<ElevationProfileProps> = ({
  id,
  elevationData,
  onDownload,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !elevationData) return;

    // Détruire le graphique existant s'il y en a un
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Créer le nouveau graphique
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: elevationData.distance.map((d) => `${d.toFixed(1)} km`),
        datasets: [
          {
            data: elevationData.elevation,
            borderColor: "#000000",
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
        scales: {
          x: {
            display: false,
          },
          y: {
            display: false,
          },
        },
        animation: {
          duration: 0,
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [elevationData]);

  return (
    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-[160px] w-[90%] pointer-events-none flex justify-center items-end">
      <canvas ref={chartRef} id={id} />
      {onDownload && (
        <button
          onClick={onDownload}
          className="absolute bottom-0 right-0 bg-white bg-opacity-80 p-2 rounded-lg shadow-md text-sm pointer-events-auto"
          title="Télécharger le profil altimétrique"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export const exportElevationProfile = (id: string, filename: string) => {
  const canvas = document.getElementById(id) as HTMLCanvasElement;
  if (!canvas) return;

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
};
