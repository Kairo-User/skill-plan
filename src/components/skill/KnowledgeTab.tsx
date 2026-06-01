"use client";

import { useState } from "react";
import { KnowledgeList } from "./KnowledgeList";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { useSkillTab } from "@/lib/skill-context";
import Link from "next/link";
import type { KnowledgeItem } from "@/types/database";

interface KnowledgeTabProps {
  skillId: string;
  month: string;
  items: KnowledgeItem[];
}

export function KnowledgeTab({ skillId, month, items }: KnowledgeTabProps) {
  const { editMode, setEditMode } = useSkillTab();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [allItems, setAllItems] = useState(items);
  const supabase = createClient();

  async function addKnowledge() {
    const t = title.trim();
    if (!t) return;
    const { data } = await supabase.from("knowledge_items").insert({
      skill_id: skillId,
      title: t,
      content: content.trim(),
      month,
    }).select().single();
    if (data) {
      setAllItems((prev) => [data as KnowledgeItem, ...prev]);
      setTitle("");
      setContent("");
      setEditMode(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--foreground)]">知识点</h3>
        <div className="flex items-center gap-2">
          {!editMode && (
            <Button variant="secondary" size="sm" onClick={() => setEditMode(true)}>+ 添加</Button>
          )}
          {allItems.length > 0 && (
            <Link href={`/skill/${skillId}/review?month=${month}`}>
              <Button variant="secondary" size="sm">复习模式</Button>
            </Link>
          )}
        </div>
      </div>

      {editMode && (
        <Card className="mb-4 p-3">
          <Input
            placeholder="标题（必填）"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-2"
          />
          <Textarea
            placeholder="内容（可选，详细说明）"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}>取消</Button>
            <Button size="sm" onClick={addKnowledge} disabled={!title.trim()}>保存</Button>
          </div>
        </Card>
      )}

      <KnowledgeList items={allItems} />
    </div>
  );
}
