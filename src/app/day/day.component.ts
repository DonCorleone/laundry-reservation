import { Component } from '@angular/core';
import { hour } from '../models/hour';
import {Indicator, IndicatorAnimations} from "../indicator";

@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  animations: IndicatorAnimations
})
export class DayComponent {
  indicators;
  hours: hour[] = [];
  constructor() {
    this.indicators = new Indicator();
    for (let i = 6; i < 22; i++) {
      const h: hour = {
        start: i,
        end: i + 1,
      };
      this.hours.push(h);
    }
  }

  onPan(evt: any) {
    console.log(`${evt.center.x}, ${evt.center.y})`);
    const indicator = this.indicators.display(evt.center.x, evt.center.y, 50);
    this.indicators.hide(indicator);
  }
}
