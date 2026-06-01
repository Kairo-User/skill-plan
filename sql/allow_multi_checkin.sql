-- 允许同一天多次打卡
-- 在 Supabase SQL Editor 中执行这条语句
ALTER TABLE check_ins DROP CONSTRAINT IF EXISTS check_ins_skill_id_date_key;
