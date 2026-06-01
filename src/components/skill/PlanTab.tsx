"use client";

import { useState } from "react";
import { SubtaskList } from "./SubtaskList";
import { PlanEditor } from "./PlanEditor";
import { MigrationDialog } from "./MigrationDialog";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useSkillTab } from "@/lib/skill-context";
import type { MonthlyGoal, Subtask } from "@/types/database";

interface PlanTabProps {
  skillId: string;
  month: string;
  monthlyGoal: (MonthlyGoal & { subtasks: Subtask[] }) | null;
  unassignedSubtasks: Subtask[];
  hasIncompleteFromPast: boolean;
  pastIncompleteCount: number;
  pastIncompleteSubtasks: Subtask[];
  availableMonths: string[];
  subtaskMinutes: Map<string, number>;
  onSaved: () => void;
}

export function PlanTab({
  skillId,
  month,
  monthlyGoal,
  unassignedSubtasks,
  hasIncompleteFromPast,
  pastIncompleteCount,
  pastIncompleteSubtasks,
  availableMonths,
  subtaskMinutes,
  onSaved,
}: PlanTabProps) {
  const { editMode, setEditMode } = useSkillTab();
  const [editorOpen, setEditorOpen] = useState(false);
  const [migrationOpen, setMigrationOpen] = useState(false);
  const supabase = createClient();

  async function toggleSubtask(subtaskId: string, isDone: boolean) {
    await supabase.from("subtasks").update({ is_done: isDone }).eq("id", subtaskId);
    onSaved();
  }

  async function addSubtask(text: string) {
    if (!monthlyGoal) return;
    if (monthlyGoal.subtasks.some((s) => s.text === text)) return;
    await supabase.from("subtasks").insert({
      monthly_goal_id: monthlyGoal.id,
      text,
      sort_order: monthlyGoal.subtasks.length,
    });
    onSaved();
    setEditMode(false);
  }

  async function deleteSubtask(subtaskId: string) {
    await supabase.from("subtasks").delete().eq("id", subtaskId);
    onSaved();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--foreground)]">月度子目标</h3>
        {!editMode && (
          <Button size="sm" variant="secondary" onClick={() => { setEditMode(true); setEditorOpen(true); }}>
            {monthlyGoal ? "编辑" : "添加规划"}
          </Button>
        )}
      </div>

      {monthlyGoal ? (
        <>
          <SubtaskList
            subtasks={monthlyGoal.subtasks}
            editable={editMode}
            minutesMap={subtaskMinutes}
            onToggle={toggleSubtask}
            onAdd={addSubtask}
            onDelete={deleteSubtask}
          />

          {monthlyGoal.subtasks.length > 0 && (
            <div className="mt-4 text-xs text-[var(--muted-foreground)]">
              {monthlyGoal.subtasks.filter((s) => s.is_done).length}/
              {monthlyGoal.subtasks.length} 项已完成
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
          这个月还没有规划～添加一个吧！
        </p>
      )}

      {/* Unassigned subtasks */}
      {unassignedSubtasks.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
            通用子目标（未分配月份）
          </h4>
          <SubtaskList
            subtasks={unassignedSubtasks}
            editable={editMode}
            minutesMap={subtaskMinutes}
            onToggle={toggleSubtask}
            onAdd={(text) => {
              // Add to first unassigned goal or create one
              (async () => {
                const { data: goals } = await supabase
                  .from("monthly_goals")
                  .select("id")
                  .eq("skill_id", skillId)
                  .is("month", null)
                  .limit(1);
                const goalId = goals?.[0]?.id;
                if (goalId) {
                  await supabase.from("subtasks").insert({
                    monthly_goal_id: goalId,
                    text,
                    sort_order: unassignedSubtasks.length,
                  });
                  onSaved();
                }
              })();
            }}
            onDelete={deleteSubtask}
          />
        </div>
      )}

      {hasIncompleteFromPast && (
        <div className="mt-4 p-3 rounded-xl bg-[var(--accent)]/10 flex items-center justify-between">
          <span className="text-sm text-[var(--foreground)]">
            上月还有 {pastIncompleteCount} 项没完成哦～
          </span>
          <Button size="sm" variant="ghost" onClick={() => setMigrationOpen(true)}>
            查看
          </Button>
        </div>
      )}

      {editorOpen && (
        <PlanEditor
          skillId={skillId}
          month={month}
          existingGoal={monthlyGoal}
          onSaved={() => {
            setEditorOpen(false);
            setEditMode(false);
            onSaved();
          }}
          onCancel={() => setEditorOpen(false)}
        />
      )}

      {migrationOpen && (
        <MigrationDialog
          skillId={skillId}
          sourceMonth={availableMonths[availableMonths.length - 2] ?? month}
          incompleteSubtasks={pastIncompleteSubtasks}
          availableMonths={availableMonths}
          onDone={() => {
            setMigrationOpen(false);
            onSaved();
          }}
        />
      )}
    </div>
  );
}
