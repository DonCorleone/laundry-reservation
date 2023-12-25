import { ScrollManagerDirective } from './scroll-manager.directive';
import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appScrollAnchor]',
  standalone: true,
})
export class ScrollAnchorDirective {
  @Input('appScrollAnchor') id: string | number;

  constructor(private manager: ScrollManagerDirective) {}

  @HostListener('click')
  scroll() {
    this.manager.scroll(this.id);
  }
}
