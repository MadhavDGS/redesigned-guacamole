-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Claims table
CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  village TEXT,
  state TEXT,
  status TEXT,
  area_ha NUMERIC,
  geom geometry(Polygon, 4326)
);
CREATE INDEX IF NOT EXISTS idx_claims_geom ON claims USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_claims_state ON claims (state);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims (status);

-- Assets table (points or polygons)
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  claim_id TEXT REFERENCES claims(id) ON DELETE SET NULL,
  type TEXT,
  properties JSONB,
  geom geometry(Geometry, 4326)
);
CREATE INDEX IF NOT EXISTS idx_assets_geom ON assets USING GIST (geom);

-- Boundaries (admin boundaries)
CREATE TABLE IF NOT EXISTS boundaries (
  id TEXT PRIMARY KEY,
  name TEXT,
  level TEXT, -- state/district/block/village
  parent_id TEXT,
  geom geometry(Geometry, 4326)
);
CREATE INDEX IF NOT EXISTS idx_boundaries_geom ON boundaries USING GIST (geom);

-- Seed sample claim
INSERT INTO claims (id, village, state, status, area_ha, geom)
VALUES (
  'IFR-001',
  'Sample Village',
  'Madhya Pradesh',
  'approved',
  1.5,
  ST_GeomFromText('POLYGON((80.1 23.1,80.2 23.1,80.2 23.2,80.1 23.2,80.1 23.1))', 4326)
) ON CONFLICT (id) DO NOTHING;