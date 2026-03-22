"use client";

import { InputShare } from "@/lib/api";
import { OriginPieChart, COLORS } from "./OriginPieChart";

interface OriginBreakdownProps {
  inputs: InputShare[];
}

export function OriginBreakdown({ inputs }: OriginBreakdownProps) {
  if (inputs.length === 0) {
    return <p>No origin breakdown available.</p>;
  }

  const sortedInputs = [...inputs].sort(
    (a, b) => (Number(b.percentage) || 0) - (Number(a.percentage) || 0)
  );

  return (
    <div className="space-y-6">
      <OriginPieChart inputs={inputs} />

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 w-4"></th>
            <th className="text-left py-2">Input</th>
            <th className="text-left py-2">Country</th>
            <th className="text-right py-2">Percentage</th>
          </tr>
        </thead>
        <tbody>
          {sortedInputs.map((input, i) => (
            <tr key={input.input_id} className="border-b">
              <td className="py-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
              </td>
              <td className="py-2">{input.input_name}</td>
              <td className="py-2">{input.country}</td>
              <td className="py-2 text-right">{input.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
