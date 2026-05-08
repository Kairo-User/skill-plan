"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { formatMonth } from "@/lib/utils";
import type { Subtask, MonthlyGoal } from "@/types/database";

interface MigrationDialogProps {
  skillId: string;
  sourceMonth: string;
  incompleteSubtasks: Subtask[];
  availableMonths: string[];
  onDone: () => void;
}

export function MigrationDialog({
  skillId,
  sourceMonth,
  incompleteSubtasks,
  availableMonths,
  onDone,
}: MigrationDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [targetMonth, setTargetMonth] = useState("");
  const [migrating, setMigrating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Default to next month
    const idx = availableMonths.indexOf(sourceMonth);
    if (idx >= 0 && idx + 1 < availableMonths.length) {
      setTargetMonth(availableMonths[idx + 1]);
    } else if (availableMonths.length > 0) {
      setTargetMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [sourceMonth, availableMonths]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleMigrate() {
    if (selected.size === 0 || !targetMonth) return;
    setMigrating(true);

    // Find or create monthly goal in target month
    let { data: goal } = await supabase
      .from("monthly_goals")
      .select("id")
      .eq("skill_id", skillId)
      .eq("month", targetMonth)
      .single();

    if (!goal) {
      const { data: newGoal } = await supabase
        .from("monthly_goals")
        .insert({ skill_id: skillId, month: targetMonth })
        .select()
        .single();
      goal = newGoal;
    }

    if (goal) {
      const toInsert = incompleteSubtasks
        .filter((st) => selected.has(st.id))
        .map((st, i) => ({
          monthly_goal_id: goal!.id,
          text: st.text,
          is_done: false,
          sort_order: i,
        }));

      if (toInsert.length > 0) {
        await supabase.from("subtasks").insert(toInsert);
      }
    }

    setMigrating(false);
    onDone();
  }

  return (
    <Modal open onClose={onDone} title="迁移未完成的子任务">
      <p className="text-sm text-[var(--muted-foreground)] mb-4">
        {formatMonth(sourceMonth)} 还有 {incompleteSubtasks.length}{" "}
        项没完成哦～要搬到哪个月继续？
      </p>

      <div className="mb-4">
        <label className="text-xs text-[var(--muted-foreground)]">
          目标月份
        </label>
        <select
          value={targetMonth}
          onChange={(e) => setTargetMonth(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-[var(--muted)] text-[var(--foreground)] text-sm border-none"
        >
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {formatMonth(m)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1 mb-6">
        {incompleteSubtasks.map((st) => (
          <label
            key={st.id}
            className="flex items-center gap-2 py-1.5 cursor-pointer text-sm text-[var(--foreground)]"
          >
            <input
              type="checkbox"
              checked={selected.has(st.id)}
              onChange={() => toggle(st.id)}
              className="accent-[var(--primary)]"
            />
            {st.text}
          </label>
        ))}
      </div>

      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onDone}>
          以后再说
        </Button>
        <Button
          onClick={handleMigrate}
          disabled={selected.size === 0 || migrating}
        >
          {migrating ? "搬家中..." : "搬过去"}
        </Button>
      </div>
    </Modal>
  );
}
