import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {DatePipe} from '@angular/common';
import {IHour} from "../../models/hour";

@Component({
  selector: 'app-hour-header',
  imports: [DatePipe],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (hour) {
      <div class="h-full place-content-center">
        {{ hour.begin | date: 'HH:mm' }}-{{ hour.end | date: 'HH:mm' }}
      </div>
    }
  `
})
export class HourHeaderComponent {
  @Input() hour: IHour;
}
