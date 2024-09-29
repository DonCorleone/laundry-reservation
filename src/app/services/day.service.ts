import {DestroyRef, inject, Injectable} from '@angular/core';
import {DateSelectorService} from './date-selector.service';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {SignalRService} from "./signalr.service";
import {IHour} from "../models/hour";
import {SubjectService} from "./subject.service";
import {ISubject} from "../models/subject";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Tile} from "../models/tile";

export enum cellType {
  X,
  COLUMN_HEADER,
  ROW_HEADER,
  HOUR,
}

@Injectable({
  providedIn: 'root',
})
export class DayService {

  subjects: ISubject[] = [];
  tiles = new BehaviorSubject<Tile[] | null>(null);
  tiles$: Observable<Tile[] | null> = this.tiles.asObservable();

  reservations = this.signalRService.getMessages();
  destroyRef = inject(DestroyRef);

  constructor(private dateSelectionService: DateSelectorService, private signalRService: SignalRService, private subjectService: SubjectService) {

    combineLatest([
      this.subjectService.subjects$,
      this.dateSelectionService.selectedDate$,
      this.signalRService.updatedReservation$
    ]).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([subjects, selectedDate, reservation]) => {
        if (!selectedDate) {
          return;
        }

        this.subjects = subjects;
        const tiles = [];

        const selectedDateStr = this.formatToISODate(selectedDate);
        const colspan = this.subjects.length > 3 ? 2 : 1;
        const isMobile = window.innerWidth < 450;

        tiles.push({
          id: `${selectedDateStr}-x-x`,
          subject: null,
          text: selectedDate.toLocaleDateString('de-CH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
          cellType: cellType.X,
          cols: colspan,
          rows: isMobile ? 2: 1,
          header: true,
          hour: null,
        });

        this.subjects.forEach((subject) => {
          tiles.push({
            id: `${selectedDateStr}-x-${subject.key}`,
            subject,
            text: subject.avatar,
            cellType: cellType.COLUMN_HEADER,
            cols: 1,
            rows: isMobile ? 2 : 1,
            header: true,
            hour: null,
          });
        });

        const hours = this.getHours(selectedDate);

        hours.forEach((hour) => {
          tiles.push({
            id: `${hour.id}-x`,
            subject: null,
            text: hour.id,
            cellType: cellType.ROW_HEADER,
            cols: colspan,
            rows: 1,
            header: true,
            hour: hour,
          });
          this.subjects.forEach((subject) => {
            const hourClone = structuredClone(hour);
            const id = `${hourClone.id}-${subject.key}`;
            if (this.reservations().some((r) => r.id === id)) {
              hourClone.selectedBy = this.reservations().find((r) => r.id === id).name;
            }
            tiles.push({
              id,
              subject,
              text: null,
              cellType: cellType.HOUR,
              cols: 1,
              rows: 1,
              header: false,
              hour: {
                ...hourClone,
              },
            });
          });
        });

        this.tiles.next(tiles);

        if (reservation) {
          const [key, value] = Object.entries(reservation)[0];
          console.log(`Reservation ID: ${key}, User: ${value}`);
          this.updateTile(key, value);
        }
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

  getHours(date: Date): IHour[] {
    const hours = [];
    for (let i = 6; i < 22; i++) {
      const begin = new Date(date);
      begin.setHours(i);
      begin.setMinutes(0);

      const end = new Date(date);
      end.setHours(i);
      end.setMinutes(59);

      const h: IHour = {
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
}
