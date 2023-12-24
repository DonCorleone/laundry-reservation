import { ScrollManagerDirective } from './scroll-manager.directive';
import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appScrollSection]',
  standalone: true
})
export class ScrollSectionDirective {
  @Input('appScrollSection') id: string | number;

  constructor(
    private host: ElementRef<HTMLElement>,
    private manager: ScrollManagerDirective
  ) {}

  ngOnInit() {
    this.manager.register(this);
  }

  ngOnDestroy() {
    this.manager.remove(this);
  }

  scroll() {
    this.host.nativeElement.scrollIntoView({
      behavior: 'smooth',
    });
  }
}
