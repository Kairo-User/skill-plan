"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useState } from "react";
import type { Skill, CheckIn, Subtask } from "@/types/database";

interface SkillCardProps {
  skill: Skill;
  todayCheckIn: CheckIn | null;
  subtasks: Subtask[];
  editMode: boolean;
  onCheckIn: () => void;
  onDelete: (skillId: string) => void;
}

export function SkillCard({ skill, todayCheckIn, subtasks, editMode, onCheckIn, onDelete }: SkillCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const checked = !!todayCheckIn;
  const hours = todayCheckIn ? Math.floor(todayCheckIn.duration_minutes / 60) : 0;
  const mins = todayCheckIn ? todayCheckIn.duration_minutes % 60 : 0;

  return (
    <>
      <Card className={editMode ? "ring-2 ring-[var(--danger)]/30" : ""}>
        <div className="p-3">
          {editMode && (
            <button
              onClick={() => setDeleteOpen(true)}
              className="float-right text-xs font-bold text-[var(--danger)] hover:text-red-700 ml-2"
            >
              删除
            </button>
          )}
          <div className="flex items-center justify-between">
            <div>
              <Link
                href={`/skill/${skill.id}`}
                className="font-semibold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
              >
                {skill.name}
              </Link>
              {checked ? (
                <p className="text-xs text-[var(--success)] mt-1">
                  今日已打卡 · {hours > 0 && `${hours}小时`}{mins > 0 && `${mins}分`}
                </p>
              ) : (
                <p className="text-xs text-[var(--danger)] mt-1">今天还没打卡哦～</p>
              )}
            </div>
            {!editMode && (
              <button
                onClick={onCheckIn}
                className={`ml-3 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 ${
                  checked
                    ? "bg-[var(--success)] text-white"
                    : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
                }`}
              >
                {checked ? "再打一次" : "打卡"}
              </button>
            )}
          </div>

          {subtasks.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <div className="flex flex-wrap gap-1.5">
                {subtasks.map((st) => (
                  <span
                    key={st.id}
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      st.is_done
                        ? "bg-[var(--success)]/10 text-[var(--success)] line-through"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    {st.text}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => onDelete(skill.id)}
        title="删除技能"
        message={`确定要删除「${skill.name}」吗？`}
        confirmLabel="确认删除"
        danger
      />
    </>
  );
}
