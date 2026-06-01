"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useSkillTab } from "@/lib/skill-context";
import { today } from "@/lib/utils";
import type { DailyTask } from "@/types/database";

interface DailyPlanTabProps {
  skillId: string;
}

export function DailyPlanTab({ skillId }: DailyPlanTabProps) {
  const { editMode, setEditMode } = useSkillTab();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [newText, setNewText] = useState("");
  const [error, setError] = useState("");
  const supabase = createClient();
  const todayStr = today();

  const load = useCallback(async () => {
    const { data: dt, error: dtErr } = await supabase.from("daily_tasks").select("*").eq("skill_id", skillId).order("sort_order");
    if (dtErr) { setError("加载每日任务失败：" + dtErr.message); return; }
    const { data: comp } = await supabase.from("daily_completions").select("daily_task_id").eq("date", todayStr);
    const doneIds = new Set((comp ?? []).map((c) => c.daily_task_id));
    setTasks((dt ?? []).map((t) => ({ ...t, done_today: doneIds.has(t.id) })));
    setError("");
  }, [skillId, todayStr, supabase]);

  useEffect(() => { load(); }, [load]);

  async function addTask() {
    const text = newText.trim();
    if (!text) { setError("请输入任务内容"); return; }
    if (tasks.some((t) => t.text === text)) { setError("已存在同名任务"); return; }
    setError("");
    const { data, error: insErr } = await supabase.from("daily_tasks")
      .insert({ skill_id: skillId, text, sort_order: tasks.length })
      .select().single();
    if (insErr) { setError("添加失败：" + insErr.message); return; }
    if (data) {
      setTasks((prev) => [...prev, { ...data, done_today: false }]);
      setNewText("");
      setEditMode(false);
    }
  }

  async function toggleTask(task: DailyTask) {
    if (task.done_today) {
      const { error: delErr } = await supabase.from("daily_completions").delete().eq("daily_task_id", task.id).eq("date", todayStr);
      if (delErr) { setError("操作失败：" + delErr.message); return; }
      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, done_today: false } : t));
    } else {
      const { error: insErr } = await supabase.from("daily_completions").insert({ daily_task_id: task.id, date: todayStr });
      if (insErr) { setError("操作失败：" + insErr.message); return; }
      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, done_today: true } : t));
    }
    setError("");
  }

  async function deleteTask(id: string) {
    await supabase.from("daily_tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--foreground)]">每日任务</h3>
        {!editMode && (
          <Button size="sm" variant="secondary" onClick={() => setEditMode(true)}>+ 添加</Button>
        )}
      </div>

      {editMode && (
        <div className="flex gap-2 mb-4">
          <Input placeholder="每日任务，如：背50个单词" value={newText}
            onChange={(e) => { setNewText(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") addTask(); }} />
          <Button size="sm" onClick={addTask}>添加</Button>
          <Button variant="ghost" size="sm" onClick={() => { setEditMode(false); setError(""); }}>取消</Button>
        </div>
      )}

      {error && <p className="text-xs text-[var(--danger)] mb-3">{error}</p>}

      {tasks.length === 0 && !editMode && (
        <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
          暂无每日任务，点击"+ 添加"创建一个
        </p>
      )}

      <div className="space-y-1">
        {tasks.map((t) => (
          <label key={t.id}
            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
              t.done_today ? "bg-[var(--success)]/5" : "hover:bg-[var(--muted)]"
            }`}>
            <input type="checkbox" checked={!!t.done_today} onChange={() => toggleTask(t)}
              className="accent-[var(--primary)] w-4 h-4" />
            <span className={`flex-1 text-sm ${t.done_today ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}>
              {t.text}
            </span>
            {editMode && (
              <button onClick={(e) => { e.preventDefault(); deleteTask(t.id); }}
                className="text-xs text-[var(--danger)] font-bold">✕</button>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
