import { Component, output, signal, Signal } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [MatFormField, MatInput, MatLabel, FormsModule],
  template: `
    <mat-form-field class="w-full">
      <input matInput type="text" value="" (input)="onUsernameChange($event)" />
    </mat-form-field>
  `,
})
export class UserComponent {
  value = output<string>();

  onUsernameChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value.emit(input.value);
  }
}
