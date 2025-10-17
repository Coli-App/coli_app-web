import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LottieAnimationComponent } from '@app/core/shared/components/lottie-animation/lottie-animation.component';

@Component({
  selector: 'app-not-found',
  imports: [CommonModule, RouterLink, LottieAnimationComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  animationPath = 'assets/lottie/404.json';
}
