import { Component, input, Input, output, signal } from '@angular/core';
import { hour } from '../models/hour';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-hour',
  template: `
    @if(hour){
    <div
      [class]="
        hour().selectedBy
          ? 'bg-rouge-rubia text-white'
          : 'bg-vert-clair text-black'
      "
      class="h-full text-center flex justify-center items-center cursor-grab hover:bg-opacity-50"
      (tap)="onTap($event)"
    >
      {{ hour().selectedBy }}
    </div>
    }
  `,
  styles: [],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class HourComponent {
  hour = input<hour>();
  user = input<string>();
  selected = output<boolean>();

  onTap(evt: any) {
    if (this.hour().selectedBy) {
      if (this.hour().selectedBy != this.user()) {
        window.alert('You can only delete your own reservations.');
        return;
      }
      this.hour().selectedBy = '';
      this.selected.emit(false);
    } else {
      this.hour().selectedBy = this.user();
      this.selected.emit(true);
    }
  }
}
