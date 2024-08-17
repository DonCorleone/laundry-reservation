import { Component, Input } from '@angular/core';
import { hour } from '../models/hour';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import {HourService} from "../services/hour.service";

@Component({
  selector: 'app-hour',
  templateUrl: './hour.component.html',
  styles: [],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class HourComponent {
  @Input() hour: hour;

  constructor(private hourService: HourService) {}

  onTap(evt: any) {
    console.log(`tab ${this.hour.begin}-${this.hour.end}`);
    this.hour.selectedBy = this.hour.selectedBy === 'xxx' ? '' : 'xxx'
  }
}
