"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { PerformanceData } from "@/types/dashboardTypes";

// Register all Chart.js components
Chart.register(...registerables);

interface ChartProps {
  data: PerformanceData;
}

export function AdvancedChart({ data }: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current && data?.labels && data?.datasets) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Create gradient for the first dataset (Pass Rate)
        const gradient1 = ctx.createLinearGradient(0, 0, 0, 300);
        gradient1.addColorStop(0, "rgba(59, 130, 246, 0.5)"); // Blue-500 with 50% opacity
        gradient1.addColorStop(1, "rgba(59, 130, 246, 0.0)");

        // Create gradient for the second dataset (Participation)
        const gradient2 = ctx.createLinearGradient(0, 0, 0, 300);
        gradient2.addColorStop(0, "rgba(168, 85, 247, 0.4)"); // Purple-500 with 40% opacity
        gradient2.addColorStop(1, "rgba(168, 85, 247, 0.0)");

        // Ensure we have valid data
        const labels = data.labels || [];
        const dataset1Data = data.datasets[0]?.data || [];
        const dataset2Data = data.datasets[1]?.data || [];
        const dataset1Label = data.datasets[0]?.label || "Dataset 1";
        const dataset2Label = data.datasets[1]?.label || "Dataset 2";

        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: dataset1Label,
                data: dataset1Data,
                borderColor: "#3b82f6", // Blue-500
                backgroundColor: gradient1,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "#3b82f6",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
              },
              {
                label: dataset2Label,
                data: dataset2Data,
                borderColor: "#a855f7", // Purple-500
                backgroundColor: gradient2,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "#a855f7",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  usePointStyle: true,
                  boxWidth: 6,
                  font: {
                    size: 12,
                  },
                },
              },
              tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                titleColor: "#111827",
                bodyColor: "#374151",
                borderColor: "#e5e7eb",
                borderWidth: 1,
                padding: 10,
                boxPadding: 5,
                cornerRadius: 8,
                usePointStyle: true,
                callbacks: {
                  label: function (context) {
                    const label = context.dataset.label || "";
                    const value = context.parsed.y;
                    return `${label}: ${
                      typeof value === "number" ? value.toFixed(1) : value
                    }${
                      label.includes("Rate") || label.includes("Participation")
                        ? "%"
                        : ""
                    }`;
                  },
                },
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  font: {
                    size: 11,
                  },
                  maxRotation: 0,
                },
              },
              y: {
                beginAtZero: true,
                max: 100, // Assuming percentage values
                grid: {
                  color: "rgba(0, 0, 0, 0.1)",
                  lineWidth: 0.5,
                },
                ticks: {
                  font: {
                    size: 11,
                  },
                  callback: function (value) {
                    return value + "%";
                  },
                },
              },
            },
            interaction: {
              mode: "index",
              intersect: false,
            },
            animation: {
              duration: 1000,
              easing: "easeInOutQuart",
            },
            elements: {
              line: {
                tension: 0.4,
              },
              point: {
                hoverRadius: 8,
              },
            },
          },
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  // Handle loading state
  if (!data || !data.labels || !data.datasets || data.labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <canvas ref={chartRef} />
    </div>
  );
}
