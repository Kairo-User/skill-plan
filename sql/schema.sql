-- SkillPlan Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- TABLE: skills
-- ============================================
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skills_user_id ON skills(user_id);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skills_select_own" ON skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "skills_insert_own" ON skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "skills_update_own" ON skills FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "skills_delete_own" ON skills FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TABLE: monthly_goals
-- ============================================
CREATE TABLE monthly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(skill_id, month)
);

CREATE INDEX idx_monthly_goals_skill_id ON monthly_goals(skill_id);

ALTER TABLE monthly_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "monthly_goals_select_own" ON monthly_goals
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM skills WHERE id = monthly_goals.skill_id));

CREATE POLICY "monthly_goals_insert_own" ON monthly_goals
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM skills WHERE id = monthly_goals.skill_id));

CREATE POLICY "monthly_goals_update_own" ON monthly_goals
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM skills WHERE id = monthly_goals.skill_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM skills WHERE id = monthly_goals.skill_id));

CREATE POLICY "monthly_goals_delete_own" ON monthly_goals
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM skills WHERE id = monthly_goals.skill_id));

-- ============================================
-- TABLE: subtasks
-- ============================================
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_goal_id UUID NOT NULL REFERENCES monthly_goals(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subtasks_monthly_goal_id ON subtasks(monthly_goal_id);

ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subtasks_select_own" ON subtasks
  FOR SELECT USING (
    auth.uid() = (
      SELECT s.user_id FROM skills s
      JOIN monthly_goals mg ON mg.skill_id = s.id
      WHERE mg.id = subtasks.monthly_goal_id
    )
  );

CREATE POLICY "subtasks_insert_own" ON subtasks
  FOR INSERT WITH CHECK (
    auth.uid() = (
      SELECT s.user_id FROM skills s
      JOIN monthly_goals mg ON mg.skill_id = s.id
      WHERE mg.id = subtasks.monthly_goal_id
    )
  );

CREATE POLICY "subtasks_update_own" ON subtasks
  FOR UPDATE USING (
    auth.uid() = (
      SELECT s.user_id FROM skills s
      JOIN monthly_goals mg ON mg.skill_id = s.id
      WHERE mg.id = subtasks.monthly_goal_id
    )
  ) WITH CHECK (
    auth.uid() = (
      SELECT s.user_id FROM skills s
      JOIN monthly_goals mg ON mg.skill_id = s.id
      WHERE mg.id = subtasks.monthly_goal_id
    )
  );

CREATE POLICY "subtasks_delete_own" ON subtasks
  FOR DELETE USING (
    auth.uid() = (
      SELECT s.user_id FROM skills s
      JOIN monthly_goals mg ON mg.skill_id = s.id
      WHERE mg.id = subtasks.monthly_goal_id
    )
  );

-- ============================================
-- TABLE: check_ins
-- ============================================
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  subtask_id UUID REFERENCES subtasks(id) ON DELETE SET NULL,
  notes TEXT,
  learning_insight TEXT,
  is_backfill BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(skill_id, date)
);

CREATE INDEX idx_check_ins_skill_id ON check_ins(skill_id);
CREATE INDEX idx_check_ins_date ON check_ins(date);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "check_ins_select_own" ON check_ins
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM skills WHERE id = check_ins.skill_id));

CREATE POLICY "check_ins_insert_own" ON check_ins
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM skills WHERE id = check_ins.skill_id));

CREATE POLICY "check_ins_update_own" ON check_ins
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM skills WHERE id = check_ins.skill_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM skills WHERE id = check_ins.skill_id));

CREATE POLICY "check_ins_delete_own" ON check_ins
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM skills WHERE id = check_ins.skill_id));

-- ============================================
-- TABLE: knowledge_items
-- ============================================
CREATE TABLE knowledge_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source_checkin_id UUID REFERENCES check_ins(id) ON DELETE SET NULL,
  month DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_knowledge_items_skill_month ON knowledge_items(skill_id, month);

ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "knowledge_items_select_own" ON knowledge_items
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM skills WHERE id = knowledge_items.skill_id));

CREATE POLICY "knowledge_items_insert_own" ON knowledge_items
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM skills WHERE id = knowledge_items.skill_id));

CREATE POLICY "knowledge_items_delete_own" ON knowledge_items
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM skills WHERE id = knowledge_items.skill_id));

-- ============================================
-- TABLE: plan_snapshots
-- ============================================
CREATE TABLE plan_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  snapshot_json JSONB NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_plan_snapshots_skill_id ON plan_snapshots(skill_id);

ALTER TABLE plan_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plan_snapshots_select_own" ON plan_snapshots
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM skills WHERE id = plan_snapshots.skill_id));

CREATE POLICY "plan_snapshots_insert_own" ON plan_snapshots
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM skills WHERE id = plan_snapshots.skill_id));

-- ============================================
-- TRIGGER: update updated_at on skills
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
