ALTER TABLE knowledge_items ADD COLUMN IF NOT EXISTS title TEXT;
UPDATE knowledge_items SET title = substring(content from 1 for 40) WHERE title IS NULL;
