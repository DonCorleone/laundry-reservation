import {
  ChangeDetectionStrategy,
  Component, inject,
  input, output
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatIcon} from "@angular/material/icon";
import {MatSnackBar} from "@angular/material/snack-bar";
import {IHour} from "../../models/hour";
import {ILaundryUser} from "../../models/user";

@Component({
  selector: 'app-hour',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatIcon],
  template: `
    @if (hour) {
      @let isFree = !hour().selectedBy;
      @let isMine = hour().selectedBy == user().key;
      @let bgColor = isFree ? 'bg-vert-anglais-pale' : isMine ? 'bg-vert-anglais' : 'bg-vert-anglais-claire';
      @let textColor = isFree ? 'text-terre-ombre-brule' : 'text-blanc';
      <div
        [class]="bgColor + ' ' + textColor"
        [ngClass]="{'cursor-all-scroll': isMine, 'cursor-cell': isFree, 'cursor-help': !isMine && !isFree}"
        class="flex justify-center items-center h-full hover:bg-opacity-50"
        (tap)="onTap($event)"
      >
        @if (hour().selectedBy) {
          {{ hour().selectedBy.split('|')[0] }}
        }
      </div>
    }
  `,
})
export class HourComponent {
  hour = input.required<IHour>();
  user = input.required<ILaundryUser>();

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
