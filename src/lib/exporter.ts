import type { SkillWithPlan, CheckInWithSubtask, KnowledgeItem } from "@/types/database";
import { formatMonth, formatDuration, formatDate } from "./utils";

interface ExportData {
  skills: SkillWithPlan[];
  checkIns: CheckInWithSubtask[];
  knowledgeItems: KnowledgeItem[];
}

export function exportToJSON(data: ExportData): void {
  const json = JSON.stringify(data, null, 2);
  download(json, "skillplan-export.json", "application/json");
}

export function exportToMarkdown(data: ExportData): void {
  let md = "# SkillPlan 数据导出\n\n";
  md += `导出时间：${new Date().toLocaleString()}\n\n---\n\n`;

  for (const skill of data.skills) {
    md += `## ${skill.name}\n\n`;
    md += `创建时间：${new Date(skill.created_at).toLocaleDateString()}\n\n`;

    // Monthly goals
    const goals = skill.monthly_goals ?? [];
    for (const goal of goals.sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
    )) {
      md += `### ${formatMonth(goal.month)}\n\n`;
      const subtasks = goal.subtasks ?? [];
      for (const st of subtasks) {
        const mark = st.is_done ? "x" : " ";
        md += `- [${mark}] ${st.text}\n`;
      }
      md += "\n";

      // Check-ins for this skill+month
      const monthCheckIns = data.checkIns.filter(
        (c) =>
          c.skill_id === skill.id && c.date.startsWith(goal.month.substring(0, 7))
      );
      if (monthCheckIns.length > 0) {
        md += "**打卡记录：**\n\n";
        for (const ci of monthCheckIns) {
          md += `- ${ci.date}：${formatDuration(ci.duration_minutes)}`;
          if (ci.notes) md += `，备注：${ci.notes}`;
          if (ci.learning_insight) md += `，心得：${ci.learning_insight}`;
          if (ci.is_backfill) md += ` (补卡)`;
          md += "\n";
        }
        md += "\n";
      }
    }

    // Knowledge items
    const skillKnowledge = data.knowledgeItems.filter(
      (k) => k.skill_id === skill.id
    );
    if (skillKnowledge.length > 0) {
      md += "### 知识点\n\n";
      for (const k of skillKnowledge) {
        md += `- [${formatMonth(k.month)}] ${k.content}\n`;
      }
      md += "\n";
    }

    md += "---\n\n";
  }

  download(md, "skillplan-export.md", "text/markdown");
}

function download(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
