import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions, LottieDirective } from 'ngx-lottie';

@Component({
  selector: 'app-lottie-animation',
  imports: [LottieDirective],
    template: `
    <div
      lottie
      [options]="options"
      (animationCreated)="onAnimationCreated($event)"
      class="lottie-container"
      [style.width]="width"
      [style.height]="height"
    ></div>
  `,
  styles: [
    `
      .lottie-container {
        display: block;
        margin: 0 auto;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LottieAnimationComponent implements OnChanges{

  @Input() path!: string;
  @Input() loop = true;
  @Input() autoplay = true;
  @Input() width = '100%';
  @Input() height = 'auto';

  options!: AnimationOptions;

  ngOnChanges(): void {
    this.options = {
      path: this.path,
      loop: this.loop,
      autoplay: this.autoplay
    }
  }

  onAnimationCreated(animation: AnimationItem) {
    console.log('Lottie created:', animation);
  }
}
