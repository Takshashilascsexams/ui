"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { PerformanceData } from "@/types/dashboardTypes";

interface ChartProps {
  data: PerformanceData;
}

export function ChartComponent({ data }: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: data.labels,
            datasets: data.datasets.map((dataset, index) => ({
              label: dataset.label,
              data: dataset.data,
              borderColor: index === 0 ? "#3b82f6" : "#a855f7",
              backgroundColor:
                index === 0
                  ? "rgba(59, 130, 246, 0.1)"
                  : "rgba(168, 85, 247, 0.1)",
              tension: 0.3,
            })),
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
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
