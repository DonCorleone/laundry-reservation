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
  templateUrl: './hour.component.html',
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
    this._snackBar.open(message, 'OK', { duration: 150000, verticalPosition: 'top', panelClass: ['lc-snackbar'] });
  }
}
