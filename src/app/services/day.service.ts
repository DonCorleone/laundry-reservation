import { Injectable, OnDestroy } from '@angular/core';
import { DateSelectorService } from './date-selector.service';
import { hour } from '../models/hour';
import { Subject, Subscription } from 'rxjs';
export interface Tile {
  id: string;
  machine: string;
  color: string;
  cols: number;
  rows: number;
  text: string;
  cellType: number;
  header: boolean;
  hour: hour;
}
export interface machine {
  name: string;
}

export enum cellType {
  X,
  COLUMN_HEADER,
  ROW_HEADER,
  HOUR,
}

@Injectable({
  providedIn: 'root',
})
export class DayService implements OnDestroy {
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
      (selectedDate) => {

        const tiles = [];
        const selectedDateStr = selectedDate.toDateString();
        tiles.push({
          id: `${selectedDateStr}-x-x`,
          machine: null,
          text: selectedDateStr,
          cellType: cellType.X,
          cols: 2,
          rows: 2,
          color: 'lightblue',
          header: true,
          hour: null,
        });

        this.machines.forEach((machine) => {
          tiles.push({
            id: `${selectedDateStr}-x-${machine.name}`,
            machine,
            text: machine.name,
            cellType: cellType.COLUMN_HEADER,
            cols: 1,
            rows: 2,
            color: 'lightgreen',
            header: true,
            hour: null,
          });
        });

        const hours = this.getHours(selectedDate);

        hours.forEach((hour) => {
          const hourStr = hour.begin.toTimeString();
          tiles.push({
            id: `${selectedDateStr}-${hourStr}-x`,
            machine: null,
            text: hourStr,
            cellType: cellType.ROW_HEADER,
            cols: 2,
            rows: 1,
            color: 'lightpink',
            header: true,
            hour: hour,
          });
          this.machines.forEach((machine) => {
            tiles.push({
              id: `${selectedDateStr}-${hourStr}-${machine.name}`,
              machine,
              text: null,
              cellType: cellType.HOUR,
              cols: 1,
              rows: 1,
              color: 'lightyellow',
              header: false,
              hour: {
                ...
                  hour
              },
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
        selectedBy: ''
      };
      hours.push(h);
    }
    return hours;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
