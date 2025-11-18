import { SportsService } from './../../services/sports.service';
import { Component, inject, signal, OnInit } from '@angular/core';
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
    MatProgressSpinnerModule
  ],
  templateUrl: './space-form.component.html',
  styleUrl: './space-form.component.scss'
})
export class SpaceFormComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<SpaceFormComponent>);
  private readonly data = inject<SpaceFormData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  spaceForm!: FormGroup;
  loading = signal(false);
  imagePreview = signal<string | null>(null);
  isDragOver = false;
  selectedFile: File | null = null;
  availableSports = signal<AvailableSport[]>([]);

  constructor (private sportsService: SportsService) {}

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
      }
    })
  }

  private initForm(): void {
    this.spaceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      location: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      capacity: ['', [Validators.required, Validators.min(1)]],
      imageUrl: ['', Validators.required],
      isActive: [true],
      sportIds: [[], Validators.required]
    });
  }

  onSubmit(): void {
    if (this.spaceForm.invalid) {
      this.spaceForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const formValue = this.spaceForm.value;
    const spaceData: CreateSportSpace = {
      name: formValue.name,
      location: formValue.location,
      description: formValue.description,
      capacity: formValue.capacity,
      image: formValue.imageUrl,
      isActive: formValue.isActive,
      sportIds: formValue.sportIds
    };

    setTimeout(() => {
      this.loading.set(false);
      this.dialogRef.close({ success: true, data: spaceData });
    }, 1000);
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
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.imagePreview.set(result);
      this.spaceForm.patchValue({ imageUrl: result });
      this.spaceForm.get('imageUrl')?.markAsTouched();
    };
    reader.readAsDataURL(file);
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.selectedFile = null;
    this.imagePreview.set(null);
    this.spaceForm.patchValue({ imageUrl: '' });
  }
}
