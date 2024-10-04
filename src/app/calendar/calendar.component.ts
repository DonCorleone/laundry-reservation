import {Component, OnInit, ViewChild} from '@angular/core';
import {DateSelectorService} from "../services/date-selector.service";
import {MatCardModule} from "@angular/material/card";
import {
  MatCalendar,
  MatCalendarCellClassFunction,
  MatCalendarView,
  MatDatepickerModule
} from "@angular/material/datepicker";
import {MatNativeDateModule, MatRipple} from "@angular/material/core";
import {SignalRService} from "../services/signalr.service";
import {ScrollAnchorDirective} from "../directives/scroll-anchor.directive";
import {ScrollSectionDirective} from "../directives/scroll-section.directive";
import {ScrollManagerDirective} from "../directives/scroll-manager.directive";
import {MatIcon} from "@angular/material/icon";


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styles: ``,
  standalone: true,
  imports: [MatCardModule, MatDatepickerModule, MatNativeDateModule, ScrollAnchorDirective, ScrollSectionDirective, MatRipple, MatIcon],
})
export class CalendarComponent implements OnInit{
  selected: Date | null;
  baseDate: Date;

  @ViewChild('calendarOne') calendarOne: MatCalendar<Date>;
  @ViewChild('calendarTwo') calendarTwo: MatCalendar<Date>;
  @ViewChild('calendarThree') calendarThree: MatCalendar<Date>;
  @ViewChild('calendarFour') calendarFour: MatCalendar<Date>;
  @ViewChild('calendarFive') calendarFive: MatCalendar<Date>;

  constructor(private dateSelectorService: DateSelectorService, private signalRService: SignalRService, private scrollX: ScrollManagerDirective) {}

  ngOnInit(): void {
   this.baseDate = new Date();
  }

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Only apply to month view
    if (view === 'month') {
      cellDate.setHours(0, 0, 0, 0);
      // if date has a reservation, apply special-date class
      // if it has 10 or more reservations, apply special-date-max class
      // if it has 20 or more reservations, apply special-date-full class
      const hourPerDate = this.signalRService.hourPerDate();
      if (hourPerDate.has(cellDate.toISOString())) {
        if (hourPerDate.get(cellDate.toISOString()) >= 20) {
          return 'reserved reserved-full';
        } else if (hourPerDate.get(cellDate.toISOString()) >= 10) {
          return 'reserved reserved-max';
        }
        return 'reserved';
      }
      //
    }
    return '';
  };

  selectionFinished(event: Date | null) {
    this.dateSelectorService.setSelectedDate(new Date(event));
    const anchor = new ScrollAnchorDirective(this.scrollX);
    anchor.id = 'timeTable'
    anchor.scroll();
  }

  getNewDate(date: Date, gap: number): Date {
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
    const nextMonth = currentMonth + gap < 11 ? currentMonth + gap : (currentMonth + gap) - 12
    const nextYear = currentMonth + gap < 11 ? currentYear : currentYear + 1;
    return new Date(nextYear, nextMonth, 1);
  }
  previousMonth($event: MouseEvent) {
    this.baseDate = this.getNewDate(this.baseDate, -1);
    this.calendarOne.activeDate = this.baseDate;
    this.calendarTwo.activeDate = this.getNewDate(this.baseDate, + 1);
    this.calendarThree.activeDate = this.getNewDate(this.baseDate, + 2);
    this.calendarFour.activeDate = this.getNewDate(this.baseDate, + 3);
    this.calendarFive.activeDate = this.getNewDate(this.baseDate, + 4);
  }
  nextMonth($event: MouseEvent) {
    this.baseDate = this.getNewDate(this.baseDate, 1);
    this.calendarOne.activeDate = this.baseDate;
    this.calendarTwo.activeDate = this.getNewDate(this.baseDate, 1);
    this.calendarThree.activeDate = this.getNewDate(this.baseDate, 2);
    this.calendarFour.activeDate = this.getNewDate(this.baseDate, 3);
    this.calendarFive.activeDate = this.getNewDate(this.baseDate, 4);
  }
}
