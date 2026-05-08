"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function Header() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-bold text-[var(--primary)]">
          SkillPlan
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/import"
            className={
              pathname === "/import"
                ? "text-[var(--primary)] font-medium"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }
          >
            导入计划
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/settings"
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          设置
        </Link>
        <span className="text-[var(--muted-foreground)]">{user.email}</span>
        <button
          onClick={signOut}
          className="text-[var(--muted-foreground)] hover:text-[var(--danger)] transition-colors"
        >
          退出
        </button>
      </div>
    </header>
  );
}
