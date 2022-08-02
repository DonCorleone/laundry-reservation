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
      const h: hour = {
        start: i,
        end: i + 1,
      };
      this.hours.push(h);
    }
  }
}
