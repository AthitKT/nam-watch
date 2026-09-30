-- 0001_initial_schema.sql

CREATE TABLE areas (
  id TEXT PRIMARY KEY,
  name_th TEXT NOT NULL,
  name_en TEXT,
  province TEXT NOT NULL CHECK (province IN ('BKK', 'PTT')),
  type TEXT NOT NULL CHECK (type IN ('khet', 'amphoe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stations (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  name TEXT NOT NULL,
  agency TEXT,
  type TEXT NOT NULL CHECK (type IN ('river', 'canal', 'watergate')),
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  area_id TEXT REFERENCES areas(id) ON DELETE SET NULL,
  bank_level DOUBLE PRECISION,
  warning_level DOUBLE PRECISION,
  critical_level DOUBLE PRECISION,
  unit TEXT NOT NULL DEFAULT 'm',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for area_id to fast-fetch stations by area
CREATE INDEX idx_stations_area_id ON stations(area_id);

CREATE TABLE readings (
  station_id TEXT REFERENCES stations(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL,
  level DOUBLE PRECISION,
  level_out DOUBLE PRECISION, -- primarily for watergate stations (gate_out)
  situation_level INTEGER,    -- the original 1-5 level from ThaiWater
  unit TEXT NOT NULL DEFAULT 'm',
  quality TEXT,
  PRIMARY KEY (station_id, ts)
);

-- Hypertable-like index for time-series queries
CREATE INDEX idx_readings_ts ON readings(ts DESC);

-- View to get the latest reading per station quickly
CREATE OR REPLACE VIEW latest_readings AS
SELECT DISTINCT ON (station_id)
  station_id,
  ts,
  level,
  level_out,
  situation_level,
  unit,
  quality
FROM readings
ORDER BY station_id, ts DESC;
