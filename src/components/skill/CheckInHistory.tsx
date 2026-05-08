import { formatDuration } from "@/lib/utils";
import type { CheckInWithSubtask } from "@/types/database";

interface CheckInHistoryProps {
  checkIns: CheckInWithSubtask[];
}

export function CheckInHistory({ checkIns }: CheckInHistoryProps) {
  if (checkIns.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
        这个月还没有打卡记录～
      </p>
    );
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
            className="flex items-start gap-3 p-3 rounded-xl bg-[var(--muted)] text-sm"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[var(--foreground)] font-medium">
                  {ci.date}
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
                <p className="text-[var(--muted-foreground)] text-xs mt-0.5">
                  备注：{ci.notes}
                </p>
              )}
              {ci.learning_insight && (
                <p className="text-[var(--foreground)] text-xs mt-1 italic">
                  💭 {ci.learning_insight}
                </p>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
