"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { WHEEL_AREAS, type WheelValues } from "@/lib/wheel";

export default function WheelRadarChart({ values }: { values: WheelValues }) {
  const data = WHEEL_AREAS.map((a) => ({ area: a.label, value: values[a.key] ?? 5 }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="rgba(42,46,74,0.15)" />
        <PolarAngleAxis dataKey="area" tick={{ fontSize: 10, fill: "#2a2e4a" }} />
        <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
        <Radar
          dataKey="value"
          stroke="#8a6fd3"
          fill="#8a6fd3"
          fillOpacity={0.35}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
