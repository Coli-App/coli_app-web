export interface SportItem {
  id: number;
  name: string;
}

export interface SpaceSchedule {
  id?: number;
  day: string; // "Lunes", "Martes", "Miércoles", etc.
  time_start: string | null;
  time_end: string | null;
  closed: boolean;
}

export interface SpaceResponse {
  id: number;
  name: string;
  state: string;
  ubication: string;
  description: string | null;
  capacity: number;
  imageUrl?: string;
  sports: SportItem[];
  schedule?: SpaceSchedule[];
}
