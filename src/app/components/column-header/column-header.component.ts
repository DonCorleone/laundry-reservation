import {ChangeDetectorRef, Component, effect, EventEmitter, inject, Input, input, output, Output} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {ISubject} from "../../models/subject";
import {cellType} from "../../services/tile.service";
import {IDialogData} from "../../models/dialog-data";
import {MatRipple} from "@angular/material/core";
import {Tile} from "../../models/tile";
import {ILaundryUser} from "../../models/user";
import {ReservationService} from "../../services/reservation.service";
import {SignalRService} from "../../services/signalr.service";
import {SubjectInfoComponent} from "../subject-info/subject-info.component";
import {Dialog} from "@angular/cdk/dialog";

@Component({
  selector: 'app-column-header',
  imports: [
    MatIcon,
    MatRipple
  ],
  templateUrl: './column-header.component.html',
})
export class ColumnHeaderComponent {

  tile = input.required<Tile>();
  subject = input.required<ISubject>();

  machineColumnClicked = output();

  private dialog = inject(Dialog);

  constructor() {
    effect(() => {
      console.log(`The effected columnheader is: ${this.tile().id}`);
    });
  }


  protected clickMachineColumn($event: MouseEvent) {
    this.machineColumnClicked.emit();
  }

  protected clickSubjectIcon($event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();
    const data: IDialogData = {
      body: this.subject().name,
      imageUrl: this.subject().image
    }
    this.openDialog(data);
  }

  private openDialog(data: IDialogData) {
    const ref = this.dialog.open(
      SubjectInfoComponent, {
        minWidth: '300px',
        data,
      });
  }
}
