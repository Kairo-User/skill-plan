"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ChatBubble } from "@/components/ui/ChatBubble";

const MONTHS = [
  "1月","2月","3月","4月","5月","6月",
  "7月","8月","9月","10月","11月","12月",
];

export interface SubtaskMonth {
  year: number;
  month: number; // 1-12
}

export interface SubtaskInput {
  text: string;
  months: SubtaskMonth[]; // empty = unassigned
}

interface StepInputSubtasksProps {
  onNext: (data: { subtasks: SubtaskInput[] }) => void;
  onBack: () => void;
}

export function StepInputSubtasks({ onNext, onBack }: StepInputSubtasksProps) {
  const [subtasks, setSubtasks] = useState<SubtaskInput[]>([]);
  const [newText, setNewText] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  function addSubtask() {
    const trimmed = newText.trim();
    if (!trimmed) return;
    if (subtasks.some((s) => s.text === trimmed)) return;
    setSubtasks([...subtasks, { text: trimmed, months: [] }]);
    setNewText("");
  }

  function removeSubtask(idx: number) {
    setSubtasks(subtasks.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  }

  function toggleMonth(idx: number, monthNum: number) {
    setSubtasks((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        const exists = s.months.find((m) => m.year === year && m.month === monthNum);
        const months = exists
          ? s.months.filter((m) => !(m.year === year && m.month === monthNum))
          : [...s.months, { year, month: monthNum }];
        return { ...s, months };
      })
    );
  }

  function isMonthSelected(idx: number, monthNum: number): boolean {
    return subtasks[idx].months.some((m) => m.year === year && m.month === monthNum);
  }

  function formatMonths(months: SubtaskMonth[]): string {
    if (months.length === 0) return "未指定月份";
    // Group by year
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

  function getMonthStatus(idx: number): { color: string; text: string } {
    const count = subtasks[idx].months.length;
    if (count === 0) return { color: "text-[var(--muted-foreground)]", text: "未指定月份" };
    return { color: "text-[var(--primary)]", text: `${count}个月` };
  }

  return (
    <div className="flex flex-col gap-4">
      <ChatBubble>
        添加子任务，然后为每个子任务选择预计在哪几个月完成。
        <br />
        可以不选月份，后期再分配～
      </ChatBubble>

      {/* Add new subtask */}
      <div className="flex gap-2">
        <Input
          placeholder="输入子任务名称..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addSubtask(); }}
          className="flex-1"
        />
        <Button size="sm" onClick={addSubtask} disabled={!newText.trim()}>
          添加
        </Button>
      </div>

      {/* Subtask list */}
      {subtasks.length > 0 && (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {subtasks.map((st, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-[var(--muted)] p-4"
            >
              {/* Subtask header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {st.text}
                </span>
                <span className="flex items-center gap-2">
                  <span className={`text-xs ${getMonthStatus(idx).color}`}>
                    {getMonthStatus(idx).text}
                  </span>
                  <button
                    onClick={() => setEditingIdx(editingIdx === idx ? null : idx)}
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    {editingIdx === idx ? "收起" : "选择月份"}
                  </button>
                </span>
              </div>

              {/* Selected months summary */}
              {st.months.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {st.months
                    .sort((a, b) => a.year - b.year || a.month - b.month)
                    .map((m, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full text-xs bg-[var(--primary)] text-[var(--primary-foreground)]"
                      >
                        {m.year}年{m.month}月
                      </span>
                    ))}
                </div>
              )}

              {/* Month picker (visible when editing) */}
              {editingIdx === idx && (
                <div className="mt-2 pt-3 border-t border-[var(--border)]">
                  {/* Year selector */}
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <button
                      onClick={() => setYear(year - 1)}
                      className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1"
                    >
                      ◀
                    </button>
                    <span className="text-sm font-bold text-[var(--foreground)]">
                      {year}年
                    </span>
                    <button
                      onClick={() => setYear(year + 1)}
                      className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1"
                    >
                      ▶
                    </button>
                  </div>

                  {/* Month buttons */}
                  <div className="grid grid-cols-6 gap-1.5 mb-3">
                    {MONTHS.map((label, i) => {
                      const monthNum = i + 1;
                      const selected = isMonthSelected(idx, monthNum);
                      return (
                        <button
                          key={monthNum}
                          onClick={() => toggleMonth(idx, monthNum)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            selected
                              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--border)]"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSubtasks((prev) =>
                          prev.map((s, i) =>
                            i === idx ? { ...s, months: [] } : s
                          )
                        );
                      }}
                      className="text-xs text-[var(--muted-foreground)] hover:text-[var(--danger)]"
                    >
                      清空月份
                    </button>
                    <button
                      onClick={() => setEditingIdx(null)}
                      className="text-xs text-[var(--primary)] font-medium"
                    >
                      完成
                    </button>
                  </div>
                </div>
              )}

              {/* Delete */}
              <button
                onClick={() => removeSubtask(idx)}
                className="text-xs text-[var(--danger)] mt-2"
              >
                删除此子任务
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onBack}>← 回退</Button>
        <Button onClick={() => onNext({ subtasks })}>
          下一步 →
        </Button>
      </div>
    </div>
  );
}
