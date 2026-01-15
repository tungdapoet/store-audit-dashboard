// App Constants

// Edit mode password
export const EDIT_PASSWORD = 'edit123';

// Supabase
export const SUPABASE_PROJECT_ID = 'voihbkrgjampupxalyup';

// UI Constants
export const SIDEBAR_WIDTH = 280;
export const HEADER_HEIGHT = 64;

// Status options
export const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
] as const;

// Measurement types (Location Types)
export const MEASUREMENT_TYPES = [
  { value: 'column', label: 'Column' },
  { value: 'mirror_door', label: 'Mirror Door' },
  { value: 'wall', label: 'Wall' },
] as const;

// Photo types
export const PHOTO_TYPES = [
  { value: 'audit', label: 'Audit Photos' },
  { value: 'install', label: 'Install Photos' },
] as const;

// Default measurement values
export const DEFAULT_MIRROR_DOOR = {
  type: 'mirror_door' as const,
  top: '',
  bottom: '',
};

export const DEFAULT_COLUMN = {
  type: 'column' as const,
  frontBack: '',
  sides: '',
};

export const DEFAULT_WALL = {
  type: 'wall' as const,
  description: '',
};

// Stale time for React Query (30 seconds)
export const QUERY_STALE_TIME = 30_000;
