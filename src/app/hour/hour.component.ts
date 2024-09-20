import {Component, inject, input, Input, output, signal} from '@angular/core';
import {hour} from '../models/hour';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {laundryUser} from "../models/user";
import {MatIcon} from "@angular/material/icon";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-hour',
  template: `
    @if (hour) {
      <div
        [class]="
        hour().selectedBy
          ? 'bg-rouge-rubia text-white'
          : 'bg-vert-clair text-black'
      "
        class="h-full text-center flex justify-center items-center cursor-grab hover:bg-opacity-50"
        (tap)="onTap($event)"
      >
        @if (hour().selectedBy) {
          {{ hour().selectedBy.split('|')[0] }}
        }
      </div>
    }
  `,
  styles: `
  `,
  standalone: true,
  imports: [CommonModule, FormsModule, MatIcon],
})
export class HourComponent {
  hour = input<hour>();
  user = input<laundryUser>();
  selected = output<boolean>();
  private _snackBar = inject(MatSnackBar);
  onTap(evt: any) {
    if (this.hour().selectedBy) {
      if (this.hour().selectedBy != this.user().key) {
        this.openSnackBar('This hour is already selected by ' + this.hour().selectedBy.split('|')[1]);
        return;
      }
      this.hour().selectedBy = null;
      this.selected.emit(false);
    } else {
      this.hour().selectedBy = this.user().key;
      this.selected.emit(true);
    }
  }


  openSnackBar(message: string) {
    this._snackBar.open(message, '', { duration: 1500, verticalPosition: 'top' });
  }
}
