"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { WizardProgress } from "@/components/import/WizardProgress";
import { StepPasteMarkdown } from "@/components/import/StepPasteMarkdown";
import { StepConfirmSkill } from "@/components/import/StepConfirmSkill";
import { StepConfirmMonths } from "@/components/import/StepConfirmMonths";
import { StepConfirmSubtasks } from "@/components/import/StepConfirmSubtasks";
import { StepComplete } from "@/components/import/StepComplete";
import type { ParsedPlan } from "@/types/database";

export default function ImportPage() {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<ParsedPlan>({ skillName: "", months: [] });

  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-20 md:pb-6">
        <h1 className="text-xl font-bold text-[var(--foreground)] mb-6">
          导入学习计划
        </h1>

        <WizardProgress currentStep={step} />

        {step === 0 && (
          <StepPasteMarkdown
            onNext={(p) => {
              setPlan(p);
              setStep(1);
            }}
          />
        )}
        {step === 1 && (
          <StepConfirmSkill
            plan={plan}
            onNext={(p) => {
              setPlan(p);
              setStep(2);
            }}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepConfirmMonths
            plan={plan}
            onNext={(p) => {
              setPlan(p);
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepConfirmSubtasks
            plan={plan}
            onNext={(p) => {
              setPlan(p);
              setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <StepComplete
            plan={plan}
            onBack={() => setStep(3)}
          />
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
