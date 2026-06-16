import {
  ChangeDetectionStrategy,
  Component, effect, inject,
  input, output
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {MatSnackBar} from "@angular/material/snack-bar";
import {IHour} from "../../models/hour";
import {ILaundryUser} from "../../models/user";

@Component({
    selector: 'app-hour',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, FormsModule],
    templateUrl: './hour.component.html'
})
export class HourComponent {
  hour = input.required<IHour>();
  user = input.required<ILaundryUser>();
  selected = output<boolean>();
  private snackBar = inject(MatSnackBar);
  private isProcessing = false;
  private lastClickTime = 0;
  private readonly DEBOUNCE_TIME = 300; // 300ms debounce

  onTap($event: any) {
    const currentTime = Date.now();

    // Debounce rapid clicks
    if (currentTime - this.lastClickTime < this.DEBOUNCE_TIME) {
      return;
    }

    // Prevent multiple processing
    if (this.isProcessing) {
      return;
    }

    this.lastClickTime = currentTime;
    this.isProcessing = true;

    try {
      if (this.hour().selectedBy) {
        // Compare emails (second part after pipe) instead of full key
        const selectedByEmail = this.hour().selectedBy.split('|')[1];
        const currentUserEmail = this.user().key.split('|')[1];

        if (selectedByEmail !== currentUserEmail) {
          this.openSnackBar('This hour is already selected by ' + selectedByEmail);
          return;
        }
        this.hour().selectedBy = null;
        this.selected.emit(false);
      } else {
        this.hour().selectedBy = this.user().key;
        this.selected.emit(true);
      }
    } finally {
      // Reset processing flag after a short delay to allow the API call to complete
      setTimeout(() => {
        this.isProcessing = false;
      }, 500);
    }
  }
  openSnackBar(message: string) {
    this.snackBar.open(message, 'OK', { duration: 1500, verticalPosition: 'top', panelClass: ['lc-snackbar'] });
  }
}
