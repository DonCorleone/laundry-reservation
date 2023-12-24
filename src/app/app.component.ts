import {Component, OnDestroy} from '@angular/core';
import { Subscription} from 'rxjs';
import { Indicator, IndicatorAnimations } from './indicator';
import { DayService, cellType, Tile } from './services/day.service';
import { hour } from './models/hour';
import {MatGridListModule} from "@angular/material/grid-list";
import {CalendarComponent} from "./calendar/calendar.component";
import {ScrollManagerDirective} from "./directives/scroll-manager.directive";
import {NgForOf, NgIf} from "@angular/common";
import {HourHeaderComponent} from "./hour-header/hour-header.component";
import {HourComponent} from "./hour/hour.component";
import {ScrollSectionDirective} from "./directives/scroll-section.directive";
import {ScrollAnchorDirective} from "./directives/scroll-anchor.directive";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: IndicatorAnimations,
})
export class AppComponent implements OnDestroy {
  title = 'laundry';
  readonly CellType = cellType;

  tiles: Tile[] = [];

  centered = false;
  disabled = false;
  unbounded = false;

  radius: number = 0;
  color: string = 'black';

  eventText = '';
  indicators: Indicator;
  private subscription: Subscription;

  constructor(private dayService: DayService) {
    this.indicators = new Indicator();

    this.subscription = this.dayService.tiles$.subscribe(
      (x) => (this.tiles = x)
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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

  clickHourHeader($event: MouseEvent, hour: hour) {
    this.tiles
      .filter((t) => t.hour?.begin.getHours() == hour.begin.getHours())
      .forEach((t) => {
        t.hour.selectedBy = 'yyy';
        console.log(hour.end, hour.begin, hour.selectedBy);
      });
  }

  clickHourColumn($event: MouseEvent, hour: hour) {
/*    this.tiles
      .filter((t) => t.machine == t.machine)
      .forEach((t) => {
        t.hour.selectedBy = 'yyy';
        console.log(hour.end, hour.begin, hour.selectedBy);
      });*/
  }
}
