-- ============================================================
-- Allow multiple rows per ext_id (one per occurrence date)
-- EventKit returns the same calendarItemExternalIdentifier for every
-- instance of a recurring event, so the old UNIQUE(ext_id) collapsed
-- a 22-day daily event into a single row.
-- ============================================================

ALTER TABLE calendar_events DROP CONSTRAINT calendar_events_ext_id_key;

ALTER TABLE calendar_events
  ADD COLUMN start_date date
  GENERATED ALWAYS AS ((start_at AT TIME ZONE 'UTC')::date) STORED;

CREATE UNIQUE INDEX calendar_events_ext_id_start_date_idx
  ON calendar_events (ext_id, start_date);
