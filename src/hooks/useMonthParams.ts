"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { formatDate, getMonthKey } from "@/lib/utils";

export function useMonthParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const monthParam = searchParams.get("month");
  const currentMonth = monthParam ?? formatDate(new Date());

  const setMonth = useCallback(
    (month: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", getMonthKey(month));
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const goNext = useCallback(() => {
    const d = new Date(currentMonth + "T00:00:00");
    d.setMonth(d.getMonth() + 1);
    setMonth(formatDate(d));
  }, [currentMonth, setMonth]);

  const goPrev = useCallback(() => {
    const d = new Date(currentMonth + "T00:00:00");
    d.setMonth(d.getMonth() - 1);
    setMonth(formatDate(d));
  }, [currentMonth, setMonth]);

  return { currentMonth, setMonth, goNext, goPrev };
}
