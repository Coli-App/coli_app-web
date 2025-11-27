import { ScheduleDto } from './schedule.dto';

export interface CreateSportSpace {
  name: string;
  ubication: string;
  description: string;
  capacity: number;
  state: string;
  sports: number[]; 
  schedule: ScheduleDto[]; 
}
