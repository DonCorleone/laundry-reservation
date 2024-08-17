import {Component, Input} from '@angular/core';
import {hour} from '../models/hour';
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-hour-header',
  templateUrl: './hour-header.component.html',
  imports: [
    DatePipe
  ],
  standalone: true
})
export class HourHeaderComponent {
  @Input() hour: hour;
}
