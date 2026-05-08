"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--card)] flex justify-around py-2">
      <Link
        href="/"
        className={`flex flex-col items-center gap-0.5 text-xs px-4 py-1 rounded-lg ${
          pathname === "/"
            ? "text-[var(--primary)]"
            : "text-[var(--muted-foreground)]"
        }`}
      >
        <span className="text-lg">🏠</span>
        <span>首页</span>
      </Link>
      <Link
        href="/import"
        className={`flex flex-col items-center gap-0.5 text-xs px-4 py-1 rounded-lg ${
          pathname === "/import"
            ? "text-[var(--primary)]"
            : "text-[var(--muted-foreground)]"
        }`}
      >
        <span className="text-lg">📥</span>
        <span>导入</span>
      </Link>
      <Link
        href="/settings"
        className={`flex flex-col items-center gap-0.5 text-xs px-4 py-1 rounded-lg ${
          pathname === "/settings"
            ? "text-[var(--primary)]"
            : "text-[var(--muted-foreground)]"
        }`}
      >
        <span className="text-lg">⚙️</span>
        <span>设置</span>
      </Link>
    </nav>
  );
}
