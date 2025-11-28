export interface BookingResponse {
  id: number;
  id_creator: string;
  date: string;
  time_start: string;
  time_end: string;
  espacio_id: number;
  people_number: number;
  created_at?: string;
  updated_at?: string;
}
