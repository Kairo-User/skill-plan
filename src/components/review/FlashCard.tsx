"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FlashCardProps {
  title: string;
  content: string;
}

export function FlashCard({ title, content }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className={cn(
        "min-h-[250px] rounded-2xl border-2 p-8 flex items-center justify-center text-center cursor-pointer transition-all duration-300 select-none",
        flipped
          ? "border-[var(--primary)] bg-[var(--primary)]/10"
          : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50"
      )}
    >
      <div className="max-w-md">
        {flipped ? (
          <div>
            <p className="text-lg font-semibold text-[var(--foreground)] mb-3">{title}</p>
            <p className="text-base leading-relaxed text-[var(--muted-foreground)]">{content}</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-semibold text-[var(--foreground)]">{title}</p>
          </div>
        )}
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          {flipped ? "已翻开" : "点击翻开查看内容"}
        </p>
      </div>
    </div>
  );
}
