"use client";

import { cn } from "@/lib/utils";

interface TabBarProps {
  activeTab: SkillTab;
  onTabChange: (tab: SkillTab) => void;
}

import type { SkillTab } from "@/lib/skill-context";

const TABS = [
  { key: "checkin" as const, label: "打卡", icon: "📝" },
  { key: "daily" as const, label: "每日", icon: "☀️" },
  { key: "plan" as const, label: "规划", icon: "📋" },
  { key: "knowledge" as const, label: "知识库", icon: "🧠" },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex border-b border-[var(--border)] mb-4">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === tab.key
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          <span className="text-base">{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
