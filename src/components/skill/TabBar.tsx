"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface TabBarProps {
  skillId: string;
  activeTab: "checkin" | "plan" | "knowledge";
  currentMonth: string;
}

const TABS = [
  { key: "checkin" as const, label: "打卡", icon: "📝" },
  { key: "plan" as const, label: "规划", icon: "📋" },
  { key: "knowledge" as const, label: "知识库", icon: "🧠" },
];

export function TabBar({ skillId, activeTab, currentMonth }: TabBarProps) {
  return (
    <div className="flex border-b border-[var(--border)] mb-4">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/skill/${skillId}?tab=${tab.key}&month=${currentMonth}`}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === tab.key
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          )}
        >
          <span className="text-base">{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </Link>
      ))}
    </div>
  );
}
