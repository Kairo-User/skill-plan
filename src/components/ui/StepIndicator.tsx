import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
              i <= currentStep
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            )}
          >
            {i + 1}
          </div>
          <span
            className={cn(
              "text-xs hidden sm:inline",
              i <= currentStep
                ? "text-[var(--foreground)]"
                : "text-[var(--muted-foreground)]"
            )}
          >
            {label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "w-8 h-0.5 hidden sm:block",
                i < currentStep ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
