import type { ParsedPlan, ParsedMonth } from "@/types/database";
import { getMonthDate, formatMonth } from "./utils";

/**
 * Parse Markdown plan text into structured ParsedPlan.
 *
 * Format:
 *   # Skill Name
 *   ## 3月
 *   - Subtask 1
 *   - Subtask 2
 *   ## 4月
 *   - Subtask 3
 */
export function parseMarkdownPlan(raw: string): ParsedPlan {
  const lines = raw.split("\n").map((l) => l.trim());

  let skillName = "";
  const months: ParsedMonth[] = [];
  let currentMonth: ParsedMonth | null = null;

  for (const line of lines) {
    if (!line) continue;

    // H1: skill name
    if (line.startsWith("# ") && !line.startsWith("## ")) {
      skillName = line.replace(/^#\s+/, "").trim();
      continue;
    }

    // H2: month heading
    if (line.startsWith("## ")) {
      if (currentMonth) {
        months.push(currentMonth);
      }
      const label = line.replace(/^##\s+/, "").trim();
      try {
        const monthDate = getMonthDate(label);
        currentMonth = {
          monthLabel: formatMonth(monthDate),
          monthDate,
          subtasks: [],
        };
      } catch {
        // Not a valid month — skip
        continue;
      }
      continue;
    }

    // List item: subtask
    const listMatch = line.match(/^[-*]\s+(.+)/);
    if (listMatch && currentMonth) {
      currentMonth.subtasks.push(listMatch[1].trim());
    }
  }

  if (currentMonth) {
    months.push(currentMonth);
  }

  return { skillName, months };
}
