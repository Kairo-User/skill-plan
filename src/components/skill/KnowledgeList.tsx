"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import type { KnowledgeItem } from "@/types/database";

interface KnowledgeListProps {
  items: KnowledgeItem[];
}

export function KnowledgeList({ items }: KnowledgeListProps) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = query
    ? items.filter((k) =>
        (k.title || "").toLowerCase().includes(query.toLowerCase()) ||
        k.content.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)] text-center py-8">
        这个月还没有知识点～添加一个吧！
      </p>
    );
  }

  return (
    <div>
      <Input placeholder="搜索知识点..." value={query}
        onChange={(e) => setQuery(e.target.value)} className="mb-4" />

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] text-center py-4">没有找到匹配的知识点～</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((k) => (
            <div
              key={k.id}
              onClick={() => toggle(k.id)}
              className="p-3 rounded-xl bg-[var(--muted)] cursor-pointer hover:bg-[var(--border)] transition-colors"
            >
              <p className="text-sm font-medium text-[var(--foreground)]">
                {k.title || k.content.slice(0, 30)}
              </p>
              {expanded.has(k.id) && k.content && (
                <p className="text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed">
                  {k.content}
                </p>
              )}
              {k.content && (
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {expanded.has(k.id) ? "点击收起" : "点击展开"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
