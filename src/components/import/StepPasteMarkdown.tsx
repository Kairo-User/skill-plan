"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { parseMarkdownPlan } from "@/lib/parser";
import type { ParsedPlan } from "@/types/database";

interface StepPasteMarkdownProps {
  onNext: (plan: ParsedPlan) => void;
}

export function StepPasteMarkdown({ onNext }: StepPasteMarkdownProps) {
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");

  function handleProceed() {
    if (!raw.trim()) {
      setError("先贴点东西进来嘛～");
      return;
    }

    try {
      const plan = parseMarkdownPlan(raw);
      if (plan.months.length === 0) {
        setError("没找到月度规划，用 ## 开头写月份试试？");
        return;
      }
      onNext(plan);
    } catch {
      setError("解析失败了，检查一下格式对不对～");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ChatBubble>
        把 AI 帮你生成的规划粘贴进来吧～<br />
        格式：用 # 开头写技能名，## 开头写月份，- 开头写子任务<br />
        # 和 ## 后面的空格可有可无
      </ChatBubble>

      <Textarea
        placeholder="# React 前端开发&#10;## 3月&#10;- 环境搭建&#10;- JSX语法&#10;## 4月&#10;- 组件与Props"
        rows={12}
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          setError("");
        }}
      />

      {error && (
        <p className="text-sm text-[var(--danger)]">{error}</p>
      )}

      <Button onClick={handleProceed} size="lg" className="self-end">
        下一步 →
      </Button>
    </div>
  );
}
