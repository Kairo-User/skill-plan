"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { CheckInTab } from "@/components/skill/CheckInTab";
import { DailyPlanTab } from "@/components/skill/DailyPlanTab";
import { PlanTab } from "@/components/skill/PlanTab";
import { KnowledgeTab } from "@/components/skill/KnowledgeTab";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";
import { getMonthKey } from "@/lib/utils";
import { useSkillTab } from "@/lib/skill-context";
import type {
  Skill,
  CheckInWithSubtask,
  MonthlyGoal,
  Subtask,
  KnowledgeItem,
} from "@/types/database";

export default function SkillPage() {
  const params = useParams();
  const skillId = params.id as string;
  const { activeTab, currentMonth } = useSkillTab();

  const [skillName, setSkillName] = useState("");
  const [checkIns, setCheckIns] = useState<CheckInWithSubtask[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState<
    (MonthlyGoal & { subtasks: Subtask[] }) | null
  >(null);
  const [unassignedSubtasks, setUnassignedSubtasks] = useState<Subtask[]>([]);
  const [allSubtasks, setAllSubtasks] = useState<Subtask[]>([]);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [subtaskMinutes, setSubtaskMinutes] = useState<Map<string, number>>(new Map());
  const [hasIncompleteFromPast, setHasIncompleteFromPast] = useState(false);
  const [pastIncompleteCount, setPastIncompleteCount] = useState(0);
  const [pastIncompleteSubtasks, setPastIncompleteSubtasks] = useState<Subtask[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const monthKey = getMonthKey(currentMonth);

    const { data: skill } = await supabase
      .from("skills")
      .select("*")
      .eq("id", skillId)
      .single();
    if (skill) {
      setSkillName(skill.name);
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

    const monthStart = monthKey;
    const d = new Date(monthStart + "T00:00:00");
    d.setMonth(d.getMonth() + 1);

    const { data: checkInRows } = await supabase
      .from("check_ins")
      .select("*, subtask:subtasks(*)")
      .eq("skill_id", skillId)
      .gte("date", monthStart)
      .lt("date", d.toISOString().substring(0, 10))
      .order("date", { ascending: false });

    setCheckIns((checkInRows as CheckInWithSubtask[]) ?? []);

    const { data: goalRows } = await supabase
      .from("monthly_goals")
      .select("*, subtasks(*)")
      .eq("skill_id", skillId)
      .eq("month", monthKey)
      .limit(1);

    setMonthlyGoal(
      goalRows?.[0] as (MonthlyGoal & { subtasks: Subtask[] }) | null ?? null
    );

    // Fetch unassigned subtasks (month = null)
    const { data: unassignedGoals } = await supabase
      .from("monthly_goals")
      .select("*, subtasks(*)")
      .eq("skill_id", skillId)
      .is("month", null);
    const unassigned: Subtask[] = [];
    if (unassignedGoals) {
      for (const g of unassignedGoals) {
        const subs = (g as unknown as { subtasks: Subtask[] }).subtasks ?? [];
        unassigned.push(...subs);
      }
    }
    setUnassignedSubtasks(unassigned);
    setAllSubtasks([
      ...(goalRows?.[0] as unknown as { subtasks: Subtask[] } | undefined)?.subtasks ?? [],
      ...unassigned,
    ]);

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

    const { data: knowledgeRows } = await supabase
      .from("knowledge_items")
      .select("*")
      .eq("skill_id", skillId)
      .eq("month", monthKey)
      .order("created_at", { ascending: false });

    setKnowledgeItems(knowledgeRows ?? []);

    // Subtask learning time
    const { data: allCheckIns } = await supabase
      .from("check_ins")
      .select("subtask_id, duration_minutes")
      .eq("skill_id", skillId)
      .not("subtask_id", "is", null);
    const timeMap = new Map<string, number>();
    for (const ci of (allCheckIns ?? [])) {
      if (ci.subtask_id) {
        timeMap.set(ci.subtask_id, (timeMap.get(ci.subtask_id) ?? 0) + ci.duration_minutes);
      }
    }
    setSubtaskMinutes(timeMap);

    setLoading(false);
  }, [skillId, currentMonth, supabase]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {activeTab === "daily" && (
        <DailyPlanTab skillId={skillId} />
      )}
      {activeTab === "checkin" && (
        <CheckInTab
          skillId={skillId}
          skillName={skillName}
          month={currentMonth}
          checkIns={checkIns}
          subtasks={allSubtasks}
          onSaved={fetchAll}
        />
      )}
      {activeTab === "plan" && (
        <PlanTab
          skillId={skillId}
          month={currentMonth}
          monthlyGoal={monthlyGoal}
          unassignedSubtasks={unassignedSubtasks}
          hasIncompleteFromPast={hasIncompleteFromPast}
          pastIncompleteCount={pastIncompleteCount}
          pastIncompleteSubtasks={pastIncompleteSubtasks}
          availableMonths={availableMonths}
          subtaskMinutes={subtaskMinutes}
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
