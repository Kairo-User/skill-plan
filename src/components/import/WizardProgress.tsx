import { StepIndicator } from "@/components/ui/StepIndicator";

const STEPS = ["计划名称", "子任务", "每日任务", "确认", "完成"];

interface WizardProgressProps {
  currentStep: number;
}

export function WizardProgress({ currentStep }: WizardProgressProps) {
  return <StepIndicator steps={STEPS} currentStep={currentStep} />;
}
