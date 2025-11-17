import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sport-space-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './sport-space-card.component.html',
  styleUrl: './sport-space-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SportSpaceCardComponent {
  @Input() title!: string;
  @Input() value!: number;
  @Input() subtitle!: string;
  @Input() icon!: string;
}
