import {ChangeDetectionStrategy, Component, effect, input, Input, InputSignal, Signal} from '@angular/core';
import {DatePipe} from '@angular/common';
import {IHour} from "../../models/hour";
import {MatIcon} from "@angular/material/icon";

@Component({
    selector: 'app-hour-header',
    imports: [DatePipe, MatIcon],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    @if (hour) {
      <div class="flex flex-row justify-between items-center h-full w-full">
        <div class="pl-1 md:pl-3 leading-4">
          {{ hour().begin | date: 'HH:mm' }}-{{ hour().end | date: 'HH:mm' }}
        </div>
       <mat-icon class="pr-1 md:pr-3">keyboard_double_arrow_right</mat-icon>
      </div>
    }
  `
})
export class HourHeaderComponent {
  hour = input<IHour>();

  constructor() {
    effect(() => {
      console.log(`The effected hourheader is: ${this.hour().id}`);
    });
  }
}
