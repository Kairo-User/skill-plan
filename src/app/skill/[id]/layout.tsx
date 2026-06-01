"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MonthSwitcher } from "@/components/skill/MonthSwitcher";
import { TabBar } from "@/components/skill/TabBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";
import { getAvailableMonths } from "@/lib/utils";
import { SkillTabContext, type SkillTab } from "@/lib/skill-context";

export default function SkillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const skillId = params.id as string;
  const [skillName, setSkillName] = useState("");
  const [editName, setEditName] = useState("");
  const [nameEditing, setNameEditing] = useState(false);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SkillTab>("checkin");
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().substring(0, 7) + "-01"
  );
  const [editMode, setEditMode] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: skill } = await supabase
        .from("skills")
        .select("*")
        .eq("id", skillId)
        .single();

      if (skill) {
        setSkillName(skill.name);
        const baseMonths = getAvailableMonths(skill.created_at);
        // Also include months that have data for this skill
        const { data: goals } = await supabase.from("monthly_goals").select("month").eq("skill_id", skillId).order("month");
        const dataMonths = (goals ?? []).map((g: { month: string }) => g.month);
        const allMonths = [...new Set([...baseMonths, ...dataMonths])].sort();
        setAvailableMonths(allMonths);
        if (allMonths.length > 0) setCurrentMonth(allMonths[allMonths.length - 1]);
      }
      setLoading(false);
    }
    load();
  }, [skillId, supabase]);

  async function handleDelete() {
    await supabase.from("skills").delete().eq("id", skillId);
    router.push("/");
  }

  function startEditName() {
    setEditName(skillName);
    setNameEditing(true);
  }

  async function saveName() {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === skillName) {
      setNameEditing(false);
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (userId) {
      const { data } = await supabase.from("skills").select("id").eq("name", trimmed).eq("user_id", userId).limit(1);
      if (data && data.length > 0) { /* name exists, update anyway */ }
    }
    await supabase.from("skills").update({ name: trimmed }).eq("id", skillId);
    setSkillName(trimmed);
    setNameEditing(false);
  }

  function goPrev() {
    const idx = availableMonths.indexOf(currentMonth);
    if (idx > 0) setCurrentMonth(availableMonths[idx - 1]);
  }
  function goNext() {
    const idx = availableMonths.indexOf(currentMonth);
    if (idx < availableMonths.length - 1) setCurrentMonth(availableMonths[idx + 1]);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <SkillTabContext.Provider value={{ activeTab, setActiveTab, currentMonth, setCurrentMonth, editMode, setEditMode }}>
      <div className="flex flex-col flex-1">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--card)]">
          <Link href="/" className="text-[var(--muted-foreground)]">
            ← 返回
          </Link>
          {nameEditing ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={saveName}
              onKeyDown={(e) => { if (e.key === "Enter") saveName(); }}
              className="px-2 py-1 rounded bg-[var(--muted)] text-sm font-semibold text-[var(--foreground)] border border-[var(--primary)] outline-none"
              autoFocus
            />
          ) : (
            <button onClick={startEditName} className="font-semibold text-[var(--foreground)] text-sm">
              {skillName}
            </button>
          )}
          <button
            onClick={() => setEditMode(!editMode)}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm"
          >
            {editMode ? "完成" : "编辑"}
          </button>
        </div>

        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-24 md:pb-6">
          {/* Desktop header */}
          <div className="hidden md:flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                ← 首页
              </Link>
              {nameEditing ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={(e) => { if (e.key === "Enter") saveName(); }}
                  className="px-2 py-1 rounded bg-[var(--muted)] text-lg font-bold text-[var(--foreground)] border border-[var(--primary)] outline-none"
                  autoFocus
                />
              ) : (
                <button onClick={startEditName} className="text-lg font-bold text-[var(--foreground)]">
                  {skillName}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={editMode ? "danger" : "ghost"}
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? "完成编辑" : "编辑"}
              </Button>
              {editMode && (
                <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
                  删除技能
                </Button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <MonthSwitcher
              currentMonth={currentMonth}
              availableMonths={availableMonths}
              onPrev={goPrev}
              onNext={goNext}
              onSelect={setCurrentMonth}
            />
          </div>

          <TabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {children}
        </div>

        <ConfirmDialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          title="删除技能"
          message={`确定要删除「${skillName}」吗？相关的打卡记录、子任务和知识点都会被永久删除。`}
          confirmLabel="确认删除"
          danger
        />
      </div>
    </SkillTabContext.Provider>
  );
}
