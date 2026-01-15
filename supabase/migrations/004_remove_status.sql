-- Migration: Remove status column from stores
-- This column was redundant and not needed for the audit workflow

-- Drop the status column
ALTER TABLE stores DROP COLUMN IF EXISTS status;

-- Drop the status type if it exists
DROP TYPE IF EXISTS store_status;
