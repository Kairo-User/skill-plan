"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import type { KnowledgeItem } from "@/types/database";

interface KnowledgeListProps {
  items: KnowledgeItem[];
}

export function KnowledgeList({ items }: KnowledgeListProps) {
  const [query, setQuery] = useState("");

  const filtered = query
    ? items.filter((k) =>
        k.content.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
        这个月还没有知识点～打卡时顺手记录一个吧！
      </p>
    );
  }

  return (
    <div>
      <Input
        placeholder="搜索知识点..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
          没有找到匹配的知识点～
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((k) => (
            <div
              key={k.id}
              className="p-3 rounded-xl bg-[var(--muted)] text-sm text-[var(--foreground)] leading-relaxed"
            >
              {k.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
