-- Migration: Add 'brief' photo type
-- Updates the photos table to allow 'brief' as a photo type

-- Drop the old constraint and add the new one
ALTER TABLE photos 
  DROP CONSTRAINT IF EXISTS photos_type_check;

ALTER TABLE photos 
  ADD CONSTRAINT photos_type_check 
  CHECK (type IN ('audit', 'install', 'brief'));

SELECT 'Migration complete: brief photo type added' as status;
