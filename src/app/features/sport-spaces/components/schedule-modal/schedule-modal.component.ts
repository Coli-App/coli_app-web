import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ScheduleDto } from '@features/sport-spaces/models/schedule.dto';

interface DaySchedule {
  day: number;
  dayName: string;
  selected: boolean;
  time_start: string;
  time_end: string;
}

@Component({
  selector: 'app-schedule-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './schedule-modal.component.html',
  styleUrl: './schedule-modal.component.scss',
})
export class ScheduleModalComponent {
  private readonly dialogRef = inject(MatDialogRef<ScheduleModalComponent>);
  private readonly data = inject<ScheduleDto[]>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  scheduleForm!: FormGroup;

  // Backend format: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
  daysOfWeek: DaySchedule[] = [
    { day: 1, dayName: 'Lunes', selected: false, time_start: '08:00', time_end: '20:00' },
    { day: 2, dayName: 'Martes', selected: false, time_start: '08:00', time_end: '20:00' },
    { day: 3, dayName: 'Miércoles', selected: false, time_start: '08:00', time_end: '20:00' },
    { day: 4, dayName: 'Jueves', selected: false, time_start: '08:00', time_end: '20:00' },
    { day: 5, dayName: 'Viernes', selected: false, time_start: '08:00', time_end: '20:00' },
    { day: 6, dayName: 'Sábado', selected: false, time_start: '08:00', time_end: '14:00' },
    { day: 0, dayName: 'Domingo', selected: false, time_start: '08:00', time_end: '14:00' },
  ];

  constructor() {
    this.initForm();
    this.loadExistingSchedule();
  }

  private initForm(): void {
    this.scheduleForm = this.fb.group({
      days: this.fb.array([]),
    });

    this.daysOfWeek.forEach((day) => {
      this.daysArray.push(
        this.fb.group({
          day: [day.day],
          dayName: [day.dayName],
          selected: [day.selected],
          time_start: [day.time_start, Validators.required],
          time_end: [day.time_end, Validators.required],
        })
      );
    });
  }

  private loadExistingSchedule(): void {
    if (this.data && this.data.length > 0) {
      this.data.forEach((schedule) => {
        const dayIndex = this.daysArray.controls.findIndex(
          (control) => control.get('day')?.value === schedule.day
        );
        if (dayIndex !== -1) {
          this.daysArray.at(dayIndex).patchValue({
            selected: true,
            time_start: schedule.time_start,
            time_end: schedule.time_end,
          });
        }
      });
    }
  }

  get daysArray(): FormArray {
    return this.scheduleForm.get('days') as FormArray;
  }

  onToggleDay(index: number): void {
    const dayControl = this.daysArray.at(index);
    const currentSelected = dayControl.get('selected')?.value;
    dayControl.patchValue({ selected: !currentSelected });
  }

  isFormValid(): boolean {
    const hasSelectedDay = this.daysArray.controls.some(
      (control) => control.get('selected')?.value === true
    );

    if (!hasSelectedDay) {
      return false;
    }

    // Validar que los días seleccionados tengan horarios válidos
    const selectedDays = this.daysArray.controls.filter(
      (control) => control.get('selected')?.value === true
    );

    return selectedDays.every((control) => {
      const timeStart = control.get('time_start')?.value;
      const timeEnd = control.get('time_end')?.value;
      return timeStart && timeEnd && timeStart < timeEnd;
    });
  }

  onSave(): void {
    if (!this.isFormValid()) {
      return;
    }

    const selectedSchedules: ScheduleDto[] = this.daysArray.controls
      .filter((control) => control.get('selected')?.value === true)
      .map((control) => ({
        day: control.get('day')?.value,
        time_start: control.get('time_start')?.value,
        time_end: control.get('time_end')?.value,
      }));

    this.dialogRef.close(selectedSchedules);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getSelectedDaysCount(): number {
    return this.daysArray.controls.filter(
      (control) => control.get('selected')?.value === true
    ).length;
  }
}
