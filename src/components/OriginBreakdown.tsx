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
    (a, b) => (b.percentage || 0) - (a.percentage || 0)
  );

  return (
    <div className="flex flex-col gap-4">
      <OriginPieChart inputs={inputs} />
      <div className="flex flex-col gap-3">
        {sortedInputs.map((input, index) => (
          <div
            key={input.input_id}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-[#1F2A24]">
                {input.country} — {input.input_name}
              </span>
            </div>
            <span className="text-sm font-medium text-[#5F6C65]">
              {input.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
