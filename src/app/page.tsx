"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SkillCardGrid } from "@/components/home/SkillCardGrid";
import { CheckInDialog } from "@/components/home/CheckInDialog";
import { RandomKnowledgeWidget } from "@/components/home/RandomKnowledgeWidget";
import { StudyStats } from "@/components/home/StudyStats";
import { DailyPlan } from "@/components/home/DailyPlan";
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
  const [selectedSubtasks, setSelectedSubtasks] = useState<Subtask[]>([]);
  const [editMode, setEditMode] = useState(false);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const todayStr = today();
    const monthKey = todayStr.substring(0, 7) + "-01";

    const { data: skillRows } = await supabase
      .from("skills")
      .select("*")
      .order("created_at", { ascending: false });

    if (!skillRows) {
      setSkills([]);
      setLoading(false);
      return;
    }

    const skillsWithData: SkillCardData[] = await Promise.all(
      skillRows.map(async (skill: Skill) => {
        const { data: checkIns } = await supabase
          .from("check_ins")
          .select("*")
          .eq("skill_id", skill.id)
          .eq("date", todayStr)
          .limit(1);

        // Fetch current month subtasks
        const { data: goals } = await supabase
          .from("monthly_goals")
          .select("id")
          .eq("skill_id", skill.id)
          .eq("month", monthKey)
          .limit(1);

        let subtasks: Subtask[] = [];
        if (goals?.[0]) {
          const { data: sts } = await supabase
            .from("subtasks")
            .select("*")
            .eq("monthly_goal_id", (goals[0] as { id: string }).id)
            .order("sort_order");
          subtasks = sts ?? [];
        }

        return { skill, todayCheckIn: checkIns?.[0] ?? null, subtasks };
      })
    );

    setSkills(skillsWithData);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleCheckIn(skillId: string, skillName: string) {
    const skillData = skills.find((s) => s.skill.id === skillId);
    setSelectedSkillId(skillId);
    setSelectedSkillName(skillName);
    setSelectedCheckIn(skillData?.todayCheckIn ?? null);
    setSelectedSubtasks(skillData?.subtasks ?? []);
    setDialogOpen(true);
  }

  async function handleDelete(skillId: string) {
    await supabase.from("skills").delete().eq("id", skillId);
    setSkills((prev) => prev.filter((s) => s.skill.id !== skillId));
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
          <div className="flex items-center gap-2">
            <a
              href="/settings"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              设置
            </a>
            <Button
              variant={editMode ? "danger" : "ghost"}
              size="sm"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "完成" : "编辑"}
            </Button>
            {!editMode && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { window.location.href = "/import"; }}
              >
                + 新建计划
              </Button>
            )}
          </div>
        </div>

        <SkillCardGrid
          skills={skills}
          editMode={editMode}
          onCheckIn={handleCheckIn}
          onDelete={handleDelete}
        />

        {/* Reminder banner: skills not checked in today */}
        {skills.filter((s) => !s.todayCheckIn).length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
            <p className="text-sm font-medium text-[var(--foreground)] mb-2">
              ⏰ 今日还未打卡
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.filter((s) => !s.todayCheckIn).map((s) => (
                <button
                  key={s.skill.id}
                  onClick={() => handleCheckIn(s.skill.id, s.skill.name)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-colors"
                >
                  {s.skill.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <div className="mt-8 space-y-8">
            <DailyPlan />
            <section>
              <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">
                学习统计
              </h2>
              <StudyStats refreshKey={skills.length} />
            </section>
            <RandomKnowledgeWidget />
          </div>
        )}
      </main>

      <MobileBottomNav />

      <CheckInDialog
        skillId={selectedSkillId}
        skillName={selectedSkillName}
        existingCheckIn={selectedCheckIn}
        subtasks={selectedSubtasks}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={fetchData}
      />
    </div>
  );
}
