import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Signal,
  viewChild
} from '@angular/core';
import { DateSelectorService } from '../../services/date-selector.service';
import { MatCardModule } from '@angular/material/card';
import { MatCalendar, MatCalendarCellClassFunction, MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatNativeDateModule, MatRipple } from '@angular/material/core';
import { SignalRService } from '../../services/signalr.service';
import { ScrollAnchorDirective } from '../../directives/scroll-anchor.directive';

import { ScrollManagerDirective } from '../../directives/scroll-manager.directive';
import { MatIcon } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatDatepickerModule, MatNativeDateModule, MatRipple, MatIcon]
})
export class CalendarComponent {
  private dateAdapter = inject<DateAdapter<Date>>(DateAdapter);


  calendarDates: Date[] = [];
  protected selectedDate: Date;

  readonly calendarOne = viewChild<MatCalendar<Date>>('calendarOne');
  readonly calendarTwo = viewChild<MatCalendar<Date>>('calendarTwo');
  readonly calendarThree = viewChild<MatCalendar<Date>>('calendarThree');
  readonly calendarFour = viewChild<MatCalendar<Date>>('calendarFour');
  readonly calendarFive = viewChild<MatCalendar<Date>>('calendarFive');

  private signalRService = inject(SignalRService);
  private dateSelectorService = inject(DateSelectorService);
  private scrollX = inject(ScrollManagerDirective);
  private changeDetectionRef = inject(ChangeDetectorRef)

  baseDate = new Date();
  reservations: Record<string, string>;
  hourPerDate = this.signalRService.hourPerDate();


  constructor() {
    this.dateAdapter.getFirstDayOfWeek = () => 1;
    this.signalRService.updatedReservation$.pipe(
      takeUntilDestroyed()
    ).subscribe((reservation) => {
      if (!reservation) {
        return;
      }
      const record: Record<string, string> = reservation;
      const keys: string[] = Object.keys(record);
      const reservationDate = new Date(keys[0].slice(0, 24));
      this.updateCalendar(this.calendarOne, reservationDate);
      this.updateCalendar(this.calendarTwo, reservationDate);
      this.updateCalendar(this.calendarThree, reservationDate);
      this.updateCalendar(this.calendarFour, reservationDate);
      this.updateCalendar(this.calendarFive, reservationDate);
    });
  }
  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (!this.hourPerDate) {
      return '';
    }
    if (view !== 'month') {
      return '';
    }

    cellDate.setHours(0, 0, 0, 0);
    const dateIsoString = cellDate.toISOString();
    const dailyReservations = this.hourPerDate.get(dateIsoString);

    if (dailyReservations === undefined) {
      return 'lc-free';
    }
    if (dailyReservations === 0) {
      return 'lc-free';
    }
    if (dailyReservations >= 20) {
      return 'lc-reserved lc-reserved-full';
    }

    if (dailyReservations >= 10) {
      return 'lc-reserved lc-reserved-max';

    }
    return 'lc-reserved';
  };

  private updateCalendar(calendar: Signal<MatCalendar<Date>>, reservationDate: Date) {
    if (calendar().startAt.getMonth() === reservationDate.getMonth()) {
      this.hourPerDate = this.signalRService.hourPerDate();
      calendar().updateTodaysDate();
    }
  }

  selectionFinished(event: Date | null) {
    this.selectedDate = new Date(event)
    this.dateSelectorService.setSelectedDate(this.selectedDate);
    this.changeDetectionRef.markForCheck();
    const anchor = new ScrollAnchorDirective(this.scrollX);
    anchor.id = 'timeTable';
    anchor.scroll();
  }

  getNewDate(date: Date, gap: number): Date {
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
    const totalMonths = currentMonth + gap;
    const nextYear = currentYear + Math.floor(totalMonths / 12);
    const nextMonth = (totalMonths % 12 + 12) % 12; // Ensure the month is within 0-11 range
    return new Date(nextYear, nextMonth, 1);
  }

  updateCalendarDates(baseDate: Date) {
    this.calendarDates = Array.from({ length: 5 }, (_, i) => this.getNewDate(baseDate, i));
    this.calendarOne().activeDate = this.calendarDates[0];
    this.calendarTwo().activeDate = this.calendarDates[1];
    this.calendarThree().activeDate = this.calendarDates[2];
    this.calendarFour().activeDate = this.calendarDates[3];
    this.calendarFive().activeDate = this.calendarDates[4];
  }

  previousMonth($event: MouseEvent) {
    this.baseDate = this.getNewDate(this.baseDate, -1);
    this.updateCalendarDates(this.baseDate);
  }

  nextMonth($event: MouseEvent) {
    this.baseDate = this.getNewDate(this.baseDate, 1);
    this.updateCalendarDates(this.baseDate);
  }
}
