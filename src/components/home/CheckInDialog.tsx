"use client";

import { useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCheckInMachine } from "@/hooks/useCheckInMachine";
import { createClient } from "@/lib/supabase/client";
import { parseDuration, formatDate, today } from "@/lib/utils";
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

export function CheckInDialog({
  skillId,
  skillName,
  existingCheckIn,
  subtasks,
  open,
  onClose,
  onSaved,
}: CheckInDialogProps) {
  const { state, setDate, setDuration, setSubtask, setNotes, setInsight, setKnowledge, skip, reset } =
    useCheckInMachine();
  const supabase = createClient();
  const durationRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const insightRef = useRef<HTMLTextAreaElement>(null);
  const knowledgeRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      reset();
      if (existingCheckIn) {
        setDate(existingCheckIn.date);
        setDuration(existingCheckIn.duration_minutes);
        if (existingCheckIn.subtask_id) setSubtask(existingCheckIn.subtask_id);
        if (existingCheckIn.notes) setNotes(existingCheckIn.notes);
        if (existingCheckIn.learning_insight) setInsight(existingCheckIn.learning_insight);
      }
    }
  }, [open]);

  useEffect(() => {
    if (state.step === "duration" && durationRef.current) {
      durationRef.current.focus();
    }
    if (state.step === "notes" && notesRef.current) {
      notesRef.current.focus();
    }
    if (state.step === "insight" && insightRef.current) {
      insightRef.current.focus();
    }
    if (state.step === "knowledge" && knowledgeRef.current) {
      knowledgeRef.current.focus();
    }
  }, [state.step]);

  async function handleComplete() {
    if (state.durationMinutes === null) return;

    const isBackfill = state.date !== today();

    const { error } = await supabase.from("check_ins").upsert({
      skill_id: skillId,
      date: state.date,
      duration_minutes: state.durationMinutes,
      subtask_id: state.subtaskId,
      notes: state.notes || null,
      learning_insight: state.learningInsight || null,
      is_backfill: isBackfill,
    });

    if (error) {
      console.error("Check-in failed:", error);
      return;
    }

    // Insert knowledge item if provided
    if (state.knowledgeContent.trim()) {
      await supabase.from("knowledge_items").insert({
        skill_id: skillId,
        content: state.knowledgeContent.trim(),
        month: state.date.substring(0, 7) + "-01",
      });
    }

    onSaved();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={skillName}>
      <div className="flex flex-col gap-4 min-h-[300px]">
        {/* Step: date */}
        {state.step === "date" && (
          <div className="flex flex-col gap-3">
            <ChatBubble>今天是哪一天鸭？</ChatBubble>
            <div className="flex gap-2 items-center">
              <Input
                type="date"
                value={state.date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => setDate(state.date)} size="sm">
                确定
              </Button>
            </div>
          </div>
        )}

        {/* Step: duration */}
        {state.step === "duration" && (
          <div className="flex flex-col gap-3">
            <ChatBubble>今天学了多久呀？</ChatBubble>
            <div className="flex gap-2 items-center">
              <Input
                ref={durationRef}
                placeholder="比如：2小时30分"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = parseDuration((e.target as HTMLInputElement).value);
                    if (val > 0) setDuration(val);
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => {
                  const val = parseDuration(durationRef.current?.value ?? "");
                  if (val > 0) setDuration(val);
                }}
              >
                确定
              </Button>
            </div>
          </div>
        )}

        {/* Step: subtask */}
        {state.step === "subtask" && (
          <div className="flex flex-col gap-3">
            <ChatBubble>学的是哪个子目标呀？不选也行～</ChatBubble>
            <div className="flex flex-wrap gap-2">
              {subtasks.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSubtask(st.id)}
                  className="px-3 py-1.5 rounded-full text-xs border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] transition-colors"
                >
                  {st.text}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={skip}>
              跳过
            </Button>
          </div>
        )}

        {/* Step: notes */}
        {state.step === "notes" && (
          <div className="flex flex-col gap-3">
            <ChatBubble>有什么想备注的吗～</ChatBubble>
            <Textarea
              ref={notesRef}
              placeholder="链接、资源什么的..."
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  setNotes((e.target as HTMLTextAreaElement).value);
                }
              }}
            />
            <Button variant="ghost" size="sm" onClick={skip}>
              跳过
            </Button>
          </div>
        )}

        {/* Step: insight */}
        {state.step === "insight" && (
          <div className="flex flex-col gap-3">
            <ChatBubble>今天有什么学习心得呀？</ChatBubble>
            <Textarea
              ref={insightRef}
              placeholder="学到了什么，有什么感悟..."
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  setInsight((e.target as HTMLTextAreaElement).value);
                }
              }}
            />
            <Button variant="ghost" size="sm" onClick={skip}>
              跳过
            </Button>
          </div>
        )}

        {/* Step: knowledge */}
        {state.step === "knowledge" && (
          <div className="flex flex-col gap-3">
            <ChatBubble>有没有需要反复记忆的知识点？</ChatBubble>
            <Textarea
              ref={knowledgeRef}
              placeholder="关键知识，以后要复习的..."
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  setKnowledge((e.target as HTMLTextAreaElement).value);
                }
              }}
            />
            <Button variant="ghost" size="sm" onClick={skip}>
              跳过
            </Button>
          </div>
        )}

        {/* Step: complete — submit */}
        {state.step === "complete" && (
          <div className="flex flex-col gap-4 items-center justify-center flex-1">
            <ChatBubble>
              {state.date !== today()
                ? `补卡：${state.date}，${state.durationMinutes}分钟的学习～提交前要再看看吗？`
                : `今天学了${state.durationMinutes}分钟，棒棒的！提交吗？`}
            </ChatBubble>
            <Button onClick={handleComplete} size="lg">
              完成打卡 ✨
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
