import {Component} from '@angular/core';
import {DateSelectorService} from "../services/date-selector.service";
import {MatCardModule} from "@angular/material/card";
import {MatCalendarCellClassFunction, MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {SignalRService} from "../services/signalr.service";

@Component({
  selector: 'app-calendar',
  template: `
    <mat-card class="w-full md:w-80">
      <mat-calendar
        [(selected)]="selected"
        [dateClass]="dateClass"
        (selectedChange)="selectionFinished($event)" />
    </mat-card>
  `,
  standalone: true,
  imports: [MatCardModule, MatDatepickerModule, MatNativeDateModule],
})
export class CalendarComponent {
  selected: Date | null;

  constructor(private dateSelectorService: DateSelectorService, private signalRService: SignalRService) {}

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
  }
}
