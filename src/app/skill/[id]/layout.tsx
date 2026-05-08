"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MonthSwitcher } from "@/components/skill/MonthSwitcher";
import { TabBar } from "@/components/skill/TabBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useMonthParams } from "@/hooks/useMonthParams";
import { createClient } from "@/lib/supabase/client";
import { getAvailableMonths, formatDate } from "@/lib/utils";

export default function SkillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const skillId = params.id as string;
  const { currentMonth, setMonth, goNext, goPrev } = useMonthParams();
  const [skillName, setSkillName] = useState("");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
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
        setAvailableMonths(getAvailableMonths(skill.created_at));
      }
      setLoading(false);
    }
    load();
  }, [skillId, supabase]);

  if (loading) return <LoadingSpinner />;

  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const activeTab =
    (searchParams.get("tab") as "checkin" | "plan" | "knowledge") ?? "checkin";

  return (
    <div className="flex flex-col flex-1">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--card)]">
        <Link href="/" className="text-[var(--muted-foreground)]">
          ← 返回
        </Link>
        <span className="font-semibold text-[var(--foreground)] text-sm">
          {skillName}
        </span>
        <div className="w-8" /> {/* spacer */}
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
            <h1 className="text-lg font-bold text-[var(--foreground)]">
              {skillName}
            </h1>
          </div>
        </div>

        <div className="mb-4">
          <MonthSwitcher
            currentMonth={currentMonth}
            availableMonths={availableMonths}
            onPrev={goPrev}
            onNext={goNext}
            onSelect={setMonth}
          />
        </div>

        <TabBar
          skillId={skillId}
          activeTab={activeTab}
          currentMonth={currentMonth}
        />

        {children}
      </div>
    </div>
  );
}
