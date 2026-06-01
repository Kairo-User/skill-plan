-- 允许子任务不指定月份
ALTER TABLE monthly_goals ALTER COLUMN month DROP NOT NULL;
