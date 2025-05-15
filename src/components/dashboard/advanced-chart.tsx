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
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Create gradient for the first dataset
        const gradient1 = ctx.createLinearGradient(0, 0, 0, 300);
        gradient1.addColorStop(0, "rgba(59, 130, 246, 0.5)"); // Blue-500 with 50% opacity
        gradient1.addColorStop(1, "rgba(59, 130, 246, 0.0)");

        // Create gradient for the second dataset
        const gradient2 = ctx.createLinearGradient(0, 0, 0, 300);
        gradient2.addColorStop(0, "rgba(168, 85, 247, 0.4)"); // Purple-500 with 40% opacity
        gradient2.addColorStop(1, "rgba(168, 85, 247, 0.0)");

        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: data.labels,
            datasets: [
              {
                label: data.datasets[0].label,
                data: data.datasets[0].data,
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
                label: data.datasets[1].label,
                data: data.datasets[1].data,
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
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                titleColor: "#111827",
                bodyColor: "#374151",
                borderColor: "#e5e7eb",
                borderWidth: 1,
                padding: 10,
                boxPadding: 5,
                cornerRadius: 8,
                usePointStyle: true,
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  font: {
                    size: 10,
                  },
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  // Use an alternative styling approach
                  color: "rgba(0, 0, 0, 0.1)",
                  lineWidth: 0.5,
                },
                ticks: {
                  font: {
                    size: 10,
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

  return <canvas ref={chartRef} />;
}
