import { AvailableSport } from "./available.sport";

export interface SportSpace {
  id: string;
  name: string;
  status: 'Activo' | 'Inactivo';
  location: string;
  capacity: number;
  availableSports: AvailableSport[];
}
