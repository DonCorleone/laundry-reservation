import {Component, inject, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatIcon} from "@angular/material/icon";
import {MatSnackBar} from "@angular/material/snack-bar";
import {IHour} from "../models/hour";
import {ILaundryUser} from "../models/user";

@Component({
  selector: 'app-hour',
  template: `
    @if (hour) {
      @let isFree = !hour().selectedBy;
      @let isMine = hour().selectedBy == user().key;
      <div
        [class]="
        hour().selectedBy
          ? 'bg-rouge-rubia text-white'
          : 'bg-vert-clair text-black'
        "
        [ngClass]="{'cursor-all-scroll': isMine, 'cursor-cell': isFree, 'cursor-help': !isMine && !isFree}"
        class="h-full text-center flex justify-center items-center hover:bg-opacity-50"
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
  hour = input<IHour>();
  user = input<ILaundryUser>();
  selected = output<boolean>();
  private _snackBar = inject(MatSnackBar);
  onTap($event: any) {
    console.log($event);
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
