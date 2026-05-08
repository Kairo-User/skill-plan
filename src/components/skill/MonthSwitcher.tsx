"use client";

import { formatMonth } from "@/lib/utils";

interface MonthSwitcherProps {
  currentMonth: string;
  availableMonths: string[];
  onPrev: () => void;
  onNext: () => void;
  onSelect: (month: string) => void;
}

export function MonthSwitcher({
  currentMonth,
  availableMonths,
  onPrev,
  onNext,
  onSelect,
}: MonthSwitcherProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={onPrev}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
      >
        &lt;
      </button>

      <select
        value={currentMonth}
        onChange={(e) => onSelect(e.target.value)}
        className="px-3 py-1.5 rounded-lg bg-[var(--muted)] text-[var(--foreground)] text-sm font-medium border-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
      >
        {availableMonths.map((m) => (
          <option key={m} value={m}>
            {formatMonth(m)}
          </option>
        ))}
      </select>

      <button
        onClick={onNext}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
      >
        &gt;
      </button>
    </div>
  );
}
