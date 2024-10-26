import { Component } from '@angular/core';
import {NgStyle} from "@angular/common";

@Component({
  selector: 'app-legend',
  standalone: true,
  imports: [
    NgStyle
  ],
  template: `
    <div class="flex flex-row items-center gap-3 h-full pl-4">
      <span>Booked:</span>
      @for (item of legendItems; let index = $index; track item.bgClass) {
        <div class="flex flex-row gap-1 align-baseline items-center">
          <div class="legend-square w-5 h-5 md:w-7 md:h-7" [class]="item.bgClass"></div>
          <span>{{ item.text }}</span>
        </div>
      }
    </div>
  `,
})
export class LegendComponent {
  legendItems = [
    { bgClass: 'lc-free', text: 'Free' },
    { bgClass: 'lc-reserved', text: 'lightly' },
    { bgClass: 'lc-reserved-max', text: 'half' },
    { bgClass: 'lc-reserved-full', text: 'heavily' }
  ];
}
