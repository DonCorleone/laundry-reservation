import {DestroyRef, effect, inject, Injectable, Signal} from '@angular/core';
import {DateSelectorService} from './date-selector.service';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {SignalRService} from "./signalr.service";
import {IHour} from "../models/hour";
import {SubjectService} from "./subject.service";
import {ISubject} from "../models/subject";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Tile} from "../models/tile";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {IReservation} from "../models/reservation";
export enum cellType {
  X,
  COLUMN_HEADER,
  ROW_HEADER,
  HOUR,
}
@Injectable({
  providedIn: 'root',
})
export class TileService {

  tiles = new BehaviorSubject<Tile[] | null>(null);
  tiles$: Observable<Tile[] | null> = this.tiles.asObservable();

  constructor(){
    const destroyRef = inject(DestroyRef);
    const signalRService = inject(SignalRService);
    let reservations: Signal<IReservation[]>;

    combineLatest([
      signalRService.updatedReservation$,
      inject(SubjectService).subjects$,
      inject(DateSelectorService).selectedDate$,
      inject(BreakpointObserver)
        .observe([
          Breakpoints.Medium,
          Breakpoints.Large,
          Breakpoints.XLarge,
        ])
    ]).pipe(takeUntilDestroyed(destroyRef))
      .subscribe(([reservation, subjects, selectedDate, desktopBreakPoint]) => {
        if (!selectedDate || !subjects) {
          return;
        }

        reservations = signalRService.getReservations();
        const isDesktop = desktopBreakPoint.matches;
        const colSpan = (isDesktop || subjects.length < 4) ? 1 : 2;

        const selectedDateStr = this.formatToISODate(selectedDate);
        const hours = this.getHours(selectedDate);

        const tiles = [];
        this.addRoot(tiles, selectedDateStr, selectedDate, colSpan, !isDesktop);
        this.addColumnHeaders(tiles, subjects, selectedDateStr, !isDesktop);
        this.addRows(tiles, subjects, hours, colSpan, reservations);
        this.tiles.next(tiles);

        if (reservation) {
          const [key, value] = Object.entries(reservation)[0];
          this.updateTile(key, value);
        }
      });
  }

  private addRoot(tiles: any[], selectedDateStr: string, selectedDate: Date, colspan: number, isMobile: boolean) {
    tiles.push({
      id: `${selectedDateStr}-x-x`,
      subject: null,
      text: selectedDate.toLocaleDateString('de-CH', {
        weekday: isMobile ? undefined: 'short',
        year: '2-digit',
        month: 'short',
        day: isMobile ? 'numeric' : '2-digit'
      }),
      cellType: cellType.X,
      cols: colspan,
      rows: isMobile ? 2 : 1,
      header: true,
      hour: null,
    });
  }

  private addColumnHeaders(tiles: any[], subjects: ISubject[], selectedDateStr: string, isMobile: boolean) {
    subjects.forEach((subject) => {
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
  }

  private addRows(tiles: any[], subjects: ISubject[], hours: IHour[], colspan: number, reservations: Signal<IReservation[]> ) {
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
      this.addCells(tiles, subjects, hour, reservations);
    });
  }

  private addCells(tiles: any[], subjects: ISubject[], hour: IHour, reservations: Signal<IReservation[]>) {
    subjects.forEach((subject) => {
      const hourClone = structuredClone(hour);
      const id = `${hourClone.id}-${subject.key}`;
      if (reservations().some((r) => r.id === id)) {
        hourClone.selectedBy = reservations().find((r) => r.id === id).name;
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
  }

// New function to calculate a number based on date and time
  private updateTile(reservationId: string, newUser: string) {
    this.tiles$.subscribe((tiles) => {
      tiles.forEach((tile) => {
        if (tile.id === reservationId) {
          tile.hour.selectedBy = newUser;
        }
      });
    });
  }

  private getHours(date: Date): IHour[] {
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
  private formatToISODate(date: Date): string {
    const formattedDate = new Date(date);
    formattedDate.setUTCHours(0, 0, 0, 0);
    return formattedDate.toISOString();
  }
}
