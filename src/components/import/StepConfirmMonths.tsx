"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ChatBubble } from "@/components/ui/ChatBubble";
import type { ParsedPlan, ParsedMonth } from "@/types/database";
import { formatMonth } from "@/lib/utils";

interface StepConfirmMonthsProps {
  plan: ParsedPlan;
  onNext: (plan: ParsedPlan) => void;
  onBack: () => void;
}

export function StepConfirmMonths({ plan, onNext, onBack }: StepConfirmMonthsProps) {
  const [months, setMonths] = useState(plan.months);

  function addMonth() {
    const last = months[months.length - 1];
    const nextDate = last
      ? (() => {
          const d = new Date(last.monthDate + "T00:00:00");
          d.setMonth(d.getMonth() + 1);
          return d.toISOString().substring(0, 7) + "-01";
        })()
      : new Date().toISOString().substring(0, 7) + "-01";

    setMonths([
      ...months,
      {
        monthLabel: formatMonth(nextDate),
        monthDate: nextDate,
        subtasks: [],
      },
    ]);
  }

  function removeMonth(index: number) {
    setMonths(months.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      <ChatBubble>这些是你计划的月份，可以增删改～</ChatBubble>

      <div className="space-y-3">
        {months.map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={m.monthLabel}
              onChange={(e) => {
                const next = [...months];
                next[i] = { ...next[i], monthLabel: e.target.value };
                setMonths(next);
              }}
              className="flex-1"
            />
            <button
              onClick={() => removeMonth(i)}
              className="text-[var(--muted-foreground)] hover:text-[var(--danger)] transition-colors text-sm flex-shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <Button variant="ghost" onClick={addMonth}>
        + 添加月份
      </Button>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onBack}>
          ← 回退
        </Button>
        <Button onClick={() => onNext({ ...plan, months })} disabled={months.length === 0}>
          下一步 →
        </Button>
      </div>
    </div>
  );
}
