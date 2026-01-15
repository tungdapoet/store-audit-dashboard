-- Migration: Add 'wall' measurement type
-- This adds the Wall option to location types

-- The measurement_type column already uses TEXT, so no schema change needed
-- The JSONB measurements column already handles flexible structures
-- This migration just documents the new type for reference

-- Example wall measurement structure:
-- {
--   "type": "wall",
--   "description": "Free text description of wall"
-- }

-- Note: If you had a CHECK constraint on measurement_type, you would need:
-- ALTER TABLE location_data 
--   DROP CONSTRAINT IF EXISTS location_data_measurement_type_check;
-- ALTER TABLE location_data 
--   ADD CONSTRAINT location_data_measurement_type_check 
--   CHECK (measurement_type IN ('mirror_door', 'column', 'wall'));

-- No actual schema changes required since we use flexible TEXT/JSONB types
SELECT 'Wall measurement type added - no schema changes needed' as status;
