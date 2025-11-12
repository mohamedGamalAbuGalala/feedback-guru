"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface DataPoint {
  name: string;
  value: number;
}

interface CategoryChartProps {
  data: DataPoint[];
}

const COLORS = {
  BUG: "#ef4444", // red
  FEATURE_REQUEST: "#3b82f6", // blue
  IMPROVEMENT: "#10b981", // green
  QUESTION: "#f59e0b", // amber
  OTHER: "#6b7280", // gray
};

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.map((item) => ({
    name: item.name.replace("_", " "),
    value: item.value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[entry.name.toUpperCase().replace(" ", "_") as keyof typeof COLORS] || COLORS.OTHER}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
