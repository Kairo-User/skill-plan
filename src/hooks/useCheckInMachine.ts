"use client";

import { useReducer } from "react";
import type { CheckInStep, CheckInFormData } from "@/types/database";
import { formatDate } from "@/lib/utils";

type Action =
  | { type: "SET_DURATION"; value: number }
  | { type: "SET_SUBTASK"; id: string | null }
  | { type: "SET_NOTES"; value: string }
  | { type: "SKIP" }
  | { type: "RESET" };

const STEP_ORDER: CheckInStep[] = [
  "duration",
  "subtask",
  "notes",
  "complete",
];

function nextStep(state: CheckInFormData): CheckInStep {
  const idx = STEP_ORDER.indexOf(state.step);
  if (idx >= STEP_ORDER.length - 1) return "complete";
  return STEP_ORDER[idx + 1];
}

function reducer(state: CheckInFormData, action: Action): CheckInFormData {
  switch (action.type) {
    case "SET_DURATION":
      return { ...state, durationMinutes: action.value, step: nextStep({ ...state, step: "duration" }) };

    case "SET_SUBTASK":
      return { ...state, subtaskId: action.id, step: nextStep({ ...state, step: "subtask" }) };

    case "SKIP":
      return { ...state, step: nextStep(state) };

    case "SET_NOTES":
      return { ...state, notes: action.value, step: nextStep({ ...state, step: "notes" }) };

    case "RESET":
      return initialState();

    default:
      return state;
  }
}

export function initialState(): CheckInFormData {
  return {
    step: "duration",
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
    setDuration: (value: number) => dispatch({ type: "SET_DURATION", value }),
    setSubtask: (id: string | null) => dispatch({ type: "SET_SUBTASK", id }),
    setNotes: (value: string) => dispatch({ type: "SET_NOTES", value }),
    skip: () => dispatch({ type: "SKIP" }),
    reset: () => dispatch({ type: "RESET" }),
  };
}
