import { Injectable, OnDestroy } from '@angular/core';
import { DateSelectorService } from './date-selector.service';
import { hour } from '../models/hour';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
  header: boolean;
  hour: hour;
}
export interface machine {
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class DayService implements OnDestroy {
  hours$ = new Subject<hour[]>();
  private subscription: Subscription;

  machines: machine[] = [];
  tiles$ = new Subject<Tile[]>();

  constructor(private dateSelectionService: DateSelectorService) {
    for (let i = 1; i <= 4; i++) {
      const m: machine = {
        name: `M ${i}`,
      };
      this.machines.push(m);
    }

    this.subscription = this.dateSelectionService.selectedDate.subscribe(
      (s) => {
        this.hours$.next(this.getHours(s));

        const tiles = [];
        tiles.push({
          text: 'x',
          cols: 2,
          rows: 2,
          color: 'lightblue',
          header: true,
          hour: null,
        });
        this.machines.forEach((m) => {
          tiles.push({
            text: m.name,
            cols: 1,
            rows: 2,
            color: 'lightgreen',
            header: true,
            hour: null,
          });
        });

        const hours = this.getHours(s);

        hours.forEach((h) => {
          tiles.push({
            text: h.begin.toTimeString(),
            cols: 2,
            rows: 1,
            color: 'lightpink',
            header: true,
            hour: h,
          });
          this.machines.forEach((m) => {
            tiles.push({
              text: 'x',
              cols: 1,
              rows: 1,
              color: 'lightyellow',
              header: false,
              hour: h,
            });
          });
        });
        this.tiles$.next(tiles);
      }
    );
  }

  getHours(date: Date): hour[] {
    const hours = [];
    for (let i = 6; i < 22; i++) {
      const begin = new Date(date);
      begin.setHours(i);
      begin.setMinutes(0);

      const end = new Date(date);
      end.setHours(i);
      end.setMinutes(59);

      const h: hour = {
        begin,
        end,
      };
      hours.push(h);
    }
    return hours;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
