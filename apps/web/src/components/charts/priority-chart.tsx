"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

interface DataPoint {
  name: string;
  value: number;
}

interface PriorityChartProps {
  data: DataPoint[];
}

const PRIORITY_COLORS = {
  LOW: "#10b981", // green
  MEDIUM: "#f59e0b", // amber
  HIGH: "#f97316", // orange
  URGENT: "#ef4444", // red
};

const PRIORITY_ORDER = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function PriorityChart({ data }: PriorityChartProps) {
  // Sort by priority order
  const sortedData = [...data].sort((a, b) => {
    return (
      PRIORITY_ORDER.indexOf(a.name.toUpperCase()) -
      PRIORITY_ORDER.indexOf(b.name.toUpperCase())
    );
  });

  const chartData = sortedData.map((item) => ({
    name: item.name,
    count: item.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" name="Feedback Count">
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                PRIORITY_COLORS[
                  entry.name.toUpperCase() as keyof typeof PRIORITY_COLORS
                ] || "#6b7280"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
