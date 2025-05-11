"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

interface ExamDetailsData {
  exam: {
    _id: string;
    title: string;
    totalQuestions: number;
    totalMarks: number;
    passMarkPercentage: number;
  };
  attempts: {
    total: number;
    byStatus: {
      "in-progress": number;
      completed: number;
      "timed-out": number;
      paused: number;
    };
  };
  results: {
    passed: {
      count: number;
      avgScore: number;
      maxScore: number;
      minScore: number;
    };
    failed: {
      count: number;
      avgScore: number;
      maxScore: number;
      minScore: number;
    };
  };
}

interface ExamStatisticsChartsProps {
  examDetails: ExamDetailsData;
}

export default function ExamStatisticsCharts({
  examDetails,
}: ExamStatisticsChartsProps) {
  const { attempts, results } = examDetails;

  // Prepare data for the attempt status pie chart
  const attemptStatusData = [
    { name: "Completed", value: attempts.byStatus.completed, fill: "#22c55e" },
    {
      name: "In Progress",
      value: attempts.byStatus["in-progress"],
      fill: "#3b82f6",
    },
    {
      name: "Timed Out",
      value: attempts.byStatus["timed-out"],
      fill: "#f97316",
    },
    { name: "Paused", value: attempts.byStatus.paused, fill: "#a855f7" },
  ].filter((item) => item.value > 0); // Only include non-zero values

  // Prepare data for the pass/fail pie chart
  const passFailData = [
    { name: "Passed", value: results.passed.count, fill: "#22c55e" },
    { name: "Failed", value: results.failed.count, fill: "#ef4444" },
  ].filter((item) => item.value > 0); // Only include non-zero values

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Attempt Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Attempt Status</CardTitle>
          <CardDescription>
            Breakdown of all exam attempts by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attempts.total > 0 ? (
            <div className="aspect-square w-full max-w-[300px] mx-auto">
              <AttemptStatusPieChart data={attemptStatusData} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No attempt data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pass/Fail Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Pass/Fail Distribution</CardTitle>
          <CardDescription>
            Pass and fail rate for completed attempts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attempts.byStatus.completed > 0 ? (
            <div className="aspect-square w-full max-w-[300px] mx-auto">
              <PassFailPieChart data={passFailData} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No completion data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Custom SVG-based pie chart for attempt status
function AttemptStatusPieChart({
  data,
}: {
  data: { name: string; value: number; fill: string }[];
}) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let currentAngle = 0;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g transform="translate(50,50)">
        {data.map((entry, index) => {
          // Calculate the angles for this slice
          const startAngle = currentAngle;
          const percentage = entry.value / total;
          const angleSize = percentage * 360;
          currentAngle += angleSize;
          const endAngle = currentAngle;

          // Convert angles to radians for calculations
          const startRad = ((startAngle - 90) * Math.PI) / 180;
          const endRad = ((endAngle - 90) * Math.PI) / 180;

          // Calculate the coordinates for the arc
          const x1 = 40 * Math.cos(startRad);
          const y1 = 40 * Math.sin(startRad);
          const x2 = 40 * Math.cos(endRad);
          const y2 = 40 * Math.sin(endRad);

          // Determine the large arc flag
          const largeArcFlag = angleSize > 180 ? 1 : 0;

          // Create the path for the slice
          const pathData = [
            `M ${x1} ${y1}`, // Move to the start point
            `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Draw the arc
            `L 0 0`, // Draw line to center
            `Z`, // Close the path
          ].join(" ");

          // Calculate text position (at the middle angle of the slice)
          const midAngle = startAngle + angleSize / 2;
          const midRad = ((midAngle - 90) * Math.PI) / 180;
          const textX = 25 * Math.cos(midRad);
          const textY = 25 * Math.sin(midRad);

          return (
            <g key={`slice-${index}`}>
              <path
                d={pathData}
                fill={entry.fill}
                stroke="white"
                strokeWidth="1"
              />
              {percentage > 0.1 && (
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="5"
                  fontWeight="bold"
                >
                  {Math.round(percentage * 100)}%
                </text>
              )}
            </g>
          );
        })}
      </g>

      {/* Legend */}
      <g transform="translate(0, 65)">
        {data.map((entry, index) => (
          <g key={`legend-${index}`} transform={`translate(35, ${index * 8})`}>
            <rect width="6" height="6" fill={entry.fill} />
            <text x="9" y="5" fontSize="4" fill="#374151">
              {entry.name} ({entry.value})
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// Custom SVG-based pie chart for pass/fail
function PassFailPieChart({
  data,
}: {
  data: { name: string; value: number; fill: string }[];
}) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let currentAngle = 0;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <g transform="translate(50,50)">
        {data.map((entry, index) => {
          // Calculate the angles for this slice
          const startAngle = currentAngle;
          const percentage = entry.value / total;
          const angleSize = percentage * 360;
          currentAngle += angleSize;
          const endAngle = currentAngle;

          // Convert angles to radians for calculations
          const startRad = ((startAngle - 90) * Math.PI) / 180;
          const endRad = ((endAngle - 90) * Math.PI) / 180;

          // Calculate the coordinates for the arc
          const x1 = 40 * Math.cos(startRad);
          const y1 = 40 * Math.sin(startRad);
          const x2 = 40 * Math.cos(endRad);
          const y2 = 40 * Math.sin(endRad);

          // Determine the large arc flag
          const largeArcFlag = angleSize > 180 ? 1 : 0;

          // Create the path for the slice
          const pathData = [
            `M ${x1} ${y1}`, // Move to the start point
            `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Draw the arc
            `L 0 0`, // Draw line to center
            `Z`, // Close the path
          ].join(" ");

          // Calculate text position (at the middle angle of the slice)
          const midAngle = startAngle + angleSize / 2;
          const midRad = ((midAngle - 90) * Math.PI) / 180;
          const textX = 25 * Math.cos(midRad);
          const textY = 25 * Math.sin(midRad);

          return (
            <g key={`slice-${index}`}>
              <path
                d={pathData}
                fill={entry.fill}
                stroke="white"
                strokeWidth="1"
              />
              {percentage > 0.05 && (
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="5"
                  fontWeight="bold"
                >
                  {Math.round(percentage * 100)}%
                </text>
              )}
            </g>
          );
        })}
      </g>

      {/* Legend with percentages */}
      <g transform="translate(30, 65)">
        {data.map((entry, index) => (
          <g key={`legend-${index}`} transform={`translate(0, ${index * 8})`}>
            <rect width="6" height="6" fill={entry.fill} />
            <text x="9" y="5" fontSize="4" fill="#374151">
              {entry.name}: {entry.value} (
              {Math.round((entry.value / total) * 100)}%)
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
