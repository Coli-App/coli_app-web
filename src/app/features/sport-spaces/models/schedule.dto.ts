export interface ScheduleDto {
  day: number; // 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
  time_start: string; // Formato HH:MM (ej: "08:00")
  time_end: string; // Formato HH:MM (ej: "20:00")
}
