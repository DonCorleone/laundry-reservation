import { Component, Input } from '@angular/core';
import { hour } from '../models/hour';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-hour-header',
  template: `
    @if(hour){
    <div class="h-full mt-1 pt-1">
      {{ hour.begin | date: 'HH:mm' }}-{{ hour.end | date: 'HH:mm' }}
    </div>
    }
  `,
  imports: [DatePipe],
  standalone: true,
})
export class HourHeaderComponent {
  @Input() hour: hour;
}
