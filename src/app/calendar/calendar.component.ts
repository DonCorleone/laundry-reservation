import { Component } from '@angular/core';
import {DateSelectorService} from "../services/date-selector.service";

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html'
})
export class CalendarComponent {
  selected: Date | null;

  constructor(private dateSelectorService: DateSelectorService) {
  }

  selectionFinished(event: Date | null) {
    this.dateSelectorService.selectedDate.next(new Date(event));
  }
}
