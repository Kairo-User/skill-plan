"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { formatMonth } from "@/lib/utils";
import type { KnowledgeItem } from "@/types/database";

export function RandomKnowledgeWidget() {
  const [item, setItem] = useState<KnowledgeItem | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchRandom() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("knowledge_items")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data && data.length > 0) {
      const random = data[Math.floor(Math.random() * data.length)];
      setItem(random);
    } else {
      setItem(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchRandom();
  }, []);

  if (loading) return null;
  if (!item) return null;

  return (
    <Card className="border-dashed border-[var(--primary)] bg-[var(--primary)]/5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[var(--muted-foreground)] mb-1">
            💡 随机回顾 · {formatMonth(item.month)}
          </p>
          <p className="text-sm text-[var(--foreground)] leading-relaxed">
            {item.content}
          </p>
        </div>
        <button
          onClick={fetchRandom}
          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] ml-2 flex-shrink-0"
        >
          换一条
        </button>
      </div>
    </Card>
  );
}
