"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ChatBubble } from "@/components/ui/ChatBubble";

interface StepInputDailyProps {
  onNext: (data: { dailyTasks: string[] }) => void;
  onBack: () => void;
}

export function StepInputDaily({ onNext, onBack }: StepInputDailyProps) {
  const [tasks, setTasks] = useState<string[]>([]);
  const [newText, setNewText] = useState("");

  function add() {
    const t = newText.trim();
    if (!t || tasks.includes(t)) return;
    setTasks([...tasks, t]);
    setNewText("");
  }

  function remove(idx: number) {
    setTasks(tasks.filter((_, i) => i !== idx));
  }

  return (
    <div className="flex flex-col gap-4">
      <ChatBubble>添加每日任务（可选，每天刷新）～</ChatBubble>

      <div className="flex gap-2">
        <Input placeholder="每日任务，如：背50个单词" value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }} />
        <Button size="sm" onClick={add}>添加</Button>
      </div>

      {tasks.length > 0 && (
        <div className="space-y-1 max-h-[200px] overflow-y-auto">
          {tasks.map((t, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--muted)] text-sm">
              <span className="flex-1 text-[var(--foreground)]">{t}</span>
              <button onClick={() => remove(i)} className="text-xs text-[var(--muted-foreground)] hover:text-[var(--danger)]">✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onBack}>← 回退</Button>
        <Button onClick={() => onNext({ dailyTasks: tasks })}>
          {tasks.length > 0 ? "下一步 →" : "跳过 →"}
        </Button>
      </div>
    </div>
  );
}
