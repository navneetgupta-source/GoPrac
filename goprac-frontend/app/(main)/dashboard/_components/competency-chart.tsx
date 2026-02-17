"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
  ChartDataLabels
);

export function CompetencyChart({ competency }: { competency: any }) {
  ChartJS.register(annotationPlugin);

//   const pointColors = competency.scores.map((score: number) =>
//     score < competency.benchmark
//       ? "rgba(255, 0, 0, 0.8)"
//       : "rgba(0, 192, 0, 0.8)"
//   );

//   const borderColor = "rgb(59 130 246)";


//   const pointColors = "rgb(255, 180, 0)"

//   const borderColor = "rgb(255, 180, 0)";


  const pointColors = "rgb(59 130 246)"

  const borderColor = "rgb(59 130 246)";

  const data = {
    labels: competency.labels,
    datasets: [
      {
        label: "Your Interview Score",
        data: competency.scores,
        borderColor: borderColor,
        backgroundColor: pointColors,
        borderWidth: 1,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: pointColors,
        tension: 0.3, // smooth line
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: competency.name,
        font: { size: 12 },
      },
      legend: { display: false },
      annotation: {
        annotations: {
          benchmarkLine: {
            type: "line",
            yMin: competency.benchmark,
            yMax: competency.benchmark,
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
            borderDash: [5, 5],
            label: {
              display: true,
              enabled: true,
              content: `Industry Average: ${competency.benchmark}`,
              position: "end", // or "center" if preferred
              backgroundColor: "transparent", // removes box background
              color: "rgba(54, 162, 235, 1)", // text color same as line
              font: { weight: "bold", size: 8 },
              padding: 0, // no extra padding
              yAdjust: -6, // shifts label slightly above the line
              borderRadius: 0, // no border rounding
            },
          },
        },
      },
      datalabels: {
        display: false,
        anchor: "end",
        align: "top",
        color: "#000",
        clip: false,
        font: { weight: "bold", size: 8 },
        formatter: (value: number) => "Your score: " + value,
      },
    },
    elements: {
      point: {
        pointStyle: "circle",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Session No.",
          font: { weight: "normal", size: 10 },
        },
        grid: { display: false },
      },
      y: {
        title: {
          display: true,
          text: "Your skill score",
          font: { weight: "normal", size: 10 },
        },
        min: 0,
        max: 10,
        grid: { color: "#ebedef" },
      },
    },
  };

  return (
<div className="w-full h-48 p-2 bg-white shadow rounded-lg my-2">
      <Line data={data} options={options as any} />
    </div>
  );
}
