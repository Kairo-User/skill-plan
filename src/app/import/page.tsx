"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { WizardProgress } from "@/components/import/WizardProgress";
import { StepInputName } from "@/components/import/StepInputName";
import { StepInputSubtasks, type SubtaskInput, type SubtaskMonth } from "@/components/import/StepInputSubtasks";
import { StepInputDaily } from "@/components/import/StepInputDaily";
import { StepReview } from "@/components/import/StepReview";
import { StepComplete } from "@/components/import/StepComplete";
import { formatMonth } from "@/lib/utils";
import type { ParsedPlan, ParsedMonth } from "@/types/database";

function buildPlan(skillName: string, subtasks: SubtaskInput[]): ParsedPlan {
  const monthMap = new Map<string, string[]>();
  const unassigned: string[] = [];
  for (const st of subtasks) {
    if (st.months.length === 0) {
      unassigned.push(st.text);
    } else {
      for (const m of st.months) {
        const date = `${m.year}-${String(m.month).padStart(2, "0")}-01`;
        if (!monthMap.has(date)) monthMap.set(date, []);
        monthMap.get(date)!.push(st.text);
      }
    }
  }
  const months: ParsedMonth[] = [...monthMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, texts]) => ({ monthLabel: formatMonth(date), monthDate: date, subtasks: texts }));
  return { skillName, months, unassignedSubtasks: unassigned };
}

export default function ImportPage() {
  const [step, setStep] = useState(0);
  const [skillName, setSkillName] = useState("");
  const [subtasks, setSubtasks] = useState<SubtaskInput[]>([]);
  const [dailyTasks, setDailyTasks] = useState<string[]>([]);
  const [plan, setPlan] = useState<ParsedPlan>({ skillName: "", months: [] });

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-20 md:pb-6">
        <h1 className="text-xl font-bold text-[var(--foreground)] mb-6">创建学习计划</h1>
        <WizardProgress currentStep={step} />

        {step === 0 && (
          <StepInputName onNext={(name) => { setSkillName(name); setStep(1); }} />
        )}
        {step === 1 && (
          <StepInputSubtasks
            onNext={({ subtasks: sts }) => { setSubtasks(sts); setPlan(buildPlan(skillName, sts)); setStep(2); }}
            onBack={() => setStep(0)} />
        )}
        {step === 2 && (
          <StepInputDaily
            onNext={({ dailyTasks: dts }) => { setDailyTasks(dts); setStep(3); }}
            onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <StepReview skillName={skillName} subtasks={subtasks}
            onSave={() => setStep(4)} onBack={() => setStep(2)} />
        )}
        {step === 4 && (
          <StepComplete plan={plan} dailyTasks={dailyTasks}
            onBack={() => setStep(3)} />
        )}
      </main>
      <MobileBottomNav />
    </div>
  );
}
