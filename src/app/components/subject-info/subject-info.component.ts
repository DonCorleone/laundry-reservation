import { Component, inject, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { NgOptimizedImage } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { MatProgressBar } from "@angular/material/progress-bar";
import { AnimationBuilder, AnimationFactory, animate, style } from '@angular/animations';

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
    <mat-progress-bar #progressBar mode="determinate" [value]="counter" />
    <button mat-icon-button aria-label="close" (click)="dialogRef.close()">
      <mat-icon>close</mat-icon>
    </button>
    <p>{{ data.body }}</p>
    <img [src]="data.imageUrl" [alt]="data.title" height="auto" width="300px"/>
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
export class SubjectInfoComponent implements OnInit, AfterViewInit {

  private readonly timeOut: number = 2500;
  dialogRef = inject<DialogRef<string>>(DialogRef<string>);
  counter = 100;
  data = inject(DIALOG_DATA);
  @ViewChild('progressBar', { static: true }) progressBar!: MatProgressBar;

  private animationBuilder = inject(AnimationBuilder);

  ngOnInit(): void {
    setTimeout(() => {
      this.dialogRef.close();
    }, this.timeOut);
  }

  ngAfterViewInit(): void {
    const animation: AnimationFactory = this.animationBuilder.build([
      style({ width: '100%' }),
      animate(this.timeOut + 'ms ease-out', style({ width: '0%' }))
    ]);

    const player = animation.create(this.progressBar._elementRef.nativeElement);
    player.play();
  }
}
