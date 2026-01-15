# Store Audit Dashboard - Design Document

> **Date:** 2026-01-15  
> **Status:** Approved  
> **Stack:** Vite + React + Supabase + shadcn/ui + Tailwind

---

## Overview

A modern Store Audit Dashboard for internal teams to manage store floor plans, location measurements, and audit photos. The app will be embedded in Retool for access control.

### Key Decisions

| Aspect       | Decision                                              |
| ------------ | ----------------------------------------------------- |
| Users        | 40 internal team members, equal access                |
| Auth         | None in app - Retool handles access, password unlocks edit mode |
| UI Style     | Modern Dashboard (Vercel/Stripe aesthetic)            |
| Stack        | Vite + React (keep current foundation)                |
| UI Library   | shadcn/ui + Tailwind (consolidate from MUI mix)       |
| Backend      | Direct Supabase (no Edge Functions middleware)        |
| Real-time    | Light - "last edited by" + conflict warnings          |
| Photos       | Heavy (10k+), Supabase Storage with client-side compression |
| Offline      | Not needed                                            |

---

## Database Schema

```sql
-- ============================================
-- STORES
-- ============================================
CREATE TABLE stores (
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
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  x NUMERIC NOT NULL CHECK (x >= 0 AND x <= 100),
  y NUMERIC NOT NULL CHECK (y >= 0 AND y <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_locations_store_id ON locations(store_id);

-- ============================================
-- LOCATION DATA (measurements)
-- ============================================
CREATE TABLE location_data (
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

CREATE UNIQUE INDEX idx_location_data_location_id ON location_data(location_id);

-- ============================================
-- PHOTOS
-- ============================================
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('audit', 'install')),
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT NOT NULL,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photos_location_id ON photos(location_id);
CREATE INDEX idx_photos_type ON photos(type);

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

CREATE TRIGGER stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER location_data_updated_at
  BEFORE UPDATE ON location_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS: Disabled (internal tool, Retool handles access)
-- ============================================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Allow all operations (no auth)
CREATE POLICY "Allow all" ON stores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON location_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON photos FOR ALL USING (true) WITH CHECK (true);
```

### Measurement JSONB Structures

```typescript
// Mirror Door
{
  "type": "mirror_door",
  "top": 150,      // mm
  "bottom": 145    // mm
}

// Column
{
  "type": "column",
  "frontBack": 200,  // mm
  "sides": 180       // mm
}
```

---

## Storage Structure

```
Supabase Storage Bucket: store-audit-photos
└── {store_id}/
    ├── floor-plan.webp
    └── {location_id}/
        ├── audit/
        │   ├── {photo_id}.webp        (full size, ~500KB)
        │   └── {photo_id}_thumb.webp  (thumbnail, ~30KB)
        └── install/
            ├── {photo_id}.webp
            └── {photo_id}_thumb.webp
```

### Photo Upload Pipeline

```
User selects/captures photo
         │
         ▼
┌─────────────────────────────┐
│  Client-side Processing     │
│  • Resize to max 1920px     │
│  • Convert to WebP          │
│  • Compress (quality 80%)   │
│  • Generate 200px thumbnail │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Upload to Supabase         │
│  • Full image → Storage     │
│  • Thumbnail → Storage      │
│  • Metadata → photos table  │
└─────────────────────────────┘
```

**Libraries:**
- `browser-image-compression` - resize & compress
- Canvas API - WebP conversion & thumbnails

---

## Frontend Architecture

