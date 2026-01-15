# How to Add Your Own Data

## Quick Start Guide

Replace the mock data in `/src/app/App.tsx` (starting at line 7) with your actual data.

---

## 1. STORE DATA

Replace `mockStores` array with your stores:

```javascript
const mockStores = [
  {
    id: '1',                              // Unique ID for this store
    name: 'Your Store Name',              // Store name
    location: 'City, State',              // Short location
    address: 'Full Street Address',       // Complete address
    totalLocations: 8,                    // Number of locations in this store
    lastAuditDate: 'Jan 5, 2026',        // Last audit date (any format)
    status: 'completed',                  // 'completed', 'in-progress', or 'pending'
    floorPlanUrl: 'https://your-image-url.com/floorplan.jpg',  // Floor plan image URL
    manager: 'Manager Name',              // Store manager name
    phone: '(555) 555-5555',             // Contact phone
  },
  // Add more stores...
];
```

---

## 2. LOCATION MARKERS (Floor Plan Positions)

Replace `mockLocations` array with marker positions on your floor plan:

```javascript
const mockLocations = [
  { 
    id: 'loc1',              // Must match ID in mockLocationsData
    name: 'Entrance Display', // Location name
    x: 25,                   // X position on floor plan (0-100, percentage)
    y: 30                    // Y position on floor plan (0-100, percentage)
  },
  // Add more locations...
];
```

**Finding X/Y positions:**
- X and Y are percentages (0-100)
- x: 0 = left edge, 100 = right edge
- y: 0 = top edge, 100 = bottom edge
- Example: x: 50, y: 50 = center of floor plan

---

## 3. LOCATION DATA (Measurements & Photos)

Replace `mockLocationsData` array with your location details:

### For MIRROR DOOR locations:

```javascript
{
  id: 'loc1',                          // Must match ID in mockLocations
  name: 'Entrance Display',            // Location name
  measurements: { 
    type: 'mirror-door',               // Type: 'mirror-door'
    top: 3000,                         // Top measurement in mm
    bottom: 2800                       // Bottom measurement in mm
  },
  auditPhotos: [
    'https://your-image-host.com/audit1.jpg',
    'https://your-image-host.com/audit2.jpg',
  ],
  installPhotos: [
    'https://your-image-host.com/install1.jpg',
    'https://your-image-host.com/install2.jpg',
  ],
  lastAuditDate: 'Jan 5, 2026',       // Last audit date
  lastInstallDate: 'Dec 15, 2025',    // Last installation date
  notes: 'Any notes about this location',
}
```

### For COLUMN locations:

```javascript
{
  id: 'loc2',
  name: 'Back Wall Column',
  measurements: { 
    type: 'column',                    // Type: 'column'
    frontBack: 2400,                   // Front/Back measurement in mm
    sides: 1200                        // Sides measurement in mm
  },
  auditPhotos: ['https://...'],
  installPhotos: ['https://...'],
  lastAuditDate: 'Jan 5, 2026',
  lastInstallDate: 'Dec 15, 2025',
  notes: 'Column at back wall',
}
```

---

## 4. PHOTO HOSTING OPTIONS

### Option A: Free Image Hosting (Quick Start)
1. **Imgur** (https://imgur.com)
   - Upload images
   - Right-click image → "Copy image address"
   - Use that URL

2. **Cloudinary** (https://cloudinary.com)
   - Free tier available
   - Better for production use

### Option B: Your Own Server
- Upload images to your web server
- Use full URLs: `https://yourdomain.com/images/photo.jpg`

### Option C: Cloud Storage
- **AWS S3**: Upload to S3 bucket (make public)
- **Google Cloud Storage**: Similar to S3
- **Azure Blob Storage**: Similar to S3

---

## 5. EXAMPLE: Complete Data for One Store

```javascript
// In /src/app/App.tsx

const mockStores = [
  {
    id: 'store-001',
    name: 'Main Street Location',
    location: 'Portland, OR',
    address: '123 Main St, Portland, OR 97201',
    totalLocations: 3,
    lastAuditDate: 'Jan 8, 2026',
    status: 'completed',
    floorPlanUrl: 'https://i.imgur.com/your-floorplan.jpg',
    manager: 'Jane Doe',
    phone: '(503) 555-1234',
  },
];

const mockLocations = [
  { id: 'loc-001', name: 'Front Door', x: 20, y: 15 },
  { id: 'loc-002', name: 'Back Wall', x: 80, y: 60 },
  { id: 'loc-003', name: 'Side Column', x: 50, y: 50 },
];

const mockLocationsData = [
  {
    id: 'loc-001',
    name: 'Front Door',
    measurements: { 
      type: 'mirror-door',
      top: 2000,
      bottom: 1900
    },
    auditPhotos: [
      'https://i.imgur.com/audit-photo-1.jpg',
      'https://i.imgur.com/audit-photo-2.jpg',
    ],
    installPhotos: [
      'https://i.imgur.com/install-photo-1.jpg',
    ],
    lastAuditDate: 'Jan 8, 2026',
    lastInstallDate: 'Dec 20, 2025',
    notes: 'Main entrance mirror door. Clean condition.',
  },
  {
    id: 'loc-002',
    name: 'Back Wall',
    measurements: { 
      type: 'mirror-door',
      top: 2500,
      bottom: 2500
    },
    auditPhotos: ['https://i.imgur.com/audit-back.jpg'],
    installPhotos: ['https://i.imgur.com/install-back.jpg'],
    lastAuditDate: 'Jan 8, 2026',
    lastInstallDate: 'Dec 20, 2025',
    notes: 'Back wall display.',
  },
  {
    id: 'loc-003',
    name: 'Side Column',
    measurements: { 
      type: 'column',
      frontBack: 3000,
      sides: 1500
    },
    auditPhotos: ['https://i.imgur.com/audit-column.jpg'],
    installPhotos: ['https://i.imgur.com/install-column.jpg'],
    lastAuditDate: 'Jan 8, 2026',
    lastInstallDate: 'Dec 20, 2025',
    notes: 'Center column display.',
  },
];
```

---

## 6. TESTING YOUR DATA

After updating:
1. Save the file
2. The app will automatically reload
3. Check that:
   - All stores appear in the sidebar
   - Store details load correctly
   - Floor plan shows with markers
   - Clicking markers shows location details
   - Photos load properly

---

## 7. TROUBLESHOOTING

**Photos not loading?**
- Make sure URLs are publicly accessible
- Check that URLs start with `http://` or `https://`
- Test URL by opening it in a new browser tab

**Markers not appearing on floor plan?**
- Check that location IDs match between `mockLocations` and `mockLocationsData`
- Verify X/Y values are between 0-100

**Location details not showing?**
- Ensure `id` in `mockLocations` matches `id` in `mockLocationsData`
- Check for typos in the `type` field (must be exactly 'mirror-door' or 'column')

---

## Need Help?

The application is currently using sample data. You can test with this data first to understand the structure, then replace it with your own when ready.
