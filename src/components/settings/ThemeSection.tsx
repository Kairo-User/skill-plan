"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div>
      <h3 className="font-semibold text-[var(--foreground)] mb-3">主题</h3>
      <div className="flex gap-2">
        {[
          { value: "system", label: "跟随系统" },
          { value: "light", label: "浅色" },
          { value: "dark", label: "深色" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
              theme === opt.value
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--border)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
