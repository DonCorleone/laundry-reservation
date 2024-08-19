import { Component, Input } from '@angular/core';
import { hour } from '../models/hour';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hour',
  template: `
    @if(hour){
    <div
      [class]="
        hour.selectedBy
          ? 'bg-rouge-rubia text-white'
          : 'bg-vert-clair text-black'
      "
      class="h-full text-center flex justify-center items-center cursor-grab hover:bg-opacity-50"
      (tap)="onTap($event)"
    >
      {{ hour.selectedBy }}
    </div>
    }
  `,
  styles: [],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class HourComponent {
  @Input() hour: hour;

  onTap(evt: any) {
    if (this.hour.selectedBy) {
      console.log(`unreserve ${this.hour.begin}-${this.hour.end}`);
      this.hour.selectedBy = '';
    } else {
      console.log(`reserve ${this.hour.begin}-${this.hour.end}`);
      this.hour.selectedBy = 'xxx';
    }
  }
}
