"use client";

import { useState } from "react";
import { CheckInDialog } from "@/components/home/CheckInDialog";
import { CheckInHistory } from "./CheckInHistory";
import { Button } from "@/components/ui/Button";
import type { CheckInWithSubtask, Subtask, CheckIn } from "@/types/database";

interface CheckInTabProps {
  skillId: string;
  skillName: string;
  month: string;
  checkIns: CheckInWithSubtask[];
  subtasks: Subtask[];
  onSaved: () => void;
}

export function CheckInTab({
  skillId,
  skillName,
  month,
  checkIns,
  subtasks,
  onSaved,
}: CheckInTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--foreground)]">打卡记录</h3>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          打卡
        </Button>
      </div>

      <CheckInHistory checkIns={checkIns} />

      <CheckInDialog
        skillId={skillId}
        skillName={skillName}
        existingCheckIn={null}
        subtasks={subtasks}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={onSaved}
      />
    </div>
  );
}
