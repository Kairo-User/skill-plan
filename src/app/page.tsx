"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SkillCardGrid } from "@/components/home/SkillCardGrid";
import { CheckInDialog } from "@/components/home/CheckInDialog";
import { RandomKnowledgeWidget } from "@/components/home/RandomKnowledgeWidget";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { today } from "@/lib/utils";
import type { SkillCardData, Skill, CheckIn, Subtask } from "@/types/database";

export default function Home() {
  const [skills, setSkills] = useState<SkillCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedSkillName, setSelectedSkillName] = useState("");
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const todayStr = today();

    const { data: skillRows } = await supabase
      .from("skills")
      .select("*")
      .order("created_at", { ascending: false });

    if (!skillRows) {
      setSkills([]);
      setLoading(false);
      return;
    }

    const skillsWithCheckIns: SkillCardData[] = await Promise.all(
      skillRows.map(async (skill: Skill) => {
        const { data: checkIns } = await supabase
          .from("check_ins")
          .select("*")
          .eq("skill_id", skill.id)
          .eq("date", todayStr)
          .limit(1);

        return {
          skill,
          todayCheckIn: checkIns?.[0] ?? null,
        };
      })
    );

    setSkills(skillsWithCheckIns);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleCheckIn(skillId: string, skillName: string) {
    const skillData = skills.find((s) => s.skill.id === skillId);

    // Fetch subtasks for current month
    const monthKey = today().substring(0, 7) + "-01";
    const { data: goalRows } = await supabase
      .from("monthly_goals")
      .select("id")
      .eq("skill_id", skillId)
      .eq("month", monthKey)
      .limit(1);

    let subtaskList: Subtask[] = [];
    if (goalRows?.[0]) {
      const { data: sts } = await supabase
        .from("subtasks")
        .select("*")
        .eq("monthly_goal_id", goalRows[0].id)
        .order("sort_order");
      subtaskList = sts ?? [];
    }

    setSelectedSkillId(skillId);
    setSelectedSkillName(skillName);
    setSelectedCheckIn(skillData?.todayCheckIn ?? null);
    setSubtasks(subtaskList);
    setDialogOpen(true);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-20 md:pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">
              今天也要加油哦～
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              {today()}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              window.location.href = "/import";
            }}
          >
            + 新建计划
          </Button>
        </div>

        <SkillCardGrid skills={skills} onCheckIn={handleCheckIn} />

        {skills.length > 0 && (
          <div className="mt-8">
            <RandomKnowledgeWidget />
          </div>
        )}
      </main>

      <MobileBottomNav />

      <CheckInDialog
        skillId={selectedSkillId}
        skillName={selectedSkillName}
        existingCheckIn={selectedCheckIn}
        subtasks={subtasks}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={fetchData}
      />
    </div>
  );
}