```
src/
├── app/
│   ├── App.tsx                    -- Main layout, routing state
│   └── providers.tsx              -- QueryClient, Toaster, ThemeProvider
│
├── components/
│   ├── ui/                        -- shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── sidebar.tsx            -- Store list sidebar
│   │   ├── header.tsx             -- Top bar with edit toggle
│   │   └── main-content.tsx       -- Content wrapper
│   │
│   ├── stores/
│   │   ├── store-list.tsx         -- Sidebar store list
│   │   ├── store-card.tsx         -- Individual store item
│   │   ├── store-detail.tsx       -- Main detail view
│   │   ├── store-form.tsx         -- Add/edit store dialog
│   │   └── store-summary.tsx      -- Stats & export
│   │
│   ├── floor-plan/
│   │   ├── floor-plan-viewer.tsx  -- Canvas with markers
│   │   ├── floor-plan-marker.tsx  -- Individual marker
│   │   ├── floor-plan-upload.tsx  -- Upload component
│   │   └── floor-plan-editor.tsx  -- Edit mode wrapper
│   │
│   ├── locations/
│   │   ├── location-list.tsx      -- List of locations
│   │   ├── location-detail.tsx    -- Measurements & photos
│   │   ├── location-form.tsx      -- Edit measurements
│   │   └── measurement-input.tsx  -- Mirror-door/Column inputs
│   │
│   └── photos/
│       ├── photo-grid.tsx         -- Thumbnail grid
│       ├── photo-uploader.tsx     -- Upload with compression
│       ├── photo-lightbox.tsx     -- Full-screen viewer
│       └── photo-card.tsx         -- Individual thumbnail
│
├── hooks/
│   ├── use-stores.ts              -- Stores CRUD + queries
│   ├── use-locations.ts           -- Locations CRUD
│   ├── use-location-data.ts       -- Measurements CRUD
│   ├── use-photos.ts              -- Photos CRUD + upload
│   ├── use-edit-mode.ts           -- Password unlock state
│   └── use-conflict-warning.ts    -- "Last edited by" checks
│
├── lib/
│   ├── supabase.ts                -- Supabase client singleton
│   ├── image-processing.ts        -- Compress, resize, thumbnail
│   ├── constants.ts               -- App constants
│   └── utils.ts                   -- Helpers (cn, formatDate, etc.)
│
└── types/
    └── index.ts                   -- All TypeScript interfaces
```

### Key Patterns

- **React Query (TanStack Query)** - Server state management
- **Custom hooks** - All Supabase operations abstracted
- **Feature colocation** - Components grouped by domain
- **shadcn/ui** - Consistent, customizable primitives

---

## UI/UX Design System

### Color Palette (Dark Mode Default)

```css
:root {
  --background: 224 71% 4%;       /* #09090b - Near black */
  --foreground: 213 31% 91%;      /* #e4e4e7 - Light gray */
  --card: 224 71% 6%;             /* #0f0f12 - Card background */
  --card-foreground: 213 31% 91%;
  --primary: 210 100% 52%;        /* #2196f3 - Blue accent */
  --primary-foreground: 0 0% 100%;
  --secondary: 215 20% 16%;       /* #1e2433 - Secondary bg */
  --muted: 215 20% 65%;           /* #9ca3af - Muted text */
  --muted-foreground: 215 20% 65%;
  --accent: 215 20% 16%;
  --destructive: 0 84% 60%;       /* #ef4444 - Red */
  --border: 215 20% 20%;          /* #2d3748 - Borders */
  --ring: 210 100% 52%;           /* Focus ring */
  
  /* Status colors */
  --status-complete: 142 76% 36%; /* #22c55e - Green */
  --status-progress: 38 92% 50%;  /* #f59e0b - Amber */
  --status-pending: 0 84% 60%;    /* #ef4444 - Red */
}
```

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: Store Name | Status Badge | Edit Toggle | Actions     │
├────────────┬────────────────────────────────────────────────────┤
│            │                                                    │
│  Sidebar   │   Main Content Area                               │
│  (280px)   │                                                    │
│            │   ┌──────────────────────────────────────────────┐ │
│  Search    │   │  Tabs: Floor Plan | Locations | Summary      │ │
│  ─────     │   ├──────────────────────────────────────────────┤ │
│            │   │                                              │ │
│  Store 1   │   │     Active Tab Content                       │ │
│  Store 2   │   │                                              │ │
│  Store 3   │   │                                              │ │
│  ...       │   │                                              │ │
│            │   └──────────────────────────────────────────────┘ │
│  + Add     │                                                    │
│            │                                                    │
└────────────┴────────────────────────────────────────────────────┘
```

### Component Styling

```tsx
// Cards
className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-4"

// Primary Button
className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-2 transition-colors duration-150"

// Status Badges
const statusStyles = {
  complete: "bg-green-500/20 text-green-400 border-green-500/30",
  in_progress: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  pending: "bg-red-500/20 text-red-400 border-red-500/30",
};

