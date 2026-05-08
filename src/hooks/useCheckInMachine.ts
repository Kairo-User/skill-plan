"use client";

import { useReducer } from "react";
import type { CheckInStep, CheckInFormData } from "@/types/database";
import { formatDate } from "@/lib/utils";

type Action =
  | { type: "NEXT" }
  | { type: "SET_DATE"; date: string }
  | { type: "SET_DURATION"; value: number }
  | { type: "SET_SUBTASK"; id: string | null }
  | { type: "SET_NOTES"; value: string }
  | { type: "SET_INSIGHT"; value: string }
  | { type: "SET_KNOWLEDGE"; value: string }
  | { type: "SKIP" }
  | { type: "RESET" };

const STEP_ORDER: CheckInStep[] = [
  "date",
  "duration",
  "subtask",
  "notes",
  "insight",
  "knowledge",
  "complete",
];

const SKIPPABLE: CheckInStep[] = ["subtask", "notes", "insight", "knowledge"];

function nextRequiredStep(state: CheckInFormData): CheckInStep {
  const idx = STEP_ORDER.indexOf(state.step);
  for (let i = idx + 1; i < STEP_ORDER.length; i++) {
    const step = STEP_ORDER[i];
    if (SKIPPABLE.includes(step)) continue;

    // duration requires a value
    if (step === "duration" && state.durationMinutes === null) return step;
    return step;
  }
  return "complete";
}

function reducer(state: CheckInFormData, action: Action): CheckInFormData {
  switch (action.type) {
    case "SET_DATE":
      return { ...state, date: action.date, step: "duration" };

    case "SET_DURATION":
      return { ...state, durationMinutes: action.value, step: nextRequiredStep({ ...state, durationMinutes: action.value, step: "duration" }) };

    case "SET_SUBTASK":
      return { ...state, subtaskId: action.id, step: nextRequiredStep({ ...state, step: "subtask" }) };

    case "SKIP":
      return { ...state, step: nextRequiredStep(state) };

    case "SET_NOTES":
      return { ...state, notes: action.value, step: nextRequiredStep({ ...state, step: "notes" }) };

    case "SET_INSIGHT":
      return { ...state, learningInsight: action.value, step: nextRequiredStep({ ...state, step: "insight" }) };

    case "SET_KNOWLEDGE":
      return { ...state, knowledgeContent: action.value, step: nextRequiredStep({ ...state, step: "knowledge" }) };

    case "RESET":
      return initialState();

    default:
      return state;
  }
}

export function initialState(): CheckInFormData {
  return {
    step: "date",
    date: formatDate(new Date()),
    durationMinutes: null,
    subtaskId: null,
    notes: "",
    learningInsight: "",
    knowledgeContent: "",
  };
}

export function useCheckInMachine() {
  const [state, dispatch] = useReducer(reducer, null, initialState);

  return {
    state,
    setDate: (date: string) => dispatch({ type: "SET_DATE", date }),
    setDuration: (value: number) => dispatch({ type: "SET_DURATION", value }),
    setSubtask: (id: string | null) => dispatch({ type: "SET_SUBTASK", id }),
    setNotes: (value: string) => dispatch({ type: "SET_NOTES", value }),
    setInsight: (value: string) => dispatch({ type: "SET_INSIGHT", value }),
    setKnowledge: (value: string) => dispatch({ type: "SET_KNOWLEDGE", value }),
    skip: () => dispatch({ type: "SKIP" }),
    reset: () => dispatch({ type: "RESET" }),
  };
}
