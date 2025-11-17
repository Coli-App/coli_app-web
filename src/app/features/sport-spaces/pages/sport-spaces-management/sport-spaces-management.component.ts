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
import { SpaceFormComponent, SpaceFormData } from '@features/sport-spaces/components/space-form/space-form.component';
import { SportSpaceStats } from '@features/sport-spaces/models/sport-space.stats';
import type { SportSpaceCard } from '@app/features/sport-spaces/models/sport-space-card';

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
    FormsModule
  ],
  templateUrl: './sport-spaces-management.component.html',
  styleUrl: './sport-spaces-management.component.scss',
})
export class SportSpacesComponent {
  constructor(private dialog: MatDialog, private snackBar: MatSnackBar) {
    this.loadMockData();
  }

  searchTerm = signal('');
  spaces = signal<SportSpaceCard[]>([]);

  filteredSpaces = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.spaces().filter(space =>
      space.name.toLowerCase().includes(term) ||
      space.location.toLowerCase().includes(term) ||
      space.description.toLowerCase().includes(term)
    );
  });

  stats = computed<SportSpaceStats[]>(() => {
    const allSpaces = this.spaces();
    const totalSpaces = allSpaces.length;
    const activeSpaces = allSpaces.filter(s => s.isActive).length;
    const inactiveSpaces = allSpaces.filter(s => !s.isActive).length;
    const totalCapacity = allSpaces.reduce((sum, s) => sum + s.capacity, 0);

    return [
      {
        title: 'Total Instalaciones',
        value: totalSpaces,
        subtitle: 'Espacios deportivos',
        icon: 'account_balance'
      },
      {
        title: 'Activas',
        value: activeSpaces,
        subtitle: `${totalSpaces > 0 ? Math.round((activeSpaces / totalSpaces) * 100) : 0}% del total`,
        icon: 'check_circle'
      },
      {
        title: 'Inactivas',
        value: inactiveSpaces,
        subtitle: 'Requieren atención',
        icon: 'cancel'
      },
      {
        title: 'Capacidad Total',
        value: totalCapacity,
        subtitle: 'Personas simultáneas',
        icon: 'group'
      }
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
        mode: 'create'
      } as SpaceFormData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.snackBar.open('Espacio creado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        this.loadMockData();
      }
    });
  }

  onViewSpace(space: SportSpaceCard): void {
    console.log('Ver espacio:', space);
  }

  onDeleteSpace(space: SportSpaceCard): void {
    console.log('Eliminar espacio:', space);
  }

  private loadMockData(): void {
    this.spaces.set([
      {
        id: '1',
        name: 'Cancha de Fútbol Principal',
        location: 'Sector Norte, Edificio Deportes',
        description: 'Cancha de fútbol profesional con césped sintético',
        capacity: 22,
        imageUrl: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
        isActive: true,
        sports: ['Fútbol']
      },
      {
        id: '2',
        name: 'Cancha de Baloncesto Cubierta',
        location: 'Sector Norte, Edificio Deportes',
        description: 'Cancha techada con piso de madera',
        capacity: 10,
        imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
        isActive: true,
        sports: ['Baloncesto']
      },
      {
        id: '3',
        name: 'Piscina Olímpica',
        location: 'Sector Norte, Edificio Deportes',
        description: 'Piscina de 50 metros con 8 carriles',
        capacity: 50,
        imageUrl: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800',
        isActive: true,
        sports: ['Natación']
      },
      {
        id: '4',
        name: 'Gimnasio Principal',
        location: 'Sector Norte, Edificio Deportes',
        description: 'Gimnasio equipado con máquinas de última generación',
        capacity: 30,
        imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
        isActive: true,
        sports: ['Fitness', 'Gimnasia']
      },
      {
        id: '5',
        name: 'Pista de Atletismo',
        location: 'Sector Norte, Edificio Deportes',
        description: 'Pista de 400 metros homologada',
        capacity: 20,
        imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
        isActive: true,
        sports: ['Atletismo']
      },
      {
        id: '6',
        name: 'Cancha de Voleibol',
        location: 'Sector Norte, Edificio Deportes',
        description: 'Cancha de voleibol al aire libre',
        capacity: 12,
        imageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800',
        isActive: false,
        sports: ['Voleibol']
      }
    ]);
  }
}
