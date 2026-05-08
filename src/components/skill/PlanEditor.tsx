"use client";

import { useState } from "react";
import { SubtaskList } from "./SubtaskList";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { MonthlyGoal, Subtask } from "@/types/database";

interface PlanEditorProps {
  skillId: string;
  month: string;
  existingGoal: (MonthlyGoal & { subtasks: Subtask[] }) | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function PlanEditor({
  skillId,
  month,
  existingGoal,
  onSaved,
  onCancel,
}: PlanEditorProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>(
    existingGoal?.subtasks ?? []
  );
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function handleSave() {
    setSaving(true);

    // Save snapshot of previous plan
    if (existingGoal) {
      await supabase.from("plan_snapshots").insert({
        skill_id: skillId,
        snapshot_json: {
          monthly_goals: [
            {
              ...existingGoal,
              subtasks: existingGoal.subtasks,
            },
          ],
        },
        reason: "手动编辑计划",
      });
    }

    // Upsert monthly goal
    const { data: goalData, error: goalError } = await supabase
      .from("monthly_goals")
      .upsert(
        {
          skill_id: skillId,
          month,
          is_completed: false,
        },
        { onConflict: "skill_id,month" }
      )
      .select()
      .single();

    if (goalError || !goalData) {
      setSaving(false);
      return;
    }

    // Delete existing subtasks
    await supabase
      .from("subtasks")
      .delete()
      .eq("monthly_goal_id", goalData.id);

    // Insert new subtasks
    if (subtasks.length > 0) {
      await supabase.from("subtasks").insert(
        subtasks.map((st, i) => ({
          monthly_goal_id: goalData.id,
          text: st.text,
          is_done: st.is_done,
          sort_order: i,
        }))
      );
    }

    setSaving(false);
    onSaved();
  }

  function addSubtask(text: string) {
    setSubtasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        monthly_goal_id: existingGoal?.id ?? "",
        text,
        is_done: false,
        sort_order: prev.length,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  function toggleSubtask(id: string, isDone: boolean) {
    setSubtasks((prev) =>
      prev.map((st) => (st.id === id ? { ...st, is_done: isDone } : st))
    );
  }

  function deleteSubtask(id: string) {
    setSubtasks((prev) => prev.filter((st) => st.id !== id));
  }

  return (
    <Modal open onClose={onCancel} title="编辑月度规划">
      <SubtaskList
        subtasks={subtasks}
        editable
        onToggle={toggleSubtask}
        onAdd={addSubtask}
        onDelete={deleteSubtask}
      />
      <div className="flex gap-3 justify-end mt-6">
        <Button variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "保存中..." : "保存"}
        </Button>
      </div>
    </Modal>
  );
}
