"use client";

import { Button } from "@/components/ui/Button";
import { ChatBubble } from "@/components/ui/ChatBubble";
import type { SubtaskInput, SubtaskMonth } from "./StepInputSubtasks";

interface StepReviewProps {
  skillName: string;
  subtasks: SubtaskInput[];
  onSave: () => void;
  onBack: () => void;
}

function formatMonths(months: SubtaskMonth[]): string {
  if (months.length === 0) return "未指定月份";
  const grouped = new Map<number, number[]>();
  for (const m of months) {
    if (!grouped.has(m.year)) grouped.set(m.year, []);
    grouped.get(m.year)!.push(m.month);
  }
  return [...grouped.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([y, ms]) => `${y}年${ms.sort((a,b)=>a-b).join("、")}月`)
    .join(" ");
}

export function StepReview({ skillName, subtasks, onSave, onBack }: StepReviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <ChatBubble>确认一下你的学习计划～</ChatBubble>

      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        <div className="p-3 rounded-xl bg-[var(--muted)]">
          <p className="text-xs text-[var(--muted-foreground)]">计划名称</p>
          <p className="font-semibold text-[var(--foreground)]">{skillName}</p>
        </div>

        <div className="p-3 rounded-xl bg-[var(--muted)]">
          <p className="text-xs text-[var(--muted-foreground)] mb-2">
            {subtasks.length} 个子任务
          </p>
          <div className="space-y-2">
            {subtasks.map((st, i) => (
              <div key={i} className="text-sm">
                <span className="text-[var(--foreground)]">{st.text}</span>
                <span className={`ml-2 ${st.months.length === 0 ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"}`}>
                  → {formatMonths(st.months)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onBack}>← 回退</Button>
        <Button onClick={onSave}>保存导入</Button>
      </div>
    </div>
  );
}
