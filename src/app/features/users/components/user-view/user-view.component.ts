import { Component, Inject, signal, type OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import type { UserResponse } from '@features/users/models/user.response';
import { UserService } from '@features/users/services/user.service';

export interface UserViewData {
  userId: string;
}

@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
  ],
  templateUrl: './user-view.component.html',
  styleUrl: './user-view.component.scss',
})
export class UserViewComponent implements OnInit {
  user = signal<UserResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private readonly dialogRef: MatDialogRef<UserViewComponent>,
    @Inject(MAT_DIALOG_DATA) private readonly data: UserViewData,
    private readonly userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getUserById(this.data.userId).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.error.set('Error al cargar los datos del usuario');
        this.loading.set(false);
      },
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      admin: 'Administrador',
      student: 'Estudiante',
      trainer: 'Entrenador',
    };
    return roleNames[role] || role;
  }
}
