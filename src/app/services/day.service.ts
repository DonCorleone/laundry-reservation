import {Injectable, OnDestroy} from '@angular/core';
import {DateSelectorService} from './date-selector.service';
import {hour} from '../models/hour';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {SignalRService} from "./signalr.service";

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
  tiles = new BehaviorSubject<Tile[] | null>(null);
  tiles$: Observable<Tile[] | null> = this.tiles.asObservable();

  reservations = this.signalRService.getMessages()

  constructor(private dateSelectionService: DateSelectorService, private signalRService: SignalRService) {

    for (let i = 1; i <= 4; i++) {
      const m: machine = {
        name: `M-${i}`,
      };
      this.machines.push(m);
    }

    this.subscription = this.dateSelectionService.selectedDate$.subscribe(
      (selectedDate) => {

        if (!selectedDate) {
          return;
        }

        const tiles = [];

        const selectedDateStr = this.formatToISODate(selectedDate);
        tiles.push({
          id: `${selectedDateStr}-x-x`,
          machine: null,
          text: selectedDate.toLocaleDateString('de-CH', {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'}),
          cellType: cellType.X,
          cols: 2,
          rows: 2,
          header: true,
          hour: null,
        });

        this.machines.forEach((machine) => {
          tiles.push({
            id: `${selectedDateStr}-x-${machine.name}`,
            machine: machine.name,
            text: machine.name,
            cellType: cellType.COLUMN_HEADER,
            cols: 1,
            rows: 2,
            header: true,
            hour: null,
          });
        });

        const hours = this.getHours(selectedDate);

        hours.forEach((hour) => {
          tiles.push({
            id: `${hour.id}-x`,
            machine: null,
            text: hour.id,
            cellType: cellType.ROW_HEADER,
            cols: 2,
            rows: 1,
            header: true,
            hour: hour,
          });
          this.machines.forEach((machine) => {
            // clone the hour object to avoid reference issues
            const hourClone = structuredClone(hour);
            const id = `${hourClone.id}-${machine.name}`;
            if (this.reservations().some((r) => r.id === id)) {
              hourClone.selectedBy = this.reservations().find((r) => r.id === id).name;
            }
            tiles.push({
              id,
              machine: machine.name,
              text: null,
              cellType: cellType.HOUR,
              cols: 1,
              rows: 1,
              header: false,
              hour: {
                ...
                  hourClone,
              },
            });
          });
        });
        this.tiles.next(tiles);
      }
    );

    this.signalRService.updatedReservation$.subscribe((reservation) => {
      if (!reservation) {
        return;
      }

      const [key, value] = Object.entries(reservation)[0];
      console.log(`Reservation ID: ${key}, User: ${value}`);

      this.updateTile(key, value);
    });
  }

  // New function to calculate a number based on date and time
  updateTile(reservationId: string, newUser: string) {
    this.tiles$.subscribe((tiles) => {
      tiles.forEach((tile) => {
        if (tile.id === reservationId) {
          tile.hour.selectedBy = newUser;
        }
      });
    });
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
        id: begin.toISOString(),
        begin,
        end,
        selectedBy: '',
      };
      hours.push(h);
    }
    return hours;
  }

  // Utility function to format date to ISO string with time set to 00:00:00.000
  formatToISODate(date: Date): string {
    const formattedDate = new Date(date);
    formattedDate.setUTCHours(0, 0, 0, 0);
    return formattedDate.toISOString();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
