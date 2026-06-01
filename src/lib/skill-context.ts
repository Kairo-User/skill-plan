"use client";

import { createContext, useContext } from "react";

export type SkillTab = "checkin" | "plan" | "knowledge" | "daily";

export const SkillTabContext = createContext<{
  activeTab: SkillTab;
  setActiveTab: (tab: SkillTab) => void;
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
}>({
  activeTab: "checkin",
  setActiveTab: () => {},
  currentMonth: "",
  setCurrentMonth: () => {},
  editMode: false,
  setEditMode: () => {},
});

export function useSkillTab() {
  return useContext(SkillTabContext);
}
