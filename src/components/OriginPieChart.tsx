"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { InputShare } from "@/lib/api";

const COLORS = ["#e12729", "#f37324", "#f8cc1b", "#72b043", "#0c8fc7"];

interface OriginPieChartProps {
  inputs: InputShare[];
}

function buildChartData(inputs: InputShare[]) {
  return [...inputs]
    .sort((a, b) => (Number(b.percentage) || 0) - (Number(a.percentage) || 0))
    .map((input) => ({
      name: `${input.input_name} (${input.country})`,
      value: Number(input.percentage) || 0,
    }))
    .filter((d) => d.value > 0);
}

export function OriginPieChart({ inputs }: OriginPieChartProps) {
  const data = buildChartData(inputs);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={120}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}%`} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export { COLORS };
