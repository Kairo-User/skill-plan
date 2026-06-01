"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDuration } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSkillTab } from "@/lib/skill-context";
import type { CheckInWithSubtask } from "@/types/database";

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

interface CheckInHistoryProps {
  checkIns: CheckInWithSubtask[];
  onDelete: () => void;
}

export function CheckInHistory({ checkIns, onDelete }: CheckInHistoryProps) {
  const { editMode } = useSkillTab();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const supabase = createClient();

  if (checkIns.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
        这个月还没有打卡记录～
      </p>
    );
  }

  async function handleDelete() {
    if (!deleteId) return;
    await supabase.from("check_ins").delete().eq("id", deleteId);
    setDeleteId(null);
    onDelete();
  }

  return (
    <div className="space-y-2 mt-4">
      <h4 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
        打卡历史
      </h4>
      {checkIns
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((ci) => (
          <div
            key={ci.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-[var(--muted)] text-sm group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[var(--foreground)] font-medium">
                  {formatDisplayDate(ci.date)}
                </span>
                <span className="text-[var(--primary)]">
                  {formatDuration(ci.duration_minutes)}
                </span>
                {ci.is_backfill && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent)] text-[var(--card)]">
                    补卡
                  </span>
                )}
              </div>
              {ci.subtask && (
                <p className="text-[var(--muted-foreground)] text-xs mt-0.5">
                  子目标：{ci.subtask.text}
                </p>
              )}
              {ci.notes && (
                <p className="text-[var(--foreground)] text-xs mt-1 leading-relaxed">
                  {ci.notes}
                </p>
              )}
            </div>
            {editMode && (
              <button
                onClick={() => setDeleteId(ci.id)}
                className="text-[var(--danger)] hover:text-red-700 text-sm font-bold flex-shrink-0"
              >
                ✕
              </button>
            )}
          </div>
        ))}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="删除打卡"
        message="确定要删除这条打卡记录吗？"
        confirmLabel="删除"
        danger
      />
    </div>
  );
}
