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
}

export const ElevationProfile: React.FC<ElevationProfileProps> = ({
  gpxData,
  isMinimal = false,
  traceColor,
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
      className={`w-full ${
        isMinimal ? "h-full" : "h-32 mt-4 p-4"
      } rounded-lg shadow`}
    >
      <Line options={options} data={data} />
    </div>
  );
};
