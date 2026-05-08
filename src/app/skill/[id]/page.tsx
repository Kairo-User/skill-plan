"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CheckInTab } from "@/components/skill/CheckInTab";
import { PlanTab } from "@/components/skill/PlanTab";
import { KnowledgeTab } from "@/components/skill/KnowledgeTab";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";
import { getMonthKey } from "@/lib/utils";
import type {
  Skill,
  CheckIn,
  CheckInWithSubtask,
  MonthlyGoal,
  Subtask,
  KnowledgeItem,
} from "@/types/database";

export default function SkillPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const skillId = params.id as string;
  const currentMonth = searchParams.get("month") ?? new Date().toISOString().substring(0, 7) + "-01";
  const activeTab = searchParams.get("tab") ?? "checkin";

  const [skillName, setSkillName] = useState("");
  const [checkIns, setCheckIns] = useState<CheckInWithSubtask[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState<
    (MonthlyGoal & { subtasks: Subtask[] }) | null
  >(null);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [hasIncompleteFromPast, setHasIncompleteFromPast] = useState(false);
  const [pastIncompleteCount, setPastIncompleteCount] = useState(0);
  const [pastIncompleteSubtasks, setPastIncompleteSubtasks] = useState<
    Subtask[]
  >([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const monthKey = getMonthKey(currentMonth);

    // Skill name
    const { data: skill } = await supabase
      .from("skills")
      .select("*")
      .eq("id", skillId)
      .single();
    if (skill) {
      setSkillName(skill.name);
      // Generate available months
      const start = new Date((skill as Skill).created_at);
      const now = new Date();
      const months: string[] = [];
      const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      while (cursor <= now) {
        months.push(
          `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-01`
        );
        cursor.setMonth(cursor.getMonth() + 1);
      }
      setAvailableMonths(months);
    }

    // Check-ins for this month
    const monthStart = monthKey;
    const d = new Date(monthStart + "T00:00:00");
    d.setMonth(d.getMonth() + 1);
    // All check-ins for this skill (we filter client-side for simplicity)
    const { data: checkInRows } = await supabase
      .from("check_ins")
      .select("*, subtask:subtasks(*)")
      .eq("skill_id", skillId)
      .gte("date", monthStart)
      .lt("date", d.toISOString().substring(0, 10))
      .order("date", { ascending: false });

    setCheckIns((checkInRows as CheckInWithSubtask[]) ?? []);

    // Monthly goal + subtasks
    const { data: goalRows } = await supabase
      .from("monthly_goals")
      .select("*, subtasks(*)")
      .eq("skill_id", skillId)
      .eq("month", monthKey)
      .limit(1);

    setMonthlyGoal(
      goalRows?.[0] as (MonthlyGoal & { subtasks: Subtask[] }) | null ?? null
    );

    // Check incomplete from previous month
    const prevMonth = new Date(monthStart + "T00:00:00");
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const prevMonthStr = prevMonth.toISOString().substring(0, 7) + "-01";

    const { data: prevGoal } = await supabase
      .from("monthly_goals")
      .select("*, subtasks!inner(*)")
      .eq("skill_id", skillId)
      .eq("month", prevMonthStr)
      .limit(1);

    if (prevGoal?.[0]) {
      const incomplete = (
        (prevGoal[0] as unknown as { subtasks: Subtask[] }).subtasks ?? []
      ).filter((s: Subtask) => !s.is_done);
      if (incomplete.length > 0) {
        setHasIncompleteFromPast(true);
        setPastIncompleteCount(incomplete.length);
        setPastIncompleteSubtasks(incomplete);
      } else {
        setHasIncompleteFromPast(false);
      }
    } else {
      setHasIncompleteFromPast(false);
    }

    // Knowledge items
    const { data: knowledgeRows } = await supabase
      .from("knowledge_items")
      .select("*")
      .eq("skill_id", skillId)
      .eq("month", monthKey)
      .order("created_at", { ascending: false });

    setKnowledgeItems(knowledgeRows ?? []);

    setLoading(false);
  }, [skillId, currentMonth, supabase]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {activeTab === "checkin" && (
        <CheckInTab
          skillId={skillId}
          skillName={skillName}
          month={currentMonth}
          checkIns={checkIns}
          subtasks={monthlyGoal?.subtasks ?? []}
          onSaved={fetchAll}
        />
      )}
      {activeTab === "plan" && (
        <PlanTab
          skillId={skillId}
          month={currentMonth}
          monthlyGoal={monthlyGoal}
          hasIncompleteFromPast={hasIncompleteFromPast}
          pastIncompleteCount={pastIncompleteCount}
          pastIncompleteSubtasks={pastIncompleteSubtasks}
          availableMonths={availableMonths}
          onSaved={fetchAll}
        />
      )}
      {activeTab === "knowledge" && (
        <KnowledgeTab
          skillId={skillId}
          month={currentMonth}
          items={knowledgeItems}
        />
      )}
    </div>
  );
}
