import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-action-card',
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './action-card.component.html',
  styleUrl: './action-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionCardComponent {
  @Input() title!: string;
  @Input() description!: string;
  @Input() buttonText!: string;
  @Input() buttonIcon?: string;
  @Input() route!: string;
}
