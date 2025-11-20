import { ChangeDetectionStrategy, Component, inject, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UserService } from '@features/users/services/user.service';
import { CreateUser } from '@features/users/models/create.user';
import { UpdateUser } from '@features/users/models/update.user';

export interface UserFormData {
  mode: 'create' | 'edit';
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

@Component({
  selector: 'app-user-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent {
  isLoading = signal(false);
  userForm: FormGroup;
  isEditMode: boolean;
  userId?: string;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserFormData
  ) {
    this.isEditMode = data?.mode === 'edit';
    this.userId = data?.user?.id;

    const passwordValidators = this.isEditMode
      ? [Validators.minLength(6)]
      : [Validators.required, Validators.minLength(6)];

    this.userForm = this.fb.group({
      name: [data?.user?.name || '', [Validators.required, Validators.minLength(2)]],
      email: [data?.user?.email || '', [Validators.required, Validators.email]],
      password: ['', passwordValidators],
      role: [data?.user?.role || '', [Validators.required]],
    });
  }

  roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'student', label: 'Estudiante' },
    { value: 'trainer', label: 'Entrenador' },
  ];

  onSubmit() {
    if (this.userForm.valid && !this.isLoading()) {
      this.isLoading.set(true);

      if (this.isEditMode && this.userId) {
        const updateData: UpdateUser = {};
        let hasChanges = false;

        const formValue = this.userForm.value;

        if (formValue.name && formValue.name.trim() !== this.data.user?.name) {
          updateData.name = formValue.name.trim();
          hasChanges = true;
        }

        if (formValue.email && formValue.email.trim() !== this.data.user?.email) {
          updateData.email = formValue.email.trim();
          hasChanges = true;
        }

        if (formValue.rol && formValue.rol !== this.data.user?.role) {
          updateData.rol = formValue.rol;
          hasChanges = true;
        }

        if (formValue.password && formValue.password.trim() !== '') {
          updateData.password = formValue.password.trim();
          hasChanges = true;
        }

        if (hasChanges) {
          console.log('Datos a actualizar:', updateData);
          this.userService.updateUser(this.userId, updateData).subscribe({
            next: (response) => {
              this.isLoading.set(false);
              this.snackBar.open('Usuario actualizado exitosamente', 'Cerrar', {
                duration: 3000,
                panelClass: ['success-snackbar'],
              });
              this.dialogRef.close({ updated: true, data: response });
            },
            error: (error) => {
              this.isLoading.set(false);
              console.error('Error updating user:', error);
              this.snackBar.open('Error al actualizar el usuario', 'Cerrar', {
                duration: 3000,
                panelClass: ['error-snackbar'],
              });
            },
          });
        } else {
          this.isLoading.set(false);
          this.snackBar.open('No se detectaron cambios', 'Cerrar', {
            duration: 2000,
            panelClass: ['info-snackbar'],
          });
          this.dialogRef.close(null);
        }
      } else {
        const userData: CreateUser = this.userForm.value;

        this.userService.createUser(userData).subscribe({
          next: (response) => {
            this.isLoading.set(false);
            this.snackBar.open('Usuario creado exitosamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            this.dialogRef.close(response);
          },
          error: (error) => {
            this.isLoading.set(false);
            console.error('Error creating user:', error);
            this.snackBar.open('Error al crear el usuario', 'Cerrar', {
              duration: 3000,
              panelClass: ['error-snackbar'],
            });
          },
        });
      }
    } else {
      Object.keys(this.userForm.controls).forEach((key) => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  getErrorMessage(field: string): string {
    const control = this.userForm.get(field);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(field)} es requerido`;
    }
    if (control?.hasError('email')) {
      return 'Ingresa un email válido';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength']?.requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    return '';
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario';
  }

  get submitButtonText(): string {
    if (this.isLoading()) {
      return this.isEditMode ? '' : '';
    }
    return this.isEditMode ? 'Actualizar Usuario' : 'Crear Usuario';
  }

  get submitButtonIcon(): string {
    return this.isEditMode ? 'save' : 'add';
  }

  private getFieldLabel(field: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nombre',
      email: 'Email',
      password: 'Contraseña',
      rol: 'Rol',
    };
    return labels[field] || field;
  }
}
