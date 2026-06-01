"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface DurationPickerProps {
  valueMinutes?: number;
  onChange: (minutes: number) => void;
}

export function DurationPicker({ valueMinutes, onChange }: DurationPickerProps) {
  const defaultH = valueMinutes ? Math.floor(valueMinutes / 60) : 0;
  const defaultM = valueMinutes ? valueMinutes % 60 : 0;
  const [hours, setHours] = useState(defaultH);
  const [mins, setMins] = useState(defaultM);

  function emit(h: number, m: number) {
    const total = h * 60 + m;
    if (total > 0) onChange(total);
  }

  function incHours() {
    const h = hours + 1;
    setHours(h);
    emit(h, mins);
  }
  function decHours() {
    const h = Math.max(0, hours - 1);
    setHours(h);
    emit(h, mins);
  }
  function incMins() {
    const m = mins >= 45 ? 0 : mins + 15;
    const h = mins >= 45 ? Math.min(24, hours + 1) : hours;
    setMins(m);
    setHours(h);
    emit(h, m);
  }
  function decMins() {
    const m = mins <= 0 ? 45 : mins - 15;
    const h = mins <= 0 ? Math.max(0, hours - 1) : hours;
    setMins(m);
    setHours(h);
    emit(h, m);
  }

  function handleHoursInput(val: string) {
    const h = Math.min(24, Math.max(0, parseInt(val) || 0));
    setHours(h);
    emit(h, mins);
  }
  function handleMinsInput(val: string) {
    let m = Math.min(59, Math.max(0, parseInt(val) || 0));
    let h = hours;
    if (h === 24 && m > 0) m = 0;
    setMins(m);
    setHours(h);
    emit(h, m);
  }

  return (
    <div className="flex items-center gap-3 justify-center">
      <div className="flex flex-col items-center">
        <button
          onClick={incHours}
          className="w-10 h-8 flex items-center justify-center rounded-t-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-lg"
        >
          +
        </button>
        <input
          value={hours}
          onChange={(e) => handleHoursInput(e.target.value)}
          className="w-10 h-10 text-center text-lg font-bold bg-[var(--muted)] text-[var(--foreground)] border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          type="number"
          min={0}
          max={24}
        />
        <button
          onClick={decHours}
          className="w-10 h-8 flex items-center justify-center rounded-b-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-lg"
        >
          −
        </button>
        <span className="text-xs text-[var(--muted-foreground)] mt-1">小时</span>
      </div>

      <span className="text-lg font-bold text-[var(--muted-foreground)] pt-4">:</span>

      <div className="flex flex-col items-center">
        <button
          onClick={incMins}
          className="w-10 h-8 flex items-center justify-center rounded-t-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-lg"
        >
          +
        </button>
        <input
          value={mins}
          onChange={(e) => handleMinsInput(e.target.value)}
          className="w-10 h-10 text-center text-lg font-bold bg-[var(--muted)] text-[var(--foreground)] border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          type="number"
          min={0}
          max={59}
          step={15}
        />
        <button
          onClick={decMins}
          className="w-10 h-8 flex items-center justify-center rounded-b-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors text-lg"
        >
          −
        </button>
        <span className="text-xs text-[var(--muted-foreground)] mt-1">分钟</span>
      </div>
    </div>
  );
}
