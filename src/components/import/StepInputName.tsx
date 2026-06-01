"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ChatBubble } from "@/components/ui/ChatBubble";

interface StepInputNameProps {
  onNext: (name: string) => void;
}

export function StepInputName({ onNext }: StepInputNameProps) {
  const [name, setName] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <ChatBubble>给你的学习计划起个名字吧～</ChatBubble>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="例如：考研英语、健身计划..."
        onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onNext(name.trim()); }}
      />
      <Button onClick={() => name.trim() && onNext(name.trim())} disabled={!name.trim()} className="self-end">
        下一步 →
      </Button>
    </div>
  );
}
