import {Component, Input} from '@angular/core';
import {hour} from '../models/hour';
import {DatePipe, NgIf} from "@angular/common";

@Component({
  selector: 'app-hour-header',
  templateUrl: './hour-header.component.html',
  imports: [
    NgIf,
    DatePipe
  ],
  standalone: true
})
export class HourHeaderComponent {
  @Input() hour: hour;
}
