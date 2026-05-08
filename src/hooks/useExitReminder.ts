"use client";

import { useEffect } from "react";

export function useExitReminder() {
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      const lastExport = localStorage.getItem("skillplan_last_export");
      const now = Date.now();
      const twoHours = 2 * 60 * 60 * 1000;

      if (!lastExport || now - parseInt(lastExport) > twoHours) {
        e.preventDefault();
        e.returnValue = "数据还没导出备份哦～确定要离开吗？";
        return e.returnValue;
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
}
