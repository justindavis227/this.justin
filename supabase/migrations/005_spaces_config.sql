-- ============================================================
-- PHASE 3 — Spaces configurator: hidden/attn/nav_group + icon backfill
-- ============================================================

ALTER TABLE spaces ADD COLUMN hidden    boolean DEFAULT false;
ALTER TABLE spaces ADD COLUMN attn      boolean DEFAULT false;
ALTER TABLE spaces ADD COLUMN nav_group text;

-- Backfill nav_group + icon + sort_order to match the existing hardcoded sidebar
UPDATE spaces SET nav_group = 'Work',     icon = 'MapPin',        sort_order = 1 WHERE slug = 'southeast';
UPDATE spaces SET nav_group = 'Work',     icon = 'GraduationCap', sort_order = 2, attn = true WHERE slug = 'students';
UPDATE spaces SET nav_group = 'Personal', icon = 'Users',         sort_order = 1 WHERE slug = 'family';
UPDATE spaces SET nav_group = 'Personal', icon = 'Wallet',        sort_order = 2 WHERE slug = 'finance';
UPDATE spaces SET nav_group = 'Personal', icon = 'BookOpen',      sort_order = 3 WHERE slug = 'journal';
UPDATE spaces SET nav_group = 'Personal', icon = 'Heart',         sort_order = 4 WHERE slug = 'health';
UPDATE spaces SET nav_group = 'Resell',   icon = 'Tags',          sort_order = 1 WHERE slug = 'resell';
UPDATE spaces SET nav_group = 'Build',    icon = 'Hammer',        sort_order = 1 WHERE slug = 'build';
