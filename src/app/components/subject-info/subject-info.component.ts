import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { NgOptimizedImage } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { MatProgressBar } from "@angular/material/progress-bar";
@Component({
  selector: 'app-subject-info',
  standalone: true,
  imports: [
    NgOptimizedImage,
    MatIcon,
    MatIconButton,
    MatProgressBar
  ],
  template: `
    <button mat-icon-button aria-label="close" (click)="dialogRef.close()">
      <mat-icon>close</mat-icon>
    </button>
    <mat-progress-bar #progressBar mode="buffer" class="py-5"/>
    <p>{{ data.body }}</p>
    @if (data.imageUrl) {
      <img [src]="data.imageUrl" [alt]="data.title" height="auto" width="300px"/>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      background: #fff;
      color: #4c423d;
      border-radius: 8px;
      padding: 8px 16px;
      text-align: center;
    }
    p {
      padding-bottom: 16px;
    }
    button {
      place-self: flex-end;
    }
  `
})
export class SubjectInfoComponent implements OnInit {

  private readonly timeOut: number = 2500;
  dialogRef = inject<DialogRef<string>>(DialogRef<string>);
  data = inject(DIALOG_DATA);
  @ViewChild('progressBar', { static: true }) progressBar!: MatProgressBar;

  ngOnInit(): void {
    setTimeout(() => {
      this.dialogRef.close();
    }, this.timeOut);
  }
}
