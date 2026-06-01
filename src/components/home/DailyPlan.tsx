"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { today } from "@/lib/utils";

interface DailyItem {
  id: string;
  text: string;
  skillName: string;
  skillId: string;
  done_today: boolean;
}

export function DailyPlan() {
  const [items, setItems] = useState<DailyItem[]>([]);
  const supabase = createClient();
  const todayStr = today();

  async function load() {
    const { data: skills } = await supabase.from("skills").select("id, name");
    if (!skills || skills.length === 0) { setItems([]); return; }

    const { data: tasks } = await supabase.from("daily_tasks").select("*").in("skill_id", skills.map((s) => s.id)).order("sort_order");
    if (!tasks || tasks.length === 0) { setItems([]); return; }

    const { data: comp } = await supabase.from("daily_completions").select("daily_task_id").eq("date", todayStr);
    const doneIds = new Set((comp ?? []).map((c) => c.daily_task_id));

    const nameMap = new Map(skills.map((s) => [s.id, s.name]));
    setItems(tasks.map((t) => ({
      id: t.id, text: t.text,
      skillName: nameMap.get(t.skill_id) ?? "",
      skillId: t.skill_id,
      done_today: doneIds.has(t.id),
    })));
  }

  useEffect(() => { load(); }, [supabase]);

  async function toggle(item: DailyItem) {
    if (item.done_today) {
      await supabase.from("daily_completions").delete().eq("daily_task_id", item.id).eq("date", todayStr);
    } else {
      await supabase.from("daily_completions").insert({ daily_task_id: item.id, date: todayStr });
    }
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, done_today: !i.done_today } : i));
  }

  const incomplete = items.filter((i) => !i.done_today);

  return (
    <section>
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
        今日待办 {incomplete.length > 0 && <span className="text-sm text-[var(--muted-foreground)]">({incomplete.length}项)</span>}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
          还没有每日任务～在技能详情页的"每日"标签中添加
        </p>
      ) : incomplete.length === 0 ? (
        <p className="text-sm text-[var(--success)] text-center py-4">全部完成 🎉</p>
      ) : null}
      <div className="space-y-1">
        {items.map((item) => (
          <label key={item.id}
            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
              item.done_today ? "bg-[var(--success)]/5" : "hover:bg-[var(--muted)]"
            }`}>
            <input type="checkbox" checked={item.done_today} onChange={() => toggle(item)}
              className="accent-[var(--primary)] w-4 h-4" />
            <span className={`flex-1 text-sm ${item.done_today ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}>
              {item.text}
            </span>
            <Link href={`/skill/${item.skillId}?tab=daily`}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)]">
              {item.skillName}
            </Link>
          </label>
        ))}
      </div>
    </section>
  );
}
