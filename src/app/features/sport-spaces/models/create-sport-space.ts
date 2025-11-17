export interface CreateSportSpace {
  name: string;
  location: string;
  description: string;
  capacity: number;
  image: File;
  isActive: boolean;
  sportIds: string[];
}
