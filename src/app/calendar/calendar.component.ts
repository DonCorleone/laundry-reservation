import { Component } from '@angular/core';
import {DateSelectorService} from "../services/date-selector.service";

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html'
})
export class CalendarComponent {

  constructor(private dateSelectorService: DateSelectorService) {
  }

  selectionFinished(event: any) {
    this.dateSelectorService.selectedDate.next(new Date(event.value));
  }
}
