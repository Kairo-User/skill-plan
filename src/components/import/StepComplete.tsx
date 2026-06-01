"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { ParsedPlan } from "@/types/database";

interface StepCompleteProps {
  plan: ParsedPlan;
  dailyTasks: string[];
  onBack: () => void;
}

export function StepComplete({ plan, dailyTasks, onBack }: StepCompleteProps) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("登录状态失效，请刷新页面重新登录");
      setSaving(false);
      return;
    }

    // Check duplicate name
    const { data: existing } = await supabase
      .from("skills")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", plan.skillName)
      .limit(1);

    if (existing && existing.length > 0) {
      setError(`已存在同名技能「${plan.skillName}」，请回退修改名称`);
      setSaving(false);
      return;
    }

    // Insert skill
    const { data: skill, error: skillError } = await supabase
      .from("skills")
      .insert({ name: plan.skillName, user_id: user.id })
      .select()
      .single();

    if (skillError || !skill) {
      setError(skillError?.message || "创建技能失败，请重试");
      setSaving(false);
      return;
    }

    // Insert monthly goals + subtasks (with months)
    for (const month of plan.months) {
      const { data: goal, error: goalError } = await supabase
        .from("monthly_goals")
        .insert({
          skill_id: skill.id,
          month: month.monthDate,
        })
        .select()
        .single();

      if (goalError || !goal) continue;

      if (month.subtasks.length > 0) {
        const seen = new Set<string>();
        const unique = month.subtasks.filter((t) => {
          const trimmed = t.trim();
          if (!trimmed || seen.has(trimmed)) return false;
          seen.add(trimmed);
          return true;
        });
        if (unique.length > 0) {
          await supabase.from("subtasks").insert(
            unique.map((text, i) => ({
              monthly_goal_id: goal.id,
              text: text.trim(),
              sort_order: i,
            }))
          );
        }
      }
    }

    // Insert unassigned subtasks (without month)
    if (plan.unassignedSubtasks && plan.unassignedSubtasks.length > 0) {
      const { data: unassignedGoal } = await supabase
        .from("monthly_goals")
        .insert({
          skill_id: skill.id,
          month: null,
        })
        .select()
        .single();

      if (unassignedGoal) {
        const seen = new Set<string>();
        const unique = plan.unassignedSubtasks.filter((t) => {
          const trimmed = t.trim();
          if (!trimmed || seen.has(trimmed)) return false;
          seen.add(trimmed);
          return true;
        });
        if (unique.length > 0) {
          await supabase.from("subtasks").insert(
            unique.map((text, i) => ({
              monthly_goal_id: unassignedGoal.id,
              text: text.trim(),
              sort_order: i,
            }))
          );
        }
      }
    }

    // Insert daily tasks
    if (dailyTasks.length > 0) {
      const { error: dtError } = await supabase.from("daily_tasks").insert(
        dailyTasks.map((text, i) => ({ skill_id: skill.id, text, sort_order: i }))
      );
      if (dtError) {
        setError("每日任务保存失败：" + dtError.message + "（请确认已在 Supabase 执行 sql/daily_tasks.sql）");
        setSaving(false);
        return;
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

  const totalSubtasks = plan.months.reduce((sum, m) => sum + m.subtasks.length, 0)
    + (plan.unassignedSubtasks?.length ?? 0);

  return (
    <div className="flex flex-col gap-4">
      <ChatBubble>
        准备好了！一共 {plan.months.length} 个月份{plan.unassignedSubtasks && plan.unassignedSubtasks.length > 0 ? `，${plan.unassignedSubtasks.length} 个未分配子任务` : ""}，合计 {totalSubtasks} 个子任务。
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
        {plan.unassignedSubtasks && plan.unassignedSubtasks.length > 0 && (
          <div className="ml-4">
            <p className="text-[var(--muted-foreground)]">未分配月份</p>
            {plan.unassignedSubtasks.map((st, j) => (
              <p key={j} className="ml-4 text-xs">
                - {st}
              </p>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-[var(--danger)]">{error}</p>
      )}

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
