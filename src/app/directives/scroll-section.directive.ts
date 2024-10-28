import { ScrollManagerDirective } from './scroll-manager.directive';
import {Directive, ElementRef, inject, Input, OnDestroy, OnInit} from '@angular/core';

@Directive({
  selector: '[appScrollSection]',
  standalone: true,
})
export class ScrollSectionDirective implements OnInit, OnDestroy {
  @Input('appScrollSection') id: string | number;

  private host = inject(ElementRef<HTMLElement>)
  private manager = inject(ScrollManagerDirective);

  ngOnInit() {
    this.manager.register(this);
  }

  ngOnDestroy() {
    this.manager.remove(this);
  }

  scroll() {
    setTimeout(() => {
      this.host.nativeElement.scrollIntoView({
        behavior: 'smooth',
      });
    }, 100);
  }
}
