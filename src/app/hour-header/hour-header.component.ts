import { Component, Input } from '@angular/core';
import { hour } from '../models/hour';

@Component({
  selector: 'app-hour-header',
  templateUrl: './hour-header.component.html',
})
export class HourHeaderComponent {
  @Input() hour: hour;
}
