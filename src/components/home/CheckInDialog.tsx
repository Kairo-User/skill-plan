"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { parseDuration, today } from "@/lib/utils";
import type { Subtask, CheckIn } from "@/types/database";

interface CheckInDialogProps {
  skillId: string;
  skillName: string;
  existingCheckIn: CheckIn | null;
  subtasks: Subtask[];
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

type Step = "duration" | "subtask" | "notes" | "done";

export function CheckInDialog({
  skillId, skillName, existingCheckIn, subtasks, open, onClose, onSaved,
}: CheckInDialogProps) {
  const supabase = createClient();
  const [step, setStep] = useState<Step>("duration");
  const [durationText, setDurationText] = useState("");
  const [durationVal, setDurationVal] = useState(0);
  const [timeError, setTimeError] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [noteText, setNoteText] = useState("");
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLTextAreaElement>(null);

  const hasNoSubtasks = subtasks.length === 0;

  useEffect(() => {
    if (!open) return;
    setStep("duration");
    setTimeError("");
    if (existingCheckIn) {
      const m = existingCheckIn.duration_minutes;
      const h = Math.floor(m / 60);
      const min = m % 60;
      if (h > 0 && min > 0) setDurationText(`${h}小时${min}分`);
      else if (h > 0) setDurationText(`${h}小时`);
      else if (min > 0) setDurationText(`${min}分`);
      else setDurationText(String(m));
      setDurationVal(m);
      setSelectedIds(existingCheckIn.subtask_id ? new Set([existingCheckIn.subtask_id]) : new Set());
      setNoteText(existingCheckIn.notes || "");
    } else {
      setDurationText("");
      setDurationVal(0);
      setSelectedIds(new Set());
      setNoteText("");
    }
  }, [open]);

  useEffect(() => {
    if (step === "duration" && ref1.current) ref1.current.focus();
    if (step === "notes" && ref2.current) ref2.current.focus();
  }, [step]);

  function goDuration() {
    const val = parseDuration(durationText);
    if (val <= 0) { setTimeError("格式不对哦～试试 2小时30分 或 2.5"); return; }
    if (val > 1440) { setTimeError("一天最多24小时～"); return; }
    setDurationVal(val);
    setTimeError("");
    setStep(hasNoSubtasks ? "notes" : "subtask");
  }

  function goSubtask() {
    setStep("notes");
  }

  async function handleComplete() {
    if (durationVal <= 0) return;
    const names = subtasks.filter((s) => selectedIds.has(s.id)).map((s) => s.text);
    const notes = [
      names.length > 1 ? `子目标：${names.join("、")}` : "",
      noteText,
    ].filter(Boolean).join("\n");

    const { error } = await supabase.from("check_ins").insert({
      skill_id: skillId,
      date: today(),
      duration_minutes: durationVal,
      subtask_id: [...selectedIds][0] || null,
      notes: notes || null,
      learning_insight: noteText || null,
      is_backfill: false,
    });
    if (error) { console.error("Check-in failed:", error); return; }
    onSaved();
    onClose();
  }

  function toggleSub(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={skillName}>
      <div className="flex flex-col gap-4 min-h-[260px]">
        {step === "duration" && (
          <div className="flex flex-col gap-4 items-center">
            <ChatBubble>今天学了多久呀？</ChatBubble>
            <div className="flex flex-col gap-2 w-full max-w-[240px]">
              <Input ref={ref1} placeholder="如 2小时30分 或 2.5（小时）"
                value={durationText}
                onChange={(e) => { setDurationText(e.target.value); setTimeError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") goDuration(); }} />
              {timeError && <p className="text-xs text-[var(--danger)] text-center">{timeError}</p>}
            </div>
            <Button size="lg" onClick={goDuration}>确定</Button>
          </div>
        )}

        {step === "subtask" && !hasNoSubtasks && (
          <div className="flex flex-col gap-3">
            <ChatBubble>今天学了哪些子目标？可多选～</ChatBubble>
            <div className="flex flex-wrap gap-2">
              {subtasks.map((st) => (
                <button key={st.id} onClick={() => toggleSub(st.id)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    selectedIds.has(st.id)
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)]"
                  }`}>{st.text}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("notes")}>跳过</Button>
              <Button size="sm" onClick={goSubtask}>确定</Button>
            </div>
          </div>
        )}

        {step === "notes" && (
          <div className="flex flex-col gap-3">
            <ChatBubble>有什么备注或学习心得吗～</ChatBubble>
            <Textarea ref={ref2} placeholder="学到了什么，有什么感悟..." rows={4}
              value={noteText} onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); setStep("done"); } }} />
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep("done")}>跳过</Button>
              <Button size="sm" onClick={() => setStep("done")}>确定</Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col gap-4 items-center justify-center flex-1">
            <ChatBubble>今天学了{durationVal}分钟，棒棒的！提交吗？</ChatBubble>
            <Button onClick={handleComplete} size="lg">完成打卡 ✨</Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
