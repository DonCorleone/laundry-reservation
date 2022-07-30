import { Component } from '@angular/core';
import {DateRange} from "@angular/material/datepicker";

interface hour {
  start: number;
  end: number;
}

@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.css']
})
export class DayComponent {

  hours: hour[] = [];
  constructor() {
    for (let i = 6; i < 22; i++){
      const h: hour = {
        start: i,
        end: i+1
      }
      this.hours.push(h);
    }
  }

}
