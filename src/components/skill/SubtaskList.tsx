import { useState } from "react";
import { SubtaskItem } from "./SubtaskItem";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Subtask } from "@/types/database";

interface SubtaskListProps {
  subtasks: Subtask[];
  editable: boolean;
  onToggle: (subtaskId: string, isDone: boolean) => void;
  onAdd: (text: string) => void;
  onDelete: (subtaskId: string) => void;
}

export function SubtaskList({
  subtasks,
  editable,
  onToggle,
  onAdd,
  onDelete,
}: SubtaskListProps) {
  const [newText, setNewText] = useState("");

  return (
    <div>
      {subtasks
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((st) => (
          <SubtaskItem
            key={st.id}
            subtask={st}
            editable={editable}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}

      {editable && (
        <div className="flex gap-2 mt-3">
          <Input
            placeholder="添加子任务..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newText.trim()) {
                onAdd(newText.trim());
                setNewText("");
              }
            }}
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={() => {
              if (newText.trim()) {
                onAdd(newText.trim());
                setNewText("");
              }
            }}
          >
            添加
          </Button>
        </div>
      )}
    </div>
  );
}
