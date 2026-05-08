"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ChatBubble } from "@/components/ui/ChatBubble";
import type { ParsedPlan } from "@/types/database";

interface StepConfirmSkillProps {
  plan: ParsedPlan;
  onNext: (plan: ParsedPlan) => void;
  onBack: () => void;
}

export function StepConfirmSkill({ plan, onNext, onBack }: StepConfirmSkillProps) {
  const [name, setName] = useState(plan.skillName);

  return (
    <div className="flex flex-col gap-4">
      <ChatBubble>这个技能叫什么名字呀？可以改哦～</ChatBubble>

      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="技能名称"
      />

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onBack}>
          ← 回退
        </Button>
        <Button
          onClick={() => onNext({ ...plan, skillName: name.trim() })}
          disabled={!name.trim()}
        >
          下一步 →
        </Button>
      </div>
    </div>
  );
}
