"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDuration } from "@/lib/utils";

interface SkillTime {
  name: string;
  minutes: number;
  color: string;
}

const COLORS = [
  "#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#ef4444", "#22c55e", "#e11d48", "#64748b",
];

interface SkillTimePieChartProps {
  refreshKey?: number;
}

export function SkillTimePieChart({ refreshKey }: SkillTimePieChartProps) {
  const [data, setData] = useState<SkillTime[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: skills } = await supabase.from("skills").select("id, name");
      const { data: checkIns } = await supabase.from("check_ins").select("skill_id, duration_minutes");

      if (!skills || !checkIns) return;

      const timeBySkill = new Map<string, { name: string; minutes: number }>();
      for (const ci of checkIns) {
        const existing = timeBySkill.get(ci.skill_id);
        if (existing) {
          existing.minutes += ci.duration_minutes;
        } else {
          const skill = skills.find((s) => s.id === ci.skill_id);
          timeBySkill.set(ci.skill_id, {
            name: skill?.name ?? "未知",
            minutes: ci.duration_minutes,
          });
        }
      }

      const result: SkillTime[] = Array.from(timeBySkill.values())
        .filter((s) => s.minutes > 0)
        .sort((a, b) => b.minutes - a.minutes)
        .map((s, i) => ({ ...s, color: COLORS[i % COLORS.length] }));

      setData(result);
      setTotalMinutes(result.reduce((sum, s) => sum + s.minutes, 0));
    }
    load();
  }, [refreshKey, supabase]);

  if (data.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-[var(--muted-foreground)]">
        还没有打卡记录～开始打卡后这里会显示学习时长分布
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <PieChart data={data} totalMinutes={totalMinutes} size={180} />
      <div className="space-y-2 w-full max-w-xs">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="flex-1 text-[var(--foreground)] truncate">
              {item.name}
            </span>
            <span className="text-[var(--muted-foreground)]">
              {formatDuration(item.minutes)}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              {totalMinutes > 0
                ? Math.round((item.minutes / totalMinutes) * 100)
                : 0}
              %
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PieChart({
  data,
  totalMinutes,
  size,
}: {
  data: SkillTime[];
  totalMinutes: number;
  size: number;
}) {
  const radius = size / 2 - 10;
  const center = size / 2;
  let accumulatedAngle = -Math.PI / 2;

  const slices = data.map((item) => {
    const sliceAngle = (item.minutes / totalMinutes) * 2 * Math.PI;
    const startAngle = accumulatedAngle;
    accumulatedAngle += sliceAngle;
    return { ...item, startAngle, endAngle: accumulatedAngle };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((slice) => {
        const { startAngle, endAngle } = slice;
        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(endAngle);
        const y2 = center + radius * Math.sin(endAngle);
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

        const d = [
          `M ${center} ${center}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
          "Z",
        ].join(" ");

        return (
          <path
            key={slice.name}
            d={d}
            fill={slice.color}
            stroke="var(--card)"
            strokeWidth={2}
          />
        );
      })}
    </svg>
  );
}
