// ============================================
// Core table types
// ============================================

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyGoal {
  id: string;
  skill_id: string;
  month: string;        // "2026-03-01"
  is_completed: boolean;
  created_at: string;
}

export interface Subtask {
  id: string;
  monthly_goal_id: string;
  text: string;
  is_done: boolean;
  sort_order: number;
  created_at: string;
}

export interface CheckIn {
  id: string;
  skill_id: string;
  date: string;         // "2026-03-15"
  duration_minutes: number;
  subtask_id: string | null;
  notes: string | null;
  learning_insight: string | null;
  is_backfill: boolean;
  created_at: string;
}

export interface KnowledgeItem {
  id: string;
  skill_id: string;
  title: string | null;
  content: string;
  source_checkin_id: string | null;
  month: string;
  created_at: string;
}

export interface DailyTask {
  id: string;
  skill_id: string;
  text: string;
  sort_order: number;
  created_at: string;
  done_today?: boolean;
}

export interface PlanSnapshot {
  id: string;
  skill_id: string;
  snapshot_json: PlanSnapshotData;
  reason: string | null;
  created_at: string;
}

export interface PlanSnapshotData {
  monthly_goals: (MonthlyGoal & { subtasks: Subtask[] })[];
}

// ============================================
// Composite / UI types
// ============================================

export interface SkillWithPlan extends Skill {
  monthly_goals: (MonthlyGoal & { subtasks: Subtask[] })[];
}

export interface CheckInWithSubtask extends CheckIn {
  subtask: Subtask | null;
}

export interface SkillCardData {
  skill: Skill;
  todayCheckIn: CheckIn | null;
  subtasks: Subtask[];
}

// ============================================
// Import wizard types
// ============================================

export interface ParsedPlan {
  skillName: string;
  months: ParsedMonth[];
  unassignedSubtasks?: string[];
}

export interface ParsedMonth {
  monthLabel: string;   // "3月"
  monthDate: string;    // "2026-03-01"
  subtasks: string[];
}

// ============================================
// Check-in form state machine
// ============================================

export type CheckInStep =
  | "date"
  | "duration"
  | "subtask"
  | "notes"
  | "insight"
  | "knowledge"
  | "complete";

export interface CheckInFormData {
  step: CheckInStep;
  date: string;
  durationMinutes: number | null;
  subtaskId: string | null;
  notes: string;
  learningInsight: string;
  knowledgeContent: string;
}
