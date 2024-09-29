import {Component, Input} from '@angular/core';
import {DatePipe} from '@angular/common';
import {IHour} from "../models/hour";

@Component({
  selector: 'app-hour-header',
  template: `
    @if (hour) {
      <div class="h-full mt-1 pt-1">
        {{ hour.begin | date: 'HH:mm' }}-{{ hour.end | date: 'HH:mm' }}
      </div>
    }
  `,
  imports: [DatePipe],
  standalone: true,
})
export class HourHeaderComponent {
  @Input() hour: IHour;
}
