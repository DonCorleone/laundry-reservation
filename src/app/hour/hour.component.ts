import { Component, Input } from '@angular/core';
import { hour } from '../models/hour';
import { Indicator, IndicatorAnimations } from '../indicator';

@Component({
  selector: 'app-hour',
  templateUrl: './hour.component.html',
  animations: IndicatorAnimations,
})
export class HourComponent {
  @Input() hour: hour;

  selected = false;
  indicators;

  constructor() {
    this.indicators = new Indicator();
  }

  onTap(evt) {
    console.log(`tab ${this.hour.start}-${this.hour.end}`);
    this.selected = !this.selected;
    const indicator = this.indicators.display(evt.center.x, evt.center.y, 50);
    this.indicators.hide(indicator);
  }
}
