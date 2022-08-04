import { Component } from '@angular/core';
import { hour } from '../models/hour';
import { IndicatorAnimations } from '../indicator';
import { DayService } from '../services/day.service';
import {Observable} from "rxjs";

@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  animations: IndicatorAnimations,
})
export class DayComponent {
  hours$: Observable<hour[]> = this.dayService.hours$;
  constructor(private dayService: DayService) {}
}
