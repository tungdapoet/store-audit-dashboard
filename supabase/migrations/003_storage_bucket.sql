-- ============================================
-- Store Audit Dashboard - Storage Bucket Setup
-- Migration: 003_storage_bucket.sql
-- Date: 2026-01-15
-- ============================================

-- Create storage bucket for photos
-- Note: Run this in Supabase SQL Editor or via Dashboard
-- Storage bucket creation requires elevated privileges

-- Insert bucket configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-audit-photos',
  'store-audit-photos',
  true,
  10485760, -- 10MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to photos (read-only for viewing)
CREATE POLICY "Public read access for photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-audit-photos');

-- Allow authenticated uploads (using anon key for internal tool)
CREATE POLICY "Allow uploads to store-audit-photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'store-audit-photos');

-- Allow updates (replacing photos)
CREATE POLICY "Allow updates to store-audit-photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'store-audit-photos');

-- Allow deletes
CREATE POLICY "Allow deletes from store-audit-photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'store-audit-photos');
