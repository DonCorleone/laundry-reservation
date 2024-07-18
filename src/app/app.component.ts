import {Component, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {DayService, cellType, Tile} from './services/day.service';
import {hour} from './models/hour';
import {MatGridListModule} from "@angular/material/grid-list";
import {CalendarComponent} from "./calendar/calendar.component";
import {ScrollManagerDirective} from "./directives/scroll-manager.directive";
import {CommonModule, NgForOf, NgIf} from "@angular/common";
import {HourHeaderComponent} from "./hour-header/hour-header.component";
import {HourComponent} from "./hour/hour.component";
import {ScrollSectionDirective} from "./directives/scroll-section.directive";
import {ScrollAnchorDirective} from "./directives/scroll-anchor.directive";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule, CalendarComponent, MatGridListModule,
    HourHeaderComponent, HourComponent, ScrollSectionDirective,
    ScrollAnchorDirective, ScrollManagerDirective,
  ]
})
export class AppComponent implements OnDestroy {
  title = 'laundry';
  readonly CellType = cellType;

  tiles: Tile[] = [];
  color: string = 'black';

  eventText = '';
  private subscription: Subscription;

  constructor(private dayService: DayService) {

    this.subscription = this.dayService.tiles$.subscribe(
      (x) => (this.tiles = x)
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
