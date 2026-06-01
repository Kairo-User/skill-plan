-- 每日任务系统
-- 在 Supabase SQL Editor 中执行

CREATE TABLE daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_daily_tasks_skill ON daily_tasks(skill_id);

ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_tasks_select_own" ON daily_tasks
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM skills WHERE id = daily_tasks.skill_id));

CREATE POLICY "daily_tasks_insert_own" ON daily_tasks
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM skills WHERE id = daily_tasks.skill_id));

CREATE POLICY "daily_tasks_delete_own" ON daily_tasks
  FOR DELETE USING (auth.uid() = (SELECT user_id FROM skills WHERE id = daily_tasks.skill_id));

-- Completions: one row per task per day = completed
CREATE TABLE daily_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_task_id UUID NOT NULL REFERENCES daily_tasks(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(daily_task_id, date)
);

CREATE INDEX idx_daily_completions_task_date ON daily_completions(daily_task_id, date);

ALTER TABLE daily_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_completions_select_own" ON daily_completions
  FOR SELECT USING (
    auth.uid() = (
      SELECT s.user_id FROM skills s
      JOIN daily_tasks dt ON dt.skill_id = s.id
      WHERE dt.id = daily_completions.daily_task_id
    )
  );

CREATE POLICY "daily_completions_insert_own" ON daily_completions
  FOR INSERT WITH CHECK (
    auth.uid() = (
      SELECT s.user_id FROM skills s
      JOIN daily_tasks dt ON dt.skill_id = s.id
      WHERE dt.id = daily_completions.daily_task_id
    )
  );

CREATE POLICY "daily_completions_delete_own" ON daily_completions
  FOR DELETE USING (
    auth.uid() = (
      SELECT s.user_id FROM skills s
      JOIN daily_tasks dt ON dt.skill_id = s.id
      WHERE dt.id = daily_completions.daily_task_id
    )
  );
