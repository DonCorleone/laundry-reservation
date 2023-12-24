import { Component, Input } from '@angular/core';
import { hour } from '../models/hour';
import { Indicator, IndicatorAnimations } from '../indicator';
import {CommonModule, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-hour',
  templateUrl: './hour.component.html',
  styles: [`.gesture__indicator {
    position: fixed;
    top: 0;
    left: 0;
    height: 50px;
    width: 50px;
    display: block;
    border-radius: 50%;
    text-align: center;
    line-height: 45px;
    z-index: 10;
  }`],
  animations: IndicatorAnimations,
})
export class HourComponent {
  @Input() hour: hour;

  indicators: Indicator;

  constructor() {
    this.indicators = new Indicator();
  }

  onTap(evt) {
    console.log(`tab ${this.hour.begin}-${this.hour.end}`);
    this.hour.selectedBy = this.hour.selectedBy === 'xxx' ? '' : 'xxx'

    const indicator = this.indicators.display(evt.center.x, evt.center.y, 50);
    this.indicators.hide(indicator);
  }
}
