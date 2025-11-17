export interface SportSpaceCard {
  id: string;
  name: string;
  location: string;
  description: string;
  capacity: number;
  imageUrl: string;
  isActive: boolean;
  sports: string[];
}
