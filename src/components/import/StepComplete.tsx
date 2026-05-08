"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { ParsedPlan } from "@/types/database";

interface StepCompleteProps {
  plan: ParsedPlan;
  onBack: () => void;
}

export function StepComplete({ plan, onBack }: StepCompleteProps) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSave() {
    setSaving(true);

    // Insert skill
    const { data: skill, error: skillError } = await supabase
      .from("skills")
      .insert({ name: plan.skillName })
      .select()
      .single();

    if (skillError || !skill) {
      setSaving(false);
      return;
    }

    // Insert monthly goals + subtasks
    for (const month of plan.months) {
      const { data: goal } = await supabase
        .from("monthly_goals")
        .insert({
          skill_id: skill.id,
          month: month.monthDate,
        })
        .select()
        .single();

      if (goal && month.subtasks.length > 0) {
        await supabase.from("subtasks").insert(
          month.subtasks
            .filter((t) => t.trim())
            .map((text, i) => ({
              monthly_goal_id: goal.id,
              text,
              sort_order: i,
            }))
        );
      }
    }

    setSaving(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <ChatBubble>搞定啦！计划已经安排好，去首页看看吧～</ChatBubble>
        <Button onClick={() => router.push("/")} size="lg">
          返回首页 ✨
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ChatBubble>
        准备好了！一共 {plan.months.length} 个月份，合计{" "}
        {plan.months.reduce((sum, m) => sum + m.subtasks.length, 0)} 个子任务。
        <br />
        确认无误就可以保存啦～
      </ChatBubble>

      <div className="space-y-2 text-sm text-[var(--muted-foreground)] max-h-[200px] overflow-y-auto">
        <p className="font-medium text-[var(--foreground)]">
          {plan.skillName}
        </p>
        {plan.months.map((m, i) => (
          <div key={i} className="ml-4">
            <p className="text-[var(--foreground)]">{m.monthLabel}</p>
            {m.subtasks.map((st, j) => (
              <p key={j} className="ml-4 text-xs">
                - {st}
              </p>
            ))}
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onBack}>
          ← 回退
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "保存中..." : "保存导入"}
        </Button>
      </div>
    </div>
  );
}
