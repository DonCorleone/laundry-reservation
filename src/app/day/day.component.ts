import { Component, OnDestroy } from '@angular/core';
import { hour } from '../models/hour';
import { Indicator, IndicatorAnimations } from '../indicator';
import { DateSelectorService } from '../services/date-selector.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  animations: IndicatorAnimations,
})
export class DayComponent implements OnDestroy {
  indicators;
  hours: hour[] = [];
  date: Date;
  private subscription: Subscription;

  constructor(private dateSelectionService: DateSelectorService) {
    this.indicators = new Indicator();
    this.subscription = this.dateSelectionService.selectedDate.subscribe(
      (s) => {
        this.hours = [];
        this.date = s;
        for (let i = 6; i < 22; i++) {
          const begin = new Date(s);
          begin.setHours(i);
          begin.setMinutes(0);

          const end = new Date(s);
          end.setHours(i);
          end.setMinutes(59);

          const h: hour = {
            start: i,
            end: i + 1,
            date: s,
            begin,
            stop: end
          };
          this.hours.push(h);
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onPan(evt: any) {
    console.log(`${evt.center.x}, ${evt.center.y})`);
    const indicator = this.indicators.display(evt.center.x, evt.center.y, 50);
    this.indicators.hide(indicator);
  }
}
