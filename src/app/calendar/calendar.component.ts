import {Component} from '@angular/core';
import {DateSelectorService} from "../services/date-selector.service";
import {MatCard, MatCardModule} from "@angular/material/card";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
})
export class CalendarComponent {
  selected: Date | null;

  constructor(private dateSelectorService: DateSelectorService) {
  }

  selectionFinished(event: Date | null) {
    this.dateSelectorService.selectedDate.next(new Date(event));
  }
}
