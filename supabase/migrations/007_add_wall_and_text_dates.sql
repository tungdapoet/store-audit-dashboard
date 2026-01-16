-- Migration: Update measurement_type to include 'wall'
-- The original schema only had 'mirror_door' and 'column'

-- Drop the old constraint and add the new one
ALTER TABLE location_data 
  DROP CONSTRAINT IF EXISTS location_data_measurement_type_check;

ALTER TABLE location_data 
  ADD CONSTRAINT location_data_measurement_type_check 
  CHECK (measurement_type IN ('mirror_door', 'column', 'wall'));

-- Also update date columns to TEXT for free text input
-- (Original was DATE type which is more restrictive)
ALTER TABLE location_data 
  ALTER COLUMN last_audit_date TYPE TEXT USING last_audit_date::TEXT;

ALTER TABLE location_data 
  ALTER COLUMN last_install_date TYPE TEXT USING last_install_date::TEXT;

SELECT 'Migration complete: wall type added, date fields changed to text' as status;
