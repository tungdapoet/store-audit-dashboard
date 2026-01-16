// ============================================
// Store Audit Dashboard - Type Definitions
// ============================================

// Database Types
export interface Store {
  id: string;
  name: string;
  location: string;
  address: string;
  floor_plan_url: string | null;
  manager: string | null;
  phone: string | null;
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
  measurement_type: 'mirror_door' | 'column' | 'wall';
  measurements: MirrorDoorMeasurement | ColumnMeasurement | WallMeasurement;
  notes: string | null;
  last_audit_date: string | null;
  last_install_date: string | null;
  last_edited_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MirrorDoorMeasurement {
  type: 'mirror_door';
  top: string;
  bottom: string;
}

export interface ColumnMeasurement {
  type: 'column';
  frontBack: string;
  sides: string;
}

export interface WallMeasurement {
  type: 'wall';
  description: string;
}

export type Measurement = MirrorDoorMeasurement | ColumnMeasurement | WallMeasurement;

export interface Photo {
  id: string;
  location_id: string;
  type: 'audit' | 'install' | 'brief';
  storage_path: string;
  thumbnail_path: string;
  uploaded_by: string | null;
  uploaded_at: string;
}

// UI State Types
export type TabType = 'floor-plan' | 'locations' | 'summary';

export interface AppState {
  selectedStoreId: string | null;
  activeTab: TabType;
  isEditMode: boolean;
}

// Form Types
export interface StoreFormData {
  name: string;
  location: string;
  address: string;
  manager?: string;
  phone?: string;
}

export interface LocationFormData {
  name: string;
  x: number;
  y: number;
}

export interface MeasurementFormData {
  measurement_type: 'mirror_door' | 'column' | 'wall';
  measurements: Measurement;
  notes?: string;
  last_audit_date?: string;
  last_install_date?: string;
}

// Utility Types
export type PhotoType = Photo['type'];
export type MeasurementType = LocationData['measurement_type'];

// Location with optional data (for joined queries)
export interface LocationWithData extends Location {
  location_data?: LocationData | null;
  photos?: Photo[];
}

// Store with stats (computed)
export interface StoreWithStats extends Store {
  total_locations: number;
  completed_locations: number;
}
