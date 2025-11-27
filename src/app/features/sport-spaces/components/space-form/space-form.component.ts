import { SportsService } from '@features/sport-spaces/services/sports.service';
import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CreateSportSpace } from '@features/sport-spaces/models/create-sport-space';
import { AvailableSport } from '@features/sport-spaces/models/available.sport';
import { SportSpacesService } from '@features/sport-spaces/services/sport-spaces.service';
import { FilePickerComponent } from '@core/shared/components/atoms/file-picker/file-picker.component';
import { ScheduleDto } from '@features/sport-spaces/models/schedule.dto';
import { ScheduleModalComponent } from '../schedule-modal/schedule-modal.component';

export interface SpaceFormData {
  mode: 'create' | 'edit';
  space?: {
    id: number;
    name: string;
    ubication: string;
    description: string;
    capacity: number;
    state: string;
    sports: any[];
    imageUrl?: string;
  };
}

@Component({
  selector: 'app-space-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    FilePickerComponent,
  ],
  templateUrl: './space-form.component.html',
  styleUrl: './space-form.component.scss',
})
export class SpaceFormComponent implements OnInit {
  @ViewChild(FilePickerComponent) filePicker!: FilePickerComponent;

  private readonly dialogRef = inject(MatDialogRef<SpaceFormComponent>);
  readonly data = inject<SpaceFormData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);

  spaceForm!: FormGroup;
  loading = signal(false);
  selectedFile: File | null = null;
  availableSports = signal<AvailableSport[]>([]);
  schedule: ScheduleDto[] = [];
  scheduleConfigured = signal(false);

  constructor(private sportsService: SportsService, private spacesService: SportSpacesService) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSports();
    
    if (this.data.mode === 'edit' && this.data.space) {
      this.loadSpaceData();
    }
  }

  loadSports(): void {
    this.sportsService.getSportsList().subscribe({
      next: (sports: AvailableSport[]) => {
        this.availableSports.set(sports);
      },
      error: (err) => {
        console.error('Error al obtener los deportes:', err);
      },
    });
  }

  private loadSpaceData(): void {
    const space = this.data.space!;
    
    this.spaceForm.patchValue({
      name: space.name,
      location: space.ubication,
      description: space.description,
      capacity: space.capacity,
      state: space.state === 'Activo',
      sportIds: space.sports.map((s: any) => s.id),
    });

    // En modo edición, la imagen no es requerida
    this.spaceForm.get('image')?.clearValidators();
    this.spaceForm.get('image')?.updateValueAndValidity();
  }

  private initForm(): void {
    this.spaceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      location: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      capacity: ['', [Validators.required, Validators.min(1)]],
      image: ['', Validators.required],
      state: [true, Validators.required],
      sportIds: [[], Validators.required],
    });

    this.spaceForm.get('state')!.valueChanges.subscribe((value) => {
      console.log(value ? 'Activo' : 'Inactivo');
    });
  }

  onSubmit(): void {
    // En modo edición, el archivo y el schedule son opcionales
    const isEdit = this.data.mode === 'edit';
    
    if (this.spaceForm.invalid) {
      this.spaceForm.markAllAsTouched();
      return;
    }

    if (!isEdit && !this.selectedFile) {
      alert('Debes seleccionar una imagen');
      return;
    }

    if (!isEdit && this.schedule.length === 0) {
      alert('Debes definir el horario del espacio deportivo');
      return;
    }

    this.loading.set(true);
    const formValue = this.spaceForm.value;

    if (isEdit) {
      // Modo edición
      const updateDto: any = {
        name: formValue.name,
        ubication: formValue.location,
        description: formValue.description,
        capacity: Number(formValue.capacity),
        state: formValue.state ? "Activo" : "Inactivo",
        sports: formValue.sportIds.map((id: string) => Number(id)),
      };

      this.spacesService.updateSpace(this.data.space!.id, updateDto).subscribe({
        next: (resp) => {
          this.loading.set(false);
          this.dialogRef.close({ success: true, data: resp });
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Error actualizando espacio', err);
        },
      });
    } else {
      // Modo creación
      const dto: CreateSportSpace = {
        name: formValue.name,
        ubication: formValue.location,
        description: formValue.description,
        capacity: Number(formValue.capacity),
        state: formValue.state ? "Activo" : "Inactivo",
        sports: formValue.sportIds.map((id: string) => Number(id)),
        schedule: this.schedule,
      };

      this.spacesService.createSpace(dto, this.selectedFile!).subscribe({
        next: (resp) => {
          this.loading.set(false);
          this.dialogRef.close({ success: true, data: resp });
        },
        error: (err) => {
          this.loading.set(false);
          console.error('Error creando espacio', err);
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.spaceForm.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (control.errors['min']) {
      return `El valor mínimo es ${control.errors['min'].min}`;
    }

    return '';
  }

  // File Upload Methods
  onFileSelected(file: File): void {
    this.selectedFile = file;
    this.spaceForm.patchValue({ image: file });
    this.spaceForm.get('image')?.markAsTouched();
  }

  onFileRemoved(): void {
    this.selectedFile = null;
    this.spaceForm.patchValue({ image: '' });
    this.spaceForm.get('image')?.markAsTouched();
  }

  // Schedule Methods
  openScheduleModal(): void {
    const dialogRef = this.dialog.open(ScheduleModalComponent, {
      width: '700px',
      data: this.schedule,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result: ScheduleDto[]) => {
      if (result && result.length > 0) {
        this.schedule = result;
        this.scheduleConfigured.set(true);
        console.log('📅 Horario configurado:', this.schedule);
      }
    });
  }

  getScheduleSummary(): string {
    if (this.schedule.length === 0) {
      return 'No configurado';
    }
    return `${this.schedule.length} día(s) configurado(s)`;
  }
}
