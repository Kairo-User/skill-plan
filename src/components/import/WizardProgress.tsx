import { StepIndicator } from "@/components/ui/StepIndicator";

const STEPS = ["粘贴规划", "确认技能", "确认月份", "确认子任务", "完成"];

interface WizardProgressProps {
  currentStep: number;
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  return <StepIndicator steps={STEPS} currentStep={currentStep} />;
}
