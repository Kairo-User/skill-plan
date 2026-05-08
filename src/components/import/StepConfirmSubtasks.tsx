"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ChatBubble } from "@/components/ui/ChatBubble";
import type { ParsedPlan, ParsedMonth } from "@/types/database";
import { formatMonth } from "@/lib/utils";

interface StepConfirmSubtasksProps {
  plan: ParsedPlan;
  onNext: (plan: ParsedPlan) => void;
  onBack: () => void;
}

export function StepConfirmSubtasks({ plan, onNext, onBack }: StepConfirmSubtasksProps) {
  const [months, setMonths] = useState(plan.months);
  const [expandedMonth, setExpandedMonth] = useState(0);

  function updateSubtask(monthIdx: number, subtaskIdx: number, text: string) {
    const next = [...months];
    next[monthIdx] = {
      ...next[monthIdx],
      subtasks: next[monthIdx].subtasks.map((s, i) =>
        i === subtaskIdx ? text : s
      ),
    };
    setMonths(next);
  }

  function addSubtask(monthIdx: number) {
    const next = [...months];
    next[monthIdx] = {
      ...next[monthIdx],
      subtasks: [...next[monthIdx].subtasks, ""],
    };
    setMonths(next);
  }

  function removeSubtask(monthIdx: number, subtaskIdx: number) {
    const next = [...months];
    next[monthIdx] = {
      ...next[monthIdx],
      subtasks: next[monthIdx].subtasks.filter((_, i) => i !== subtaskIdx),
    };
    setMonths(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <ChatBubble>检查一下每个月的子任务吧，点击月份展开～</ChatBubble>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {months.map((m, mi) => (
          <div key={mi} className="rounded-xl bg-[var(--muted)] overflow-hidden">
            <button
              onClick={() => setExpandedMonth(expandedMonth === mi ? -1 : mi)}
              className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-[var(--foreground)]"
            >
              {m.monthLabel}
              <span className="text-xs text-[var(--muted-foreground)]">
                {m.subtasks.length} 项
              </span>
            </button>

            {expandedMonth === mi && (
              <div className="px-4 pb-3 space-y-2">
                {m.subtasks.map((st, si) => (
                  <div key={si} className="flex items-center gap-2">
                    <Input
                      value={st}
                      onChange={(e) => updateSubtask(mi, si, e.target.value)}
                      className="flex-1"
                      placeholder="子任务..."
                    />
                    <button
                      onClick={() => removeSubtask(mi, si)}
                      className="text-[var(--muted-foreground)] hover:text-[var(--danger)] text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <Button variant="ghost" size="sm" onClick={() => addSubtask(mi)}>
                  + 添加子任务
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onBack}>
          ← 回退
        </Button>
        <Button onClick={() => onNext({ ...plan, months })}>
          下一步 →
        </Button>
      </div>
    </div>
  );
}
