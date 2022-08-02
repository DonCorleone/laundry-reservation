import { Component } from '@angular/core';
import { Indicator, IndicatorAnimations } from './indicator';
export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: IndicatorAnimations
})
export class AppComponent {
/*  title = 'laundry';
  tiles: Tile[] = [
    {text: 'One', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Two', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Three', cols: 1, rows: 1, color: 'lightpink'},
    {text: 'Four', cols: 2, rows: 1, color: '#DDBDF1'},
  ];

  centered = false;
  disabled = false;
  unbounded = false;

  radius: number = 0;
  color: string = 'black';
 */
  eventText = '';
  indicators;

  constructor() {
    this.indicators = new Indicator();
  }
  onPan(evt: any)
  {
    this.eventText += `(${evt.center.x}, ${evt.center.y})<br/>`;
    const indicator = this.indicators.display(
      evt.center.x,
      evt.center.y,
      50
    );
    this.indicators.hide(indicator);
  }

  onTap(evt) {
    this.eventText += `(${evt.center.x}, ${evt.center.y})<br/>`;
    const indicator = this.indicators.display(
      evt.center.x,
      evt.center.y,
      50
    );
    this.indicators.hide(indicator);
  }
}
