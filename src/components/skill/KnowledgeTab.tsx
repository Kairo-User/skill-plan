"use client";

import { KnowledgeList } from "./KnowledgeList";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { KnowledgeItem } from "@/types/database";

interface KnowledgeTabProps {
  skillId: string;
  month: string;
  items: KnowledgeItem[];
}

export function KnowledgeTab({ skillId, month, items }: KnowledgeTabProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--foreground)]">知识点</h3>
        {items.length > 0 && (
          <Link href={`/skill/${skillId}/review?month=${month}`}>
            <Button variant="secondary" size="sm">
              进入复习模式
            </Button>
          </Link>
        )}
      </div>

      <KnowledgeList items={items} />
    </div>
  );
}
