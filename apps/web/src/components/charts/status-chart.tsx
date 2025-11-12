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
} from "recharts";

interface DataPoint {
  name: string;
  value: number;
}

interface StatusChartProps {
  data: DataPoint[];
}

const STATUS_COLORS = {
  NEW: "#3b82f6", // blue
  REVIEWING: "#f59e0b", // amber
  PLANNED: "#8b5cf6", // purple
  IN_PROGRESS: "#06b6d4", // cyan
  COMPLETED: "#10b981", // green
  REJECTED: "#ef4444", // red
};

export function StatusChart({ data }: StatusChartProps) {
  const chartData = data.map((item) => ({
    name: item.name.replace("_", " "),
    count: item.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={100} />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" name="Feedback Count">
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                STATUS_COLORS[
                  entry.name.toUpperCase().replace(" ", "_") as keyof typeof STATUS_COLORS
                ] || "#6b7280"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
