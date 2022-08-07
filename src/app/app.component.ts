import { Component } from '@angular/core';
import { Indicator, IndicatorAnimations } from './indicator';
import { DayService, cellType, Tile } from './services/day.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: IndicatorAnimations,
})
export class AppComponent {
  title = 'laundry';
  readonly CellType = cellType;

  tiles$: Observable<Tile[]> = this.dayService.tiles$;

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
