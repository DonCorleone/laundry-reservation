import { Component, Input } from '@angular/core';
import { hour } from '../models/hour';
import { Indicator, IndicatorAnimations } from '../indicator';
import { CommonModule, NgForOf, NgIf } from "@angular/common";
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import {HourService} from "../hour.service";

@Component({
  selector: 'app-hour',
  templateUrl: './hour.component.html',
  styles: [`.gesture__indicator {
    position: fixed;
    top: 0;
    left: 0;
    height: 50px;
    width: 50px;
    display: block;
    border-radius: 50%;
    text-align: center;
    line-height: 45px;
    z-index: 10;
  }`],
  animations: IndicatorAnimations,
  standalone: true,
  imports: [CommonModule, HammerModule, FormsModule]
})
export class HourComponent {
  @Input() hour: hour;

  indicators: Indicator;

  constructor(private hourService: HourService) {
    this.indicators = new Indicator();
  }

  onTap(evt: any) {
   // console.log(`tab ${this.hour.begin}-${this.hour.end}`);
    this.hour.selectedBy = this.hour.selectedBy === 'xxx' ? '' : 'xxx'

/*    const indicator = this.indicators.display(evt.center.x, evt.center.y, 50);
    this.indicators.hide(indicator);*/
  }
  onPan(evt: any) {
 //   console.log(`pan ${this.hour.begin}-${this.hour.end}`);
  }

  onPanDown($event: any){
    this.hour.selectedBy='down';
    this.hourService.panMode = true;
  }

  onPanUp($event: any) {
    this.hour.selectedBy='up';
    this.hourService.panMode = false;
  }

  onEnter($event: MouseEvent) {
    if (this.hourService.panMode){
      this.hour.selectedBy='pan';
    }
  }
}
