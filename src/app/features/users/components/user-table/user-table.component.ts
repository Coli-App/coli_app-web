import { ChangeDetectionStrategy, Component, Input, computed, signal, inject, Output, EventEmitter, input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { UserService } from '@features/users/services/user.service';
import { UserState } from '@app/state/UserState';

import { ConfirmDeleteDialogComponent, ConfirmDeleteData } from '@core/shared/components/atoms/confirm-delete-dialog/confirm-delete-dialog.component';
import { UserFormComponent, UserFormData } from '../user-form/user-form.component';
import { UserViewComponent, UserViewData } from '../user-view/user-view.component';

interface User {
  id?: string;
  nombre: string;
  correo: string;
  rol: 'Administrador' | 'Entrenador' | 'Estudiante' | 'Personal de Bienestar';
  fechaRegistro: string;
  iniciales: string;
}

@Component({
  selector: 'app-user-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule
  ],
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserTableComponent implements OnDestroy {
  searchTerm = input<string>('');
  @Output() userUpdated = new EventEmitter<User[]>();
  private destroy$ = new Subject<void>();

  private userService = inject(UserService);
  private userState = inject(UserState);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  displayedColumns: string[] = ['usuario', 'correo', 'rol', 'fechaRegistro', 'acciones'];

  users = signal<User[]>([]);

  constructor() {
    this.loadUsers();
  }

  filteredUsers = computed(() =>
    this.users().filter(u => {
      const term = this.searchTerm().toLowerCase();
      return (
        u.nombre.toLowerCase().includes(term) ||
        u.correo.toLowerCase().includes(term)
      );
    })
  );

  loadUsers() {
    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          const mappedUsers = users.map(user => ({
            id: user.id,
            nombre: user.name,
            correo: user.email,
            rol: this.mapRoleToLocal(user.rol),
            fechaRegistro: new Date().toLocaleDateString('es-ES'),
            iniciales: this.getInitials(user.name)
          }));
          this.users.set(mappedUsers);
          this.userUpdated.emit(mappedUsers);
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.snackBar.open('Error al cargar usuarios', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  private mapRoleToLocal(role: string): 'Administrador' | 'Entrenador' | 'Estudiante' | 'Personal de Bienestar' {
    const roleMap: { [key: string]: 'Administrador' | 'Entrenador' | 'Estudiante' | 'Personal de Bienestar' } = {
      'admin': 'Administrador',
      'student': 'Estudiante',
      'trainer': 'Entrenador',
      'user': 'Estudiante',
      'moderator': 'Personal de Bienestar'
    };
    return roleMap[role] || 'Estudiante';
  }

  private mapRoleToAPI(role: string): string {
    const roleMap: { [key: string]: string } = {
      'Administrador': 'admin',
      'Estudiante': 'student',
      'Entrenador': 'trainer',
      'Personal de Bienestar': 'moderator'
    };
    return roleMap[role] || 'student';
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  editUser(user: User) {
    if (!user.id) {
      this.snackBar.open('Error: ID de usuario no disponible', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '500px',
      maxWidth: '95vw',
      disableClose: true,
      autoFocus: true,
      panelClass: 'custom-dialog-container',
      data: {
        mode: 'edit',
        user: {
          id: user.id,
          name: user.nombre,
          email: user.correo,
          role: this.mapRoleToAPI(user.rol)
        }
      } as UserFormData
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result && result.updated) {
          console.log('Usuario actualizado exitosamente, recargando tabla...');
          this.loadUsers();
        } else {
          console.log('No se realizaron cambios o se canceló la operación');
        }
      });
  }

  deleteUser(user: User) {
    if (this.isCurrentUser(user)) {
      this.snackBar.open('No puedes eliminar tu propio usuario', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: {
        title: '¿Eliminar usuario?',
        itemName: user.nombre,
        itemDescription: user.correo,
      } as ConfirmDeleteData
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result === true && user.id) {
          this.userService.deleteUser(user.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.snackBar.open(`Usuario ${user.nombre} eliminado exitosamente`, 'Cerrar', {
                  duration: 3000,
                  panelClass: ['success-snackbar']
                });
                this.loadUsers();
              },
              error: (error) => {
                console.error('Error deleting user:', error);
                this.snackBar.open('Error al eliminar el usuario', 'Cerrar', {
                  duration: 3000,
                  panelClass: ['error-snackbar']
                });
              }
            });
        }
      });
  }

  viewUser(user: User) {
    if (!user.id) {
      this.snackBar.open('Error: ID de usuario no disponible', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.dialog.open(UserViewComponent, {
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'user-view-dialog-panel',
      data: {
        userId: user.id
      } as UserViewData
    });
  }

  reloadUsers() {
    this.loadUsers();
  }

  getUsersData() {
    return this.users();
  }

  isCurrentUser(user: User): boolean {
    return user.id === this.userState.userId();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
