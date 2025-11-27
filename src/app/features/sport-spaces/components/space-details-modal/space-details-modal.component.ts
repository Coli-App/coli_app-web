import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpaceResponse } from '@features/sport-spaces/models/space-response';
import { SportSpacesService } from '@features/sport-spaces/services/sport-spaces.service';

const DAYS_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

@Component({
  selector: 'app-space-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './space-details-modal.component.html',
  styleUrl: './space-details-modal.component.scss',
})
export class SpaceDetailsModalComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<SpaceDetailsModalComponent>);
  private readonly data = inject<{ spaceId: number }>(MAT_DIALOG_DATA);
  private readonly spacesService = inject(SportSpacesService);

  space: SpaceResponse | null = null;
  loading = true;
  error = false;

  ngOnInit(): void {
    this.loadSpaceDetails();
  }

  loadSpaceDetails(): void {
    this.loading = true;
    this.error = false;

    this.spacesService.getSpaceById(this.data.spaceId).subscribe({
      next: (space) => {
        this.space = space;
        this.loading = false;
        console.log('Detalles del espacio:', space);
      },
      error: (err) => {
        console.error('Error al cargar detalles del espacio:', err);
        this.error = true;
        this.loading = false;
      },
    });
  }

  formatTime(time: string | null): string {
    if (!time) return '';
    // Convertir de "10:00:00" a "10:00"
    return time.substring(0, 5);
  }

  getSortedSchedule() {
    if (!this.space?.schedule) return [];
    
    return [...this.space.schedule].sort((a, b) => {
      const indexA = DAYS_ORDER.indexOf(a.day);
      const indexB = DAYS_ORDER.indexOf(b.day);
      return indexA - indexB;
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
