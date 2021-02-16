import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  OnDestroy,
} from '@angular/core';
import { CarouselItem } from './csd-carousel.types';
import Timer = NodeJS.Timer;

@Component({
  selector: 'csd-carousel',
  templateUrl: './csd-carousel.component.html',
  styleUrls: ['./csd-carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CsdCarouselComponent implements OnInit, OnDestroy {
  @Input() carouselItems: CarouselItem[] = [];
  @Input() changeIntervalMs = 5000;
  showIndicator: boolean;
  currentActivePos = 0;
  intervalTimer = null;

  constructor(private _ref: ChangeDetectorRef) {}

  ngOnInit() {
    this.showIndicator = this.carouselItems.length > 1;
    if (this.showIndicator) {
      this.intervalTimer = this.setCarouselInterval();
    }
  }

  setCarouselInterval(): Timer {
    return setInterval(() => {
      const newCurrentActive = (this.currentActivePos + 1) % this.carouselItems.length;
      this.currentActivePos = newCurrentActive;
      this._ref.detectChanges();
    }, this.changeIntervalMs);
  }

  changeCurrentActive(position: number) {
    this.currentActivePos = position;
    // reset interval
    clearInterval(this.intervalTimer);
    this.intervalTimer = this.setCarouselInterval();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalTimer);
  }
}
