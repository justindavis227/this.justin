-- ============================================================
-- Spaces tree model — replace nav_group string grouping with
-- explicit parent_slug hierarchy. Adds Work + Personal as real
-- top-level rows, hoists Resell + Build alongside them, removes
-- Sourcing as a child, adds Listings under Resell.
-- ============================================================

-- Top-level parents (Work + Personal new; Resell + Build hoisted)
INSERT INTO spaces (slug, label, parent_slug, icon, sort_order) VALUES
  ('work',     'Work',     NULL, 'Briefcase', 1),
  ('personal', 'Personal', NULL, 'User',      2)
ON CONFLICT (slug) DO UPDATE
  SET label = EXCLUDED.label,
      icon = EXCLUDED.icon,
      sort_order = EXCLUDED.sort_order,
      parent_slug = NULL;

UPDATE spaces SET sort_order = 3, parent_slug = NULL WHERE slug = 'resell';
UPDATE spaces SET sort_order = 4, parent_slug = NULL WHERE slug = 'build';

-- Re-home the leaves onto their parents
UPDATE spaces SET parent_slug = 'work',     sort_order = 1 WHERE slug = 'southeast';
UPDATE spaces SET parent_slug = 'work',     sort_order = 2 WHERE slug = 'students';
UPDATE spaces SET parent_slug = 'personal', sort_order = 1 WHERE slug = 'family';
UPDATE spaces SET parent_slug = 'personal', sort_order = 2 WHERE slug = 'finance';
UPDATE spaces SET parent_slug = 'personal', sort_order = 3 WHERE slug = 'journal';
UPDATE spaces SET parent_slug = 'personal', sort_order = 4 WHERE slug = 'health';

-- Add Listings under Resell
INSERT INTO spaces (slug, label, parent_slug, icon, sort_order) VALUES
  ('listings', 'Listings', 'resell', 'Tag', 1)
ON CONFLICT (slug) DO UPDATE
  SET label = EXCLUDED.label,
      parent_slug = EXCLUDED.parent_slug,
      icon = EXCLUDED.icon,
      sort_order = EXCLUDED.sort_order;

-- Retire nav_group (column kept for backward compat; values cleared)
UPDATE spaces SET nav_group = NULL;
