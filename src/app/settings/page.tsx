"use client";

import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ThemeSection } from "@/components/settings/ThemeSection";
import { ExportSection } from "@/components/settings/ExportSection";
import { AccountSection } from "@/components/settings/AccountSection";

export default function SettingsPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-20 md:pb-6 space-y-8">
        <h1 className="text-xl font-bold text-[var(--foreground)]">设置</h1>
        <ThemeSection />
        <hr className="border-[var(--border)]" />
        <ExportSection />
        <hr className="border-[var(--border)]" />
        <AccountSection />
      </main>

      <MobileBottomNav />
    </div>
  );
}
