"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CheckInRaw {
  skill_id: string;
  date: string;
  duration_minutes: number;
}

interface SkillRaw {
  id: string;
  name: string;
}

type TimeView = "daily" | "weekly" | "monthly" | "total";

const COLORS = [
  "#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#8b5cf6",
  "#06b6d4", "#ef4444", "#22c55e", "#e11d48", "#64748b",
];

interface StudyStatsProps {
  refreshKey?: number;
}

export function StudyStats({ refreshKey }: StudyStatsProps) {
  const [view, setView] = useState<TimeView>("monthly");
  const [allCheckIns, setAllCheckIns] = useState<CheckInRaw[]>([]);
  const [skills, setSkills] = useState<SkillRaw[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: ci } = await supabase.from("check_ins").select("skill_id, date, duration_minutes");
      const { data: sk } = await supabase.from("skills").select("id, name");
      setAllCheckIns(ci ?? []);
      setSkills(sk ?? []);
    }
    load();
  }, [refreshKey, supabase]);

  const skillMap = useMemo(() => {
    const map = new Map<string, string>();
    skills.forEach((s) => map.set(s.id, s.name));
    return map;
  }, [skills]);

  const { groups, totalMinutes, pieData } = useMemo(() => {
    const groups = new Map<string, Map<string, number>>();
    const overallSkill = new Map<string, number>();

    for (const ci of allCheckIns) {
      let key: string;
      switch (view) {
        case "daily":
          key = ci.date;
          break;
        case "weekly": {
          const d = new Date(ci.date + "T00:00:00");
          const dayOfWeek = d.getDay();
          const monday = new Date(d);
          monday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
          key = monday.toISOString().substring(0, 10);
          break;
        }
        case "monthly":
          key = ci.date.substring(0, 7);
          break;
        case "total":
          key = "总计";
          break;
      }

      if (!groups.has(key)) groups.set(key, new Map());
      const skillTimes = groups.get(key)!;
      skillTimes.set(ci.skill_id, (skillTimes.get(ci.skill_id) ?? 0) + ci.duration_minutes);
      overallSkill.set(ci.skill_id, (overallSkill.get(ci.skill_id) ?? 0) + ci.duration_minutes);
    }

    // Build pie data for current view
    const pieData = Array.from(overallSkill.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([skillId, minutes], idx) => ({
        name: skillMap.get(skillId) ?? "未知",
        minutes,
        color: COLORS[idx % COLORS.length],
      }));

    const totalMinutes = pieData.reduce((s, i) => s + i.minutes, 0);

    return { groups, totalMinutes, pieData };
  }, [allCheckIns, view, skillMap]);

  const sortedKeys = useMemo(
    () => [...groups.keys()].sort((a, b) => a.localeCompare(b)),
    [groups]
  );

  if (allCheckIns.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-[var(--muted-foreground)]">
        还没有打卡记录～开始打卡后这里会显示统计数据
      </div>
    );
  }

  return (
    <div>
      {/* View switcher */}
      <div className="flex gap-1 mb-4 bg-[var(--muted)] rounded-lg p-1">
        {([
          ["daily", "日"],
          ["weekly", "周"],
          ["monthly", "月"],
          ["total", "总计"],
        ] as const).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium rounded-md transition-colors",
              view === v
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Pie chart */}
      <div className="flex flex-col items-center mb-4">
        <PieChart data={pieData} total={totalMinutes} size={150} />
        <span className="text-xs text-[var(--muted-foreground)] mt-2">
          总计 {formatDuration(totalMinutes)}
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {pieData.map((item) => (
          <div key={item.name} className="flex items-center gap-1 text-[10px]">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-[var(--foreground)]">{item.name}</span>
            <span className="text-[var(--muted-foreground)]">{formatDuration(item.minutes)}</span>
          </div>
        ))}
      </div>

      {/* Bar chart for period views */}
      {view !== "total" && (
        <BarChart groups={groups} sortedKeys={sortedKeys} />
      )}

      {/* Detailed list */}
      {view === "total" && (
        <div className="space-y-1.5">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="flex-1 text-[var(--foreground)] truncate">{item.name}</span>
              <span className="text-[var(--muted-foreground)]">{formatDuration(item.minutes)}</span>
              <span className="text-[var(--muted-foreground)] w-8 text-right">
                {Math.round((item.minutes / totalMinutes) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PieChart({
  data,
  total,
  size,
}: {
  data: { name: string; minutes: number; color: string }[];
  total: number;
  size: number;
}) {
  const radius = size / 2 - 10;
  const center = size / 2;
  let accumulatedAngle = -Math.PI / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((item) => {
        const sliceAngle = (item.minutes / total) * 2 * Math.PI;
        const startAngle = accumulatedAngle;
        accumulatedAngle += sliceAngle;
        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(accumulatedAngle);
        const y2 = center + radius * Math.sin(accumulatedAngle);
        const largeArc = sliceAngle > Math.PI ? 1 : 0;
        return (
          <path
            key={item.name}
            d={`M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
            fill={item.color}
            stroke="var(--card)"
            strokeWidth={2}
          />
        );
      })}
    </svg>
  );
}

function BarChart({
  groups,
  sortedKeys,
}: {
  groups: Map<string, Map<string, number>>;
  sortedKeys: string[];
}) {
  const maxTotal = Math.max(
    ...[...groups.values()].map((m) => [...m.values()].reduce((a, b) => a + b, 0)),
    1
  );

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {sortedKeys.slice(-14).map((key) => {
        const skillTimes = groups.get(key)!;
        const total = [...skillTimes.values()].reduce((a, b) => a + b, 0);
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-medium text-[var(--foreground)]">{key}</span>
              <span className="text-xs text-[var(--muted-foreground)]">{formatDuration(total)}</span>
            </div>
            <div className="h-4 rounded-md bg-[var(--muted)] overflow-hidden flex">
              {[...skillTimes.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([sid, mins]) => (
                  <div
                    key={sid}
                    title={`${sid}: ${formatDuration(mins)}`}
                    style={{
                      width: `${(mins / maxTotal) * 100}%`,
                      backgroundColor: COLORS[[...skillTimes.keys()].indexOf(sid) % COLORS.length],
                    }}
                    className="h-full first:rounded-l-md last:rounded-r-md"
                  />
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
