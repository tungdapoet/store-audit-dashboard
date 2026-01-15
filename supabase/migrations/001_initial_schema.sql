-- ============================================
-- Store Audit Dashboard - Initial Schema
-- Migration: 001_initial_schema.sql
-- Date: 2026-01-15
-- ============================================

-- ============================================
-- STORES
-- ============================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  floor_plan_url TEXT,
  manager TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'complete')),
  last_edited_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOCATIONS (floor plan markers)
-- ============================================
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  x NUMERIC NOT NULL CHECK (x >= 0 AND x <= 100),
  y NUMERIC NOT NULL CHECK (y >= 0 AND y <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locations_store_id ON locations(store_id);

-- ============================================
-- LOCATION DATA (measurements)
-- ============================================
CREATE TABLE IF NOT EXISTS location_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  measurement_type TEXT NOT NULL CHECK (measurement_type IN ('mirror_door', 'column')),
  measurements JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  last_audit_date DATE,
  last_install_date DATE,
  last_edited_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_location_data_location_id ON location_data(location_id);

-- ============================================
-- PHOTOS
-- ============================================
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('audit', 'install')),
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT NOT NULL,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photos_location_id ON photos(location_id);
CREATE INDEX IF NOT EXISTS idx_photos_type ON photos(type);

-- ============================================
-- TRIGGERS: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stores_updated_at ON stores;
CREATE TRIGGER stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS locations_updated_at ON locations;
CREATE TRIGGER locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS location_data_updated_at ON location_data;
CREATE TRIGGER location_data_updated_at
  BEFORE UPDATE ON location_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS: Disabled for internal tool
-- Allow all operations (Retool handles access)
-- ============================================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all stores" ON stores;
DROP POLICY IF EXISTS "Allow all locations" ON locations;
DROP POLICY IF EXISTS "Allow all location_data" ON location_data;
DROP POLICY IF EXISTS "Allow all photos" ON photos;

-- Create permissive policies
CREATE POLICY "Allow all stores" ON stores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all locations" ON locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all location_data" ON location_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all photos" ON photos FOR ALL USING (true) WITH CHECK (true);
