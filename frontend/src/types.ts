export interface Parcel {
  id: number;
  parcel_number: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  area?: number;
  status?: string;
  building_count?: number;
  buildings?: BuildingSummary[];
}

export interface BuildingSummary {
  id: number;
  building_code: string;
  height?: number;
  floors?: number;
  building_type?: string;
  ai_confidence?: number;
  status?: string;
}

export interface Building extends BuildingSummary {
  parcel_id?: number;
  footprint?: any;
  parcel?: { id: number; parcel_number: string; location?: string; area?: number } | null;
  floor_details?: FloorInfo[];
}

export interface FloorInfo {
  id: number;
  floor_number: number;
  height?: number;
  units_count?: number;
  units?: UnitInfo[];
}

export interface UnitInfo {
  id: number;
  unit_number: string;
  area?: number;
  property_type?: string;
  owner_status?: string;
}

export interface Hierarchy {
  parcel: Parcel | null;
  building: Building;
  floors: FloorInfo[];
}

export interface UlpinRecord {
  id: number;
  ulpin_code: string;
  country?: string;
  state?: string;
  city?: string;
  parcel_id?: number;
  building_id?: number;
  floor_id?: number;
  unit_id?: number;
}

export interface InfraItem {
  id: number;
  infrastructure_id: string;
  type?: string;
  depth?: number;
  status?: string;
  owner?: string;
  conflict_status?: string;
}

export interface DashboardStats {
  parcels: number;
  buildings: number;
  ulpins: number;
  infrastructure: number;
  avg_confidence: number;
  total_area: number;
  avg_height: number;
  by_type: { name: string; value: number }[];
  by_status: { name: string; value: number }[];
  recent_jobs: { id: number; file_name?: string; status?: string; confidence?: number }[];
}
