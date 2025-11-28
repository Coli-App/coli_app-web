import { AvailableSport } from "./available.sport";

export interface SportSpaceCard {
  id: number;
  name: string;
  ubication: string;
  description: string;
  capacity: number;
  imageUrl: string;
  state: boolean;
  sports: AvailableSport[];
}
