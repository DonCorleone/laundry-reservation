import {Component} from '@angular/core';
import {DateSelectorService} from "../services/date-selector.service";
import {MatCardModule} from "@angular/material/card";
import {MatCalendarCellClassFunction, MatCalendarView, MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {SignalRService} from "../services/signalr.service";
import {ScrollAnchorDirective} from "../directives/scroll-anchor.directive";
import {ScrollSectionDirective} from "../directives/scroll-section.directive";
import {ScrollManagerDirective} from "../directives/scroll-manager.directive";

@Component({
  selector: 'app-calendar',
  template: `
    <div class="flex flex-row">
      <!--mat-card class="w-full md:w-80"-->
        <mat-calendar
          class="bg-terre-ombre-brule w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
          [(selected)]="selected"
          [dateClass]="dateClass"
          (selectedChange)="selectionFinished($event)" />
        <mat-calendar
          [startView]="'month'"
          [startAt]="getNextDate(1)"
          class="bg-terre-ombre-brule w-full hidden sm:block sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
          [dateClass]="dateClass"
          (selectedChange)="selectionFinished($event)" />
        <mat-calendar
          [startView]="'month'"
          [startAt]="getNextDate(2)"
          class="bg-terre-ombre-brule w-full hidden md:block sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
          [dateClass]="dateClass"
          (selectedChange)="selectionFinished($event)" />
        <mat-calendar
          [startView]="'month'"
          [startAt]="getNextDate(3)"
          class="bg-terre-ombre-brule w-full hidden lg:block sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
          [dateClass]="dateClass"
          (selectedChange)="selectionFinished($event)" />
        <mat-calendar
          [startView]="'month'"
          [startAt]="getNextDate(4)"
          class="bg-terre-ombre-brule w-full hidden xl:block sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
          [dateClass]="dateClass"
          (selectedChange)="selectionFinished($event)" />
      <!-- /mat-card-->
    </div>
  `,
  standalone: true,
  imports: [MatCardModule, MatDatepickerModule, MatNativeDateModule, ScrollAnchorDirective, ScrollSectionDirective],
})
export class CalendarComponent {
  selected: Date | null;

  constructor(private dateSelectorService: DateSelectorService, private signalRService: SignalRService, private scrollX: ScrollManagerDirective) {}

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

/*  getNextMonth() : MatCalendarView{
    const today = new Date();

    return {

    }

    return new Date(2024,11,1);
  }*/

  selectionFinished(event: Date | null) {
    this.dateSelectorService.setSelectedDate(new Date(event));
    const anchor = new ScrollAnchorDirective(this.scrollX);
    anchor.id = 'timeTable'
    anchor.scroll();
  }

  getNextDate(gap: number): Date {
    const today = new Date();
    const thisMonth = today.getMonth();
    const nextMonth = thisMonth + gap < 11 ? thisMonth + gap : (thisMonth + gap) - 12
    const thisYear = today.getFullYear();
    const nextYear = thisMonth + gap < 11 ? thisYear : thisYear + 1;
    return new Date(nextYear, nextMonth, 1);
  }
}
