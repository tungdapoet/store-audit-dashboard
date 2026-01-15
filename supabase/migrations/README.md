# Supabase Database Setup

## Quick Setup

Run these SQL migrations in your Supabase SQL Editor in order:

1. **001_initial_schema.sql** - Creates tables, indexes, triggers, RLS policies
2. **002_seed_stores.sql** - Seeds 43 initial stores
3. **003_storage_bucket.sql** - Creates the photo storage bucket

## Manual Steps in Supabase Dashboard

### 1. Run Migrations

Go to **SQL Editor** and run each migration file in order.

### 2. Verify Tables Created

Go to **Table Editor** and confirm these tables exist:
- `stores` (43 rows after seeding)
- `locations` (empty initially)
- `location_data` (empty initially)
- `photos` (empty initially)

### 3. Verify Storage Bucket

Go to **Storage** and confirm `store-audit-photos` bucket exists.

If not created via SQL, create manually:
- Name: `store-audit-photos`
- Public: Yes
- File size limit: 10MB
- Allowed types: image/jpeg, image/png, image/webp

### 4. Environment Variables

The app uses these (already configured in `utils/supabase/info.tsx`):

```
SUPABASE_PROJECT_ID=voihbkrgjampupxalyup
SUPABASE_ANON_KEY=<your-anon-key>
```

## Schema Overview

```
stores
├── id (uuid, PK)
├── name, location, address
├── floor_plan_url
├── manager, phone
├── status (pending | in_progress | complete)
├── last_edited_by
└── created_at, updated_at

locations (floor plan markers)
├── id (uuid, PK)
├── store_id (FK → stores)
├── name
├── x, y (0-100 percentage)
└── created_at, updated_at

location_data (measurements)
├── id (uuid, PK)
├── location_id (FK → locations)
├── measurement_type (mirror_door | column)
├── measurements (JSONB)
├── notes
├── last_audit_date, last_install_date
├── last_edited_by
└── created_at, updated_at

photos
├── id (uuid, PK)
├── location_id (FK → locations)
├── type (audit | install)
├── storage_path, thumbnail_path
├── uploaded_by
└── uploaded_at
```

## Storage Structure

```
store-audit-photos/
└── {store_id}/
    ├── floor-plan.webp
    └── {location_id}/
        ├── audit/
        │   ├── {photo_id}.webp
        │   └── {photo_id}_thumb.webp
        └── install/
            ├── {photo_id}.webp
            └── {photo_id}_thumb.webp
```
