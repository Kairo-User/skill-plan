import { cn } from "@/lib/utils";
import type { Subtask } from "@/types/database";

interface SubtaskItemProps {
  subtask: Subtask;
  editable: boolean;
  onToggle: (id: string, isDone: boolean) => void;
  onDelete: (id: string) => void;
}

export function SubtaskItem({ subtask, editable, onToggle, onDelete }: SubtaskItemProps) {
  return (
    <div className="flex items-center gap-3 py-2 group">
      <button
        onClick={() => onToggle(subtask.id, !subtask.is_done)}
        className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
          subtask.is_done
            ? "bg-[var(--success)] border-[var(--success)]"
            : "border-[var(--border)] hover:border-[var(--primary)]"
        )}
      >
        {subtask.is_done && <span className="text-white text-xs">✓</span>}
      </button>

      <span
        className={cn(
          "flex-1 text-sm",
          subtask.is_done
            ? "line-through text-[var(--muted-foreground)]"
            : "text-[var(--foreground)]"
        )}
      >
        {subtask.text}
      </span>

      {editable && (
        <button
          onClick={() => onDelete(subtask.id)}
          className="opacity-0 group-hover:opacity-100 text-[var(--muted-foreground)] hover:text-[var(--danger)] transition-all text-xs"
        >
          ✕
        </button>
      )}
    </div>
  );
}
