"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { exportToJSON, exportToMarkdown } from "@/lib/exporter";
import type {
  SkillWithPlan,
  CheckInWithSubtask,
  KnowledgeItem,
} from "@/types/database";

export function ExportSection() {
  const [exporting, setExporting] = useState(false);
  const supabase = createClient();

  async function handleExport(format: "json" | "md") {
    setExporting(true);

    const { data: skills } = await supabase
      .from("skills")
      .select("*, monthly_goals(*, subtasks(*))");

    const { data: checkIns } = await supabase
      .from("check_ins")
      .select("*, subtask:subtasks(*)");

    const { data: knowledgeItems } = await supabase
      .from("knowledge_items")
      .select("*");

    const data = {
      skills: (skills as SkillWithPlan[]) ?? [],
      checkIns: (checkIns as CheckInWithSubtask[]) ?? [],
      knowledgeItems: (knowledgeItems as KnowledgeItem[]) ?? [],
    };

    if (format === "json") {
      exportToJSON(data);
    } else {
      exportToMarkdown(data);
    }

    // Record export time
    localStorage.setItem("skillplan_last_export", Date.now().toString());

    setExporting(false);
  }

  return (
    <div>
      <h3 className="font-semibold text-[var(--foreground)] mb-3">数据导出</h3>
      <p className="text-sm text-[var(--muted-foreground)] mb-3">
        定期导出备份，防止数据丢失哦～
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleExport("json")}
          disabled={exporting}
        >
          导出 JSON
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleExport("md")}
          disabled={exporting}
        >
          导出 Markdown
        </Button>
      </div>
    </div>
  );
}
