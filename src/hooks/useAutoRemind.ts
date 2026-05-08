"use client";

import { useEffect } from "react";

const REMIND_INTERVAL_MS = 2.5 * 60 * 60 * 1000; // 2.5 hours

export function useAutoRemind() {
  useEffect(() => {
    const timer = setInterval(() => {
      const lastExport = localStorage.getItem("skillplan_last_export");
      const now = Date.now();

      if (!lastExport || now - parseInt(lastExport) > REMIND_INTERVAL_MS) {
        // Show a gentle toast-like reminder if page is visible
        if (document.visibilityState === "visible") {
          const toast = document.createElement("div");
          toast.className =
            "fixed bottom-20 right-4 z-50 bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] shadow-lg animate-bubble-in";
          toast.innerHTML =
            '💾 好久没导出数据啦～<button onclick="this.parentElement.remove()" style="margin-left:8px;color:var(--primary)">知道了</button>';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 10000);
        }
      }
    }, REMIND_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);
}
