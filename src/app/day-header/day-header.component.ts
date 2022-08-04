import { Component } from '@angular/core';
import { hour } from '../models/hour';

@Component({
  selector: 'app-day-header',
  templateUrl: './day-header.component.html'
})
export class DayHeaderComponent {
  hours: hour[] = [];
  constructor() {
    for (let i = 6; i < 22; i++) {
      const begin = new Date();
      begin.setHours(i);
      begin.setMinutes(0);

      const end = new Date();
      end.setHours(i);
      end.setMinutes(59);

      const h: hour = {
        begin,
        end: end
      };
      this.hours.push(h);
    }
  }
}