// Input
className="bg-secondary border-border focus:ring-2 focus:ring-ring rounded-lg"
```

### Micro-interactions

- Skeleton loaders while fetching data
- Smooth tab transitions (150ms fade + slide)
- Toast notifications (sonner) bottom-right
- Marker pulse animation on floor plan hover
- Image zoom transition on lightbox open
- Button hover/active states (scale 0.98)

### Typography

```css
font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* Headings */
.heading-1 { @apply text-2xl font-semibold tracking-tight; }
.heading-2 { @apply text-xl font-semibold tracking-tight; }
.heading-3 { @apply text-lg font-medium; }

/* Body */
.body { @apply text-sm text-foreground; }
.body-muted { @apply text-sm text-muted; }
```

---

## Data Flow

### State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Query (TanStack)                       │
│  • All Supabase data (stores, locations, photos)                │
│  • Automatic caching with 30s staleTime                         │
│  • Background refetch on window focus                           │
│  • Optimistic updates for instant feedback                      │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    Local State (useState)                       │
│  • UI state: selectedStoreId, activeTab, openDialogs            │
│  • Edit mode: isEditMode (password unlocked)                    │
│  • Form state: controlled inputs                                │
└─────────────────────────────────────────────────────────────────┘
```

### Query Pattern

```typescript
// hooks/use-stores.ts
export function useStores() {
  return useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (store: Partial<Store> & { id: string }) => {
      const { data, error } = await supabase
        .from('stores')
        .update({ ...store, updated_at: new Date().toISOString() })
        .eq('id', store.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}
```

### Conflict Warning System

```
User A opens Store                User B opens Store
        │                                  │
        ▼                                  ▼
  Fetch: updated_at = T1            Fetch: updated_at = T1
        │                                  │
        ▼                                  │
  Edit & Save                              │
  updated_at = T2                          │
        │                                  ▼
        │                            Attempts Save
        │                                  │
        │                    ┌─────────────┴─────────────┐
        │                    │ Pre-save check:           │
        │                    │ Fetch current updated_at  │
        │                    │ T2 !== T1 → CONFLICT!     │
        │                    └─────────────┬─────────────┘
        │                                  │
        │                                  ▼
        │                    ┌─────────────────────────────┐
        │                    │ Dialog:                     │
        │                    │ "Store was edited by        │
        │                    │  [name] 2 minutes ago"      │
        │                    │                             │
        │                    │ [Overwrite] [Refresh] [Cancel]
        │                    └─────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Database & Infrastructure

```
1.1 Create Supabase tables
    - Run SQL schema (stores, locations, location_data, photos)
    - Create indexes and triggers
    - Set up RLS policies (allow all)

1.2 Create Storage bucket
    - Create "store-audit-photos" bucket
    - Set public access policy

1.3 Seed initial data
    - Migrate mock stores to database
    - Verify data integrity
