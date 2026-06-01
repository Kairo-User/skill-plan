"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FlashCard } from "@/components/review/FlashCard";
import { ReviewControls } from "@/components/review/ReviewControls";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";
import type { KnowledgeItem } from "@/types/database";

export default function ReviewPage() {
  const params = useParams();
  const skillId = params.id as string;
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("knowledge_items")
        .select("*")
        .eq("skill_id", skillId)
        .order("created_at", { ascending: false });

      setItems(data ?? []);
      setLoading(false);
    }
    load();
  }, [skillId]);

  if (loading) return <LoadingSpinner />;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-4">📭</p>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
          还没有知识点可以复习
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          打卡的时候记录一些知识点吧～
        </p>
        <Link
          href={`/skill/${skillId}?tab=knowledge`}
          className="text-[var(--primary)] hover:underline text-sm"
        >
          返回知识库
        </Link>
      </div>
    );
  }

  const current = items[index];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/skill/${skillId}?tab=knowledge`}
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          ← 返回知识库
        </Link>
        <span className="text-sm text-[var(--muted-foreground)]">
          {index + 1} / {items.length}
        </span>
      </div>

      <FlashCard title={current.title || current.content.slice(0, 30)} content={current.content} />

      <div className="mt-6">
        <ReviewControls
          index={index}
          total={items.length}
          onPrev={() => setIndex((i) => Math.max(0, i - 1))}
          onNext={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
          onRandom={() =>
            setIndex(Math.floor(Math.random() * items.length))
          }
        />
      </div>
    </div>
  );
}
