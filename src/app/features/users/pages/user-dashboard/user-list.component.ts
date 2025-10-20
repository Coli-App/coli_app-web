import { ChangeDetectionStrategy, Component, computed, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UserFormComponent } from '@features/users/components/user-form/user-form.component';
import { UserTableComponent } from '@features/users/components/user-table/user-table.component';
import { UserCardComponent } from '@features/users/components/user-card/user-card.component';

interface UserStats {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
}

@Component({
  selector: 'app-user-list',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    UserTableComponent,
    UserCardComponent,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  @ViewChild(UserTableComponent) userTable!: UserTableComponent;
  
  constructor(private dialog: MatDialog, private snackBar: MatSnackBar) {}

  value = signal('');
  usersData = signal<any[]>([]);

  stats = computed<UserStats[]>(() => {
    const users = this.usersData();
    const totalUsers = users.length;
    const totalEstudiantes = users.filter(u => u.rol === 'Estudiante').length;
    const totalEntrenadores = users.filter(u => u.rol === 'Entrenador').length;
    const totalAdministradores = users.filter(u => u.rol === 'Administrador').length;
    
    return [
      {
        title: 'Total Usuarios',
        value: totalUsers,
        subtitle: 'Usuarios registrados',
        icon: 'group'
      },
      {
        title: 'Estudiantes',
        value: totalEstudiantes,
        subtitle: totalUsers > 0 ? `${Math.round((totalEstudiantes / totalUsers) * 100)}% del total` : '0% del total',
        icon: 'school'
      },
      {
        title: 'Entrenadores',
        value: totalEntrenadores,
        subtitle: 'Personal de entrenamiento',
        icon: 'fitness_center'
      },
      {
        title: 'Administradores',
        value: totalAdministradores,
        subtitle: 'Staff administrativo',
        icon: 'admin_panel_settings'
      }
    ];
  });

  clearSearch() {
    this.value.set('');
  }

  createUser() {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '500px',
      maxWidth: '95vw',
      disableClose: true,
      autoFocus: true,
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Usuario creado:', result);
        if (this.userTable) {
          this.userTable.reloadUsers();
        }
        this.snackBar.open('Usuario creado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  onUserUpdated() {
    if (this.userTable) {
      this.usersData.set(this.userTable.getUsersData());
    }
  }
}
