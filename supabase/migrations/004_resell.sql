-- ============================================================
-- PHASE 3 — Resell Google Sheet sync tables
-- ============================================================

CREATE TABLE resell_inventory (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ext_key              text UNIQUE NOT NULL,
  description          text NOT NULL,
  purchase_date        date,
  purchase_location    text,
  cost_of_goods        numeric(10,2),
  category             text,
  special_designation  text,
  date_listed          date,
  days_active          int,
  item_type            text,
  date_sold            date,
  sold_price           numeric(10,2),
  platform_sold        text,
  fees                 numeric(10,2),
  promoted_fees        numeric(10,2),
  shipping_provider    text,
  shipping_cost        numeric(10,2),
  net_profit           numeric(10,2),
  adjusted_net_profit  numeric(10,2),
  raw                  jsonb,
  synced_at            timestamptz DEFAULT now()
);
CREATE INDEX ON resell_inventory (date_sold);
CREATE INDEX ON resell_inventory (purchase_date);
CREATE INDEX ON resell_inventory (category);

CREATE TABLE resell_expenses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ext_key      text UNIQUE NOT NULL,
  description  text NOT NULL,
  expense_date date,
  amount       numeric(10,2),
  notes        text,
  raw          jsonb,
  synced_at    timestamptz DEFAULT now()
);
CREATE INDEX ON resell_expenses (expense_date);

CREATE TABLE resell_mileage (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ext_key     text UNIQUE NOT NULL,
  log_date    date,
  purpose     text,
  total_miles numeric(8,2),
  notes       text,
  raw         jsonb,
  synced_at   timestamptz DEFAULT now()
);
CREATE INDEX ON resell_mileage (log_date);

ALTER TABLE resell_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE resell_expenses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE resell_mileage   ENABLE ROW LEVEL SECURITY;
