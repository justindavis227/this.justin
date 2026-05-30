-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- SPACES
-- ============================================================
CREATE TABLE spaces (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  label       text NOT NULL,
  parent_slug text REFERENCES spaces(slug),
  icon        text,
  sort_order  int DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- Seed default spaces
INSERT INTO spaces (slug, label, sort_order) VALUES
  ('students',  'Students',  1),
  ('southeast', 'Southeast', 2),
  ('family',    'Family',    3),
  ('finance',   'Finance',   4),
  ('journal',   'Journal',   5),
  ('health',    'Health',    6),
  ('resell',    'Resell',    7),
  ('build',     'Build',     8);

-- ============================================================
-- CAPTURES
-- ============================================================
CREATE TABLE captures (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source          text NOT NULL,
  raw_text        text,
  audio_url       text,
  classification  jsonb,
  llm_source      text,
  routed_to       text,
  routed_id       uuid,
  created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE tasks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title           text NOT NULL,
  description     text,
  space_slug      text REFERENCES spaces(slug),
  tier            text NOT NULL DEFAULT 'someday',
  is_key          boolean DEFAULT false,
  priority_score  int DEFAULT 0,
  tags            text[],
  due_date        date,
  completed_at    timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX ON tasks (tier, completed_at);
CREATE INDEX ON tasks (space_slug);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text,
  space_slug  text REFERENCES spaces(slug),
  status      text DEFAULT 'active',
  pct         int DEFAULT 0,
  meta        text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ============================================================
-- DAILY LOGS
-- ============================================================
CREATE TABLE daily_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date   date NOT NULL,
  notes      jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (log_date)
);

-- ============================================================
-- GOALS
-- ============================================================
CREATE TABLE goals (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope      text NOT NULL,
  text       text NOT NULL,
  done       boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- NOTES
-- ============================================================
CREATE TABLE notes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_slug text REFERENCES spaces(slug),
  body       text NOT NULL,
  tags       text[],
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- MEMORY CHUNKS (vector store)
-- ============================================================
CREATE TABLE memory_chunks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL,
  source_id   uuid,
  space_slug  text,
  text        text NOT NULL,
  embedding   vector(1536),
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX ON memory_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================
-- CALENDAR EVENTS
-- ============================================================
CREATE TABLE calendar_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ext_id      text UNIQUE,
  source      text NOT NULL,
  title       text NOT NULL,
  start_at    timestamptz,
  end_at      timestamptz,
  all_day     boolean DEFAULT false,
  location    text,
  is_reminder boolean DEFAULT false,
  raw         jsonb,
  synced_at   timestamptz DEFAULT now()
);

CREATE INDEX ON calendar_events (start_at);
CREATE INDEX ON calendar_events (source);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action        text NOT NULL,
  resource_type text,
  resource_id   uuid,
  metadata      jsonb,
  created_at    timestamptz DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY — deny all anon; service role bypasses
-- ============================================================
ALTER TABLE spaces         ENABLE ROW LEVEL SECURITY;
ALTER TABLE captures       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_chunks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log      ENABLE ROW LEVEL SECURITY;

-- No policies added: anonymous access denied by default.
-- Service role key (SUPABASE_SERVICE_ROLE_KEY) bypasses RLS.
