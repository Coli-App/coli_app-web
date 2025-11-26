import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { SportSpaceCardComponent } from '@features/sport-spaces/components/sport-space-card/sport-space-card.component';
import { SpaceGridCardComponent } from '@features/sport-spaces/components/space-grid-card/space-grid-card.component';
import {
  SpaceFormComponent,
  SpaceFormData,
} from '@features/sport-spaces/components/space-form/space-form.component';
import { SportSpaceStats } from '@features/sport-spaces/models/sport-space.stats';
import type { SportSpaceCard } from '@app/features/sport-spaces/models/sport-space-card';
import { SportSpacesService } from '@app/features/sport-spaces/services/sport-spaces.service';
import { SportSpacesResponse } from '@app/features/sport-spaces/models/sport-spaces.response';

@Component({
  selector: 'app-sport-spaces',
  standalone: true,
  imports: [
    CommonModule,
    SportSpaceCardComponent,
    SpaceGridCardComponent,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './sport-spaces-management.component.html',
  styleUrl: './sport-spaces-management.component.scss',
})
export class SportSpacesComponent {
  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private spacesService: SportSpacesService
  ) {
    this.loadSportSpaces();
  }

  searchTerm = signal('');
  spaces = signal<SportSpaceCard[]>([]);

  filteredSpaces = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.spaces().filter(
      (space) =>
        space.name.toLowerCase().includes(term) ||
        space.ubication.toLowerCase().includes(term) ||
        space.description.toLowerCase().includes(term)
    );
  });

  stats = computed<SportSpaceStats[]>(() => {
    const allSpaces = this.spaces();
    const totalSpaces = allSpaces.length;
    const activeSpaces = allSpaces.filter((s) => s.state).length;
    const inactiveSpaces = allSpaces.filter((s) => !s.state).length;
    const totalCapacity = allSpaces.reduce((sum, s) => sum + s.capacity, 0);

    return [
      {
        title: 'Total Instalaciones',
        value: totalSpaces,
        subtitle: 'Espacios deportivos',
        icon: 'account_balance',
      },
      {
        title: 'Activas',
        value: activeSpaces,
        subtitle: `${
          totalSpaces > 0 ? Math.round((activeSpaces / totalSpaces) * 100) : 0
        }% del total`,
        icon: 'check_circle',
      },
      {
        title: 'Inactivas',
        value: inactiveSpaces,
        subtitle: 'Requieren atención',
        icon: 'cancel',
      },
      {
        title: 'Capacidad Total',
        value: totalCapacity,
        subtitle: 'Personas simultáneas',
        icon: 'group',
      },
    ];
  });

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(SpaceFormComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: true,
      autoFocus: true,
      data: {
        mode: 'create',
      } as SpaceFormData,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.success) {
        this.snackBar.open('Espacio creado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });

        this.loadSportSpaces();
      }
    });
  }

  onViewSpace(space: SportSpaceCard): void {
    console.log('Ver espacio:', space);
  }

  loadSportSpaces(): void {
    this.spacesService.getAllSpaces().subscribe({
      next: (spaces: SportSpacesResponse[]) => {
        console.log('Loaded sport spaces:', spaces);

        this.spaces.set(
          spaces.map(
            (s) =>
              ({
                id: s.id,
                name: s.name,
                description: s.description,
                ubication: s.ubication,
                capacity: s.capacity,
                imageUrl: s.imageUrl,
                state: s.state,
                sports: s.sports,
              } as SportSpaceCard)
          )
        );
      },
      error: (err) => {
        console.error('Error al cargar los espacios deportivos:', err);
      },
    });
  }
}
