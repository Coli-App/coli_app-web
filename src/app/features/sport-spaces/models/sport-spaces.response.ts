import { AvailableSport } from "./available.sport";

export interface SportSpacesResponse {
  id: string;
  name: string;
  state: string;
  ubication: string;
  description: string;
  capacity: number;
  imageUrl: string;
  sports: AvailableSport[];
}
