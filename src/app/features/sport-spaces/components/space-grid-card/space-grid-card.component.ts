import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import type { SportSpaceCard } from '@features/sport-spaces/models/sport-space-card';
import { SportSpacesService } from '@features/sport-spaces/services/sport-spaces.service';
import { SportSpacesResponse } from '@features/sport-spaces/models/sport-spaces.response';

@Component({
  selector: 'app-space-grid-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule
  ],
  templateUrl: './space-grid-card.component.html',
  styleUrl: './space-grid-card.component.scss'
})
export class SpaceGridCardComponent{
  @Input() space!: SportSpaceCard;
  @Output() view = new EventEmitter<SportSpaceCard>();

  constructor() {}

  onView(): void {
    this.view.emit(this.space);
  }

}
