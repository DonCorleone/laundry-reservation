import { Injectable, OnDestroy } from '@angular/core';
import { DateSelectorService } from './date-selector.service';
import { hour } from '../models/hour';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}
export interface machine {
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class DayService implements OnDestroy {
  hours$ = new Subject<hour[]>();
  //date: Date;
  private subscription: Subscription;

  machines: machine[] = [];
  tiles: Tile[] = [
    { text: 'x', cols: 1, rows: 1, color: 'lightblue' },
    { text: 'WM1', cols: 1, rows: 1, color: 'lightgreen' },
    { text: 'TB1', cols: 1, rows: 1, color: 'lightgreen' },
    { text: 'WM2', cols: 1, rows: 1, color: 'lightgreen' },
    { text: 'TB2', cols: 1, rows: 1, color: 'lightgreen' },
    { text: '06', cols: 1, rows: 1, color: 'lightpink' },
    { text: 'WM1', cols: 1, rows: 1, color: 'lightyellow' },
    { text: 'TB1', cols: 1, rows: 1, color: 'lightyellow' },
    { text: 'WM2', cols: 1, rows: 1, color: 'lightyellow' },
    { text: 'TB2', cols: 1, rows: 1, color: 'lightyellow' },
    { text: '07', cols: 1, rows: 1, color: 'lightpink' },
    { text: 'WM1', cols: 1, rows: 1, color: 'lightyellow' },
    { text: 'TB1', cols: 1, rows: 1, color: 'lightyellow' },
    { text: 'WM2', cols: 1, rows: 1, color: 'lightyellow' },
    { text: 'TB2', cols: 1, rows: 1, color: 'lightyellow' },
  ];

  constructor(private dateSelectionService: DateSelectorService) {
    for (let i = 1; i <= 4; i++) {
      const m: machine = {
        name: `machine ${i}`,
      };
      this.machines.push(m);
    }

    this.subscription = this.dateSelectionService.selectedDate.subscribe(
      (s) => {
        this.hours$.next(this.getHours(s));

        this.tiles = [];
        this.tiles.push({ text: 'x', cols: 2, rows: 2, color: 'lightblue' });
        this.machines.forEach((m) => {
          this.tiles.push({
            text: m.name,
            cols: 1,
            rows: 2,
            color: 'lightgreen',
          });
        });

        const hours = this.getHours(s);

        hours.forEach((h) => {
          this.tiles.push({
            text: h.begin.toTimeString(),
            cols: 2,
            rows: 1,
            color: 'lightpink',
          });
          this.machines.forEach((m) => {
            this.tiles.push({
              text: "x",
              cols: 1,
              rows: 1,
              color: 'lightyellow',
            });
          });
        });
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
