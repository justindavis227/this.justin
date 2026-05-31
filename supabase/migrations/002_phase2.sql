-- ============================================================
-- PHASE 2 — habits, macros, reminders, briefings, vector RPC
-- ============================================================

-- ============================================================
-- HABITS (definitions)
-- ============================================================
CREATE TABLE habits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,
  label           text NOT NULL,
  cadence         text NOT NULL DEFAULT 'daily',
  target_per_week int,
  active          boolean DEFAULT true,
  sort_order      int DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- HABIT LOG (one row per habit per completed day)
CREATE TABLE habit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_slug  text NOT NULL REFERENCES habits(slug) ON DELETE CASCADE,
  log_date    date NOT NULL,
  done        boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (habit_slug, log_date)
);
CREATE INDEX ON habit_log (log_date);
CREATE INDEX ON habit_log (habit_slug);

-- Seed default habits
INSERT INTO habits (slug, label, cadence, target_per_week, sort_order) VALUES
  ('read-scripture', 'Read scripture', 'daily',   7, 1),
  ('train',          'Train / workout', '3x-week', 3, 2),
  ('pray',           'Pray',            'daily',   7, 3);

-- ============================================================
-- MACRO ENTRIES (per-meal logs)
-- ============================================================
CREATE TABLE macro_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date    date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  calories    int,
  protein_g   int,
  carbs_g     int,
  fat_g       int,
  raw         jsonb,
  llm_source  text,
  created_at  timestamptz DEFAULT now()
);
CREATE INDEX ON macro_entries (log_date);

-- ============================================================
-- REMINDERS (from Apple Reminders via macOS sync)
-- ============================================================
CREATE TABLE reminders (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ext_id      text UNIQUE,
  title       text NOT NULL,
  due_at      timestamptz,
  completed   boolean DEFAULT false,
  list_name   text,
  raw         jsonb,
  synced_at   timestamptz DEFAULT now()
);
CREATE INDEX ON reminders (due_at);
CREATE INDEX ON reminders (completed);

-- ============================================================
-- BRIEFINGS (daily morning briefing cache)
-- ============================================================
CREATE TABLE briefings (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_date date NOT NULL UNIQUE,
  body          text NOT NULL,
  facts         jsonb,
  created_at    timestamptz DEFAULT now()
);

-- ============================================================
-- match_memory_chunks — pgvector similarity RPC
-- ============================================================
CREATE OR REPLACE FUNCTION match_memory_chunks(
  query_embedding vector(1536),
  match_count int DEFAULT 10,
  filter_space text DEFAULT NULL
)
RETURNS TABLE (
  id          uuid,
  source_type text,
  source_id   uuid,
  space_slug  text,
  text        text,
  created_at  timestamptz,
  similarity  float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    mc.id,
    mc.source_type,
    mc.source_id,
    mc.space_slug,
    mc.text,
    mc.created_at,
    1 - (mc.embedding <=> query_embedding) AS similarity
  FROM memory_chunks mc
  WHERE filter_space IS NULL OR mc.space_slug = filter_space
  ORDER BY mc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ============================================================
-- RLS — deny anon, service role bypasses
-- ============================================================
ALTER TABLE habits         ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE macro_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings      ENABLE ROW LEVEL SECURITY;
