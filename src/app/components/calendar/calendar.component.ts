import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  output,
  signal,
  ViewChild
} from '@angular/core';
import { DateSelectorService } from '../../services/date-selector.service';
import { MatCardModule } from '@angular/material/card';
import { MatCalendar, MatCalendarCellClassFunction, MatDatepickerModule } from '@angular/material/datepicker';
import {DateAdapter, MatNativeDateModule, MatRipple} from '@angular/material/core';
import { SignalRService } from '../../services/signalr.service';
import { ScrollAnchorDirective } from '../../directives/scroll-anchor.directive';
import { ScrollSectionDirective } from '../../directives/scroll-section.directive';
import { ScrollManagerDirective } from '../../directives/scroll-manager.directive';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatCardModule, MatDatepickerModule, MatNativeDateModule, ScrollAnchorDirective, ScrollSectionDirective, MatRipple, MatIcon]
})
export class CalendarComponent implements AfterViewInit {

  calendarDates: Date[] = [];
  protected selectedDate: Date;

  @ViewChild('calendarOne') calendarOne: MatCalendar<Date>;
  @ViewChild('calendarTwo') calendarTwo: MatCalendar<Date>;
  @ViewChild('calendarThree') calendarThree: MatCalendar<Date>;
  @ViewChild('calendarFour') calendarFour: MatCalendar<Date>;
  @ViewChild('calendarFive') calendarFive: MatCalendar<Date>;

  private signalRService = inject(SignalRService);
  private dateSelectorService = inject(DateSelectorService);
  private scrollX = inject(ScrollManagerDirective);
  private changeDetectionRef = inject(ChangeDetectorRef)

  baseDate = new Date();

  constructor(
    private dateAdapter: DateAdapter<Date>,
  ) {
    this.dateAdapter.getFirstDayOfWeek = () => 1;
  }
  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view === 'month') {
      cellDate.setHours(0, 0, 0, 0);
      const hourPerDate = this.signalRService.hourPerDate();
      if (hourPerDate.has(cellDate.toISOString())) {
        if (hourPerDate.get(cellDate.toISOString()) >= 20) {
          return 'lc-reserved lc-reserved-full';
        } else if (hourPerDate.get(cellDate.toISOString()) >= 10) {
          return 'lc-reserved lc-reserved-max';
        }
        return 'lc-reserved';
      }
      return 'lc-free';
    }
    return '';
  };

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
    this.calendarOne.activeDate = this.calendarDates[0];
    this.calendarTwo.activeDate = this.calendarDates[1];
    this.calendarThree.activeDate = this.calendarDates[2];
    this.calendarFour.activeDate = this.calendarDates[3];
    this.calendarFive.activeDate = this.calendarDates[4];
  }

  previousMonth($event: MouseEvent) {
    this.baseDate = this.getNewDate(this.baseDate, -1);
    this.updateCalendarDates(this.baseDate);
  }

  nextMonth($event: MouseEvent) {
    this.baseDate = this.getNewDate(this.baseDate, 1);
    this.updateCalendarDates(this.baseDate);
  }

  ngAfterViewInit(): void {
    this.updateCalendarDates(this.baseDate);
  }
}
