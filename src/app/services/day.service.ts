import {Injectable, OnDestroy} from '@angular/core';
import {DateSelectorService} from "./date-selector.service";
import {hour} from "../models/hour";
import {BehaviorSubject, Observable, of, Subject, Subscription} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DayService implements OnDestroy {
  hours$ = new Subject<hour[]>();

  date: Date;
  private subscription: Subscription;

  constructor(private dateSelectionService: DateSelectorService) {
    this.subscription = this.dateSelectionService.selectedDate.subscribe(
      (s) => {
        const hours = [];
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
          hours.push(h);
        }
        this.hours$.next(hours);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

