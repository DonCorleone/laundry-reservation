import { ScrollSectionDirective } from './scroll-section.directive';
import { Directive } from '@angular/core';

@Directive({
  selector: '[appScrollManager]',
})
export class ScrollManagerDirective {
  private sections = new Map<string | number, ScrollSectionDirective>();

  scroll(id: string | number) {
    this.sections.get(id)!.scroll();
  }

  register(section: ScrollSectionDirective) {
    this.sections.set(section.id, section);
  }

  remove(section: ScrollSectionDirective) {
    this.sections.delete(section.id);
  }
}
