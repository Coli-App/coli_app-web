import { SportsService } from '@features/sport-spaces/services/sports.service';
import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
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

export interface SpaceFormData {
  mode: 'create' | 'edit';
  space?: any;
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
  private readonly data = inject<SpaceFormData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  spaceForm!: FormGroup;
  loading = signal(false);
  selectedFile: File | null = null;
  availableSports = signal<AvailableSport[]>([]);

  constructor(private sportsService: SportsService, private spacesService: SportSpacesService) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSports();
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
    if (this.spaceForm.invalid || !this.selectedFile) {
      this.spaceForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const formValue = this.spaceForm.value;

    const dto: CreateSportSpace = {
      name: formValue.name,
      ubication: formValue.location,
      description: formValue.description,
      capacity: formValue.capacity,
      state: formValue.state ? "Activo" : "Inactivo",
      sports: formValue.sportIds,
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
}