```

### Phase 2: Frontend Foundation

```
2.1 Clean up dependencies
    - Remove @mui/* packages
    - Remove unused Radix duplicates
    - Install: @tanstack/react-query, browser-image-compression
    - Keep: shadcn/ui, tailwindcss, lucide-react, sonner

2.2 Configure design system
    - Update tailwind.config with dark theme colors
    - Set up CSS variables in globals.css
    - Configure Inter font

2.3 Set up providers
    - QueryClientProvider
    - Toaster (sonner)
    - ThemeProvider (dark mode)

2.4 Create Supabase hooks
    - useStores (list, create, update, delete)
    - useLocations (by store)
    - useLocationData (by location)
    - usePhotos (by location, upload)

2.5 Build layout shell
    - Sidebar component (280px fixed)
    - Header component
    - Main content wrapper
```

### Phase 3: Stores Feature

```
3.1 Store list (sidebar)
    - Search input with filtering
    - Store cards with status badge
    - Selected state styling
    - Skeleton loading state

3.2 Store detail view
    - Header with store info
    - Status badge (colored)
    - Edit toggle button
    - Tab navigation

3.3 Store CRUD
    - Add store dialog
    - Edit store form
    - Delete confirmation
    - Connect to Supabase hooks

3.4 Metadata display
    - Last edited by
    - Updated timestamp
    - Manager/phone info
```

### Phase 4: Floor Plan Feature

```
4.1 Floor plan viewer
    - Image display (responsive)
    - Zoom controls (optional)
    - Empty state with upload prompt

4.2 Floor plan upload
    - File input (image/*)
    - URL paste support
    - Upload to Supabase Storage
    - Compress before upload

4.3 Marker system
    - Render markers at x,y positions
    - Marker component with label
    - Click to select location
    - Pulse animation on hover

4.4 Edit mode interactions
    - Click to add marker
    - Drag to reposition
    - Right-click/long-press to delete
    - Rename dialog
```

### Phase 5: Locations & Measurements

```
5.1 Location list
    - List all markers for store
    - Click to view details
    - Status indicators

5.2 Location detail panel
    - Display measurements
    - Display photos (grid)
    - Notes section
    - Audit/install dates

5.3 Measurement forms
    - Mirror-door: top, bottom (mm)
    - Column: frontBack, sides (mm)
    - Type selector
    - Validation

5.4 Connect to Supabase
    - useLocationData hook
    - Optimistic updates
    - Error handling
```

### Phase 6: Photo System

```
6.1 Image processing library
    - compressImage(file) → WebP, max 1920px
    - generateThumbnail(file) → 200px WebP
    - Async processing with progress

6.2 Photo uploader
    - File input (multiple)
    - Camera capture (mobile)
    - Drag & drop zone
    - Progress indicator
    - Upload to Supabase Storage

6.3 Photo grid
    - Thumbnail display
    - Lazy loading (intersection observer)
    - Delete button (edit mode)
    - Click to open lightbox

6.4 Lightbox viewer
    - Full-screen overlay
    - Navigation (prev/next)
    - Keyboard support (arrows, escape)
    - Zoom (optional)
```

### Phase 7: Polish

```
7.1 Edit mode system
    - Password dialog
    - Unlock state (sessionStorage)
    - Lock on close/timeout
    - Visual indicator when unlocked

7.2 Conflict warnings
    - Track updated_at on fetch
    - Pre-save conflict check
    - Warning dialog with options
    - Refresh functionality

7.3 Loading & error states
    - Skeleton components
    - Error boundaries
    - Toast notifications
    - Retry mechanisms

7.4 Final integration
    - Retool embed testing
    - Cross-browser testing
    - Performance optimization
    - Bug fixes
```

---

## TypeScript Interfaces

```typescript
// types/index.ts

export interface Store {
  id: string;
  name: string;
  location: string;
  address: string;
  floor_plan_url: string | null;
  manager: string | null;
  phone: string | null;
  status: 'pending' | 'in_progress' | 'complete';
  last_edited_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  store_id: string;
  name: string;
  x: number;
  y: number;
  created_at: string;
  updated_at: string;
}

export interface LocationData {
  id: string;
  location_id: string;
  measurement_type: 'mirror_door' | 'column';
  measurements: MirrorDoorMeasurement | ColumnMeasurement;
  notes: string | null;
  last_audit_date: string | null;
  last_install_date: string | null;
  last_edited_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MirrorDoorMeasurement {
  type: 'mirror_door';
  top: number;
  bottom: number;
}

export interface ColumnMeasurement {
  type: 'column';
  frontBack: number;
  sides: number;
}

export interface Photo {
  id: string;
  location_id: string;
  type: 'audit' | 'install';
  storage_path: string;
  thumbnail_path: string;
  uploaded_by: string | null;
  uploaded_at: string;
}

// UI State
export interface AppState {
  selectedStoreId: string | null;
  activeTab: 'floor-plan' | 'locations' | 'summary';
  isEditMode: boolean;
}
```

---

## Dependencies

### To Remove
```json
{
  "@emotion/react": "remove",
  "@emotion/styled": "remove",
  "@mui/icons-material": "remove",
  "@mui/material": "remove"
}
```

### To Add
```json
{
  "@tanstack/react-query": "^5.x",
  "browser-image-compression": "^2.x"
}
```

### To Keep
```json
{
  "@supabase/supabase-js": "^2.90.1",
  "@radix-ui/*": "keep",
  "tailwindcss": "^4.1",
  "lucide-react": "keep",
  "sonner": "keep",
  "react-hook-form": "keep",
  "clsx": "keep",
  "tailwind-merge": "keep"
}
```

---

## Success Criteria

- [ ] All CRUD operations work with Supabase
- [ ] Photos upload with compression (<500KB full, <30KB thumb)
- [ ] Edit mode requires password
- [ ] Conflict warnings appear when data changed
- [ ] UI matches Modern Dashboard aesthetic
- [ ] Loads fast (<2s initial, <500ms navigation)
- [ ] Works embedded in Retool
- [ ] No console errors in production
