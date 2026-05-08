"use client";

import { Card } from "@/components/ui/Card";
import type { Skill, CheckIn } from "@/types/database";

interface SkillCardProps {
  skill: Skill;
  todayCheckIn: CheckIn | null;
  onCheckIn: () => void;
}

export function SkillCard({ skill, todayCheckIn, onCheckIn }: SkillCardProps) {
  const checked = !!todayCheckIn;
  const hours = todayCheckIn
    ? Math.floor(todayCheckIn.duration_minutes / 60)
    : 0;
  const mins = todayCheckIn ? todayCheckIn.duration_minutes % 60 : 0;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-[var(--foreground)]">{skill.name}</h3>
          {checked ? (
            <p className="text-xs text-[var(--success)] mt-1">
              今日已打卡 ·{" "}
              {hours > 0 && `${hours}小时`}
              {mins > 0 && `${mins}分`}
            </p>
          ) : (
            <p className="text-xs text-[var(--danger)] mt-1">
              今天还没打卡哦～
            </p>
          )}
        </div>
        <button
          onClick={onCheckIn}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            checked
              ? "bg-[var(--success)] text-white"
              : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
          }`}
        >
          {checked ? "再打一次" : "打卡"}
        </button>
      </div>
    </Card>
  );
}
