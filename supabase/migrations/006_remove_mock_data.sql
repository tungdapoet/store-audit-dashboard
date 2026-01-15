-- Migration: Remove all mock/seed data
-- Run this to clear all test data before production use

-- Delete in order to respect foreign key constraints
DELETE FROM photos;
DELETE FROM location_data;
DELETE FROM locations;
DELETE FROM stores;

-- Verify cleanup
SELECT 'Cleanup complete' as status,
  (SELECT COUNT(*) FROM stores) as stores_count,
  (SELECT COUNT(*) FROM locations) as locations_count,
  (SELECT COUNT(*) FROM location_data) as location_data_count,
  (SELECT COUNT(*) FROM photos) as photos_count;
