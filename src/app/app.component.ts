import { Component } from '@angular/core';
import { Indicator, IndicatorAnimations } from './indicator';
import {DayService} from "./services/day.service";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: IndicatorAnimations,
})
export class AppComponent {
  title = 'laundry';

  tiles = this.dayService.tiles;

  centered = false;
  disabled = false;
  unbounded = false;

  radius: number = 0;
  color: string = 'black';

  eventText = '';
  indicators;

  constructor(private dayService: DayService) {
    this.indicators = new Indicator();

  }
  onPan(evt: any) {
    this.eventText += `(${evt.center.x}, ${evt.center.y})<br/>`;
    const indicator = this.indicators.display(evt.center.x, evt.center.y, 50);
    this.indicators.hide(indicator);
  }

  onTap(evt) {
    this.eventText += `(${evt.center.x}, ${evt.center.y})<br/>`;
    const indicator = this.indicators.display(evt.center.x, evt.center.y, 50);
    this.indicators.hide(indicator);
  }
}
