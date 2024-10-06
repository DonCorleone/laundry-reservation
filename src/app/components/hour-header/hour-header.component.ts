import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {DatePipe} from '@angular/common';
import {IHour} from "../../models/hour";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-hour-header',
  imports: [DatePipe, MatIcon],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (hour) {
      <div class="flex flex-row justify-between items-center h-full w-full">
        <div class="pl-1 md:pl-3">
          {{ hour.begin | date: 'HH:mm' }}-{{ hour.end | date: 'HH:mm' }}
        </div>
       <mat-icon class="pr-1 md:pr-3">keyboard_double_arrow_right</mat-icon>
      </div>
    }
  `
})
export class HourHeaderComponent {
  @Input() hour: IHour;
}
