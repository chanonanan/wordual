import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appTouch]',
  standalone: true
})
export class TouchDirective {

  @Input() timemove!: number;
  @Output() touch = new EventEmitter();

  private countTouchMove = 0;

  @HostListener('click', ['$event'])
  onclick(event: Event) {
    if (event.cancelable) {
      event.preventDefault();
    }
  }

  @HostListener('touchstart', ['$event'])
  ontouchstart() {
    if (this.timemove === 0) {
      this.touch.emit();
    }
  }

  @HostListener('touchmove', ['$event'])
  ontouchmove() {
    this.countTouchMove++;
  }

  @HostListener('touchend', ['$event'])
  ontouchend(event: Event) {
    if (event.cancelable) {
      event.preventDefault();
      event.stopPropagation();
    }
    const time = this.timemove || 3;
    if (this.countTouchMove < time) {
      this.touch.emit();
    }
    this.countTouchMove = 0;
  }

}
