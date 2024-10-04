import {Component, DestroyRef, inject, input, OnInit, signal} from '@angular/core';
import {HourComponent} from "../hour/hour.component";
import {HourHeaderComponent} from "../hour-header/hour-header.component";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatIcon, MatIconRegistry} from "@angular/material/icon";
import {ScrollAnchorDirective} from "../../directives/scroll-anchor.directive";
import {ScrollSectionDirective} from "../../directives/scroll-section.directive";
import {cellType, TileService} from "../../services/tile.service";
import {ISubject} from "../../models/subject";
import {Tile} from "../../models/tile";
import {IHour} from "../../models/hour";
import {MatSnackBar} from "@angular/material/snack-bar";
import {combineLatest} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SignalRService} from "../../services/signalr.service";
import {ReservationService} from "../../services/reservation.service";
import {SubjectService} from "../../services/subject.service";
import {ILaundryUser} from "../../models/user";

@Component({
  selector: 'app-tiles',
  standalone: true,
  imports: [
    HourComponent,
    HourHeaderComponent,
    MatGridList,
    MatGridTile,
    MatIcon,
    ScrollAnchorDirective,
    ScrollSectionDirective
  ],
  templateUrl: './tiles.component.html',
  styles: ``
})
export class TilesComponent implements OnInit{

  laundryUser = input<ILaundryUser>();
  tiles: Tile[] = [];

  protected readonly CellType = cellType;
  protected colsAmount: number = 0;

  private _snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  constructor(
    private tileService: TileService,
    protected signalRService: SignalRService,
    protected reservationService: ReservationService,
    private matIconReg: MatIconRegistry,
    private subjectService: SubjectService,
  ) {
    this.matIconReg.registerFontClassAlias('fontawesome', 'fa');
  }
  clickMachineColumn($event: MouseEvent, subject: ISubject) {
    console.log($event);
    const isFree = this.tiles
      .filter((t) => t.cellType == cellType.HOUR && t.subject.key == subject.key)
      .every((t) => t.hour.selectedBy == "" || t.hour.selectedBy == this.laundryUser().key);

    if (isFree) {
      this.tiles
        .filter((t) => t.cellType == cellType.HOUR && t.subject.key == subject.key)
        .forEach((tile) => {
          tile.hour.selectedBy = this.laundryUser().key;
          this.reservationService.addReservation({
            id: tile.id,
            name: this.laundryUser().key,
            date: tile.hour.begin.toUTCString(),
            deviceId: tile.subject.key,
            connectionId: this.signalRService.connectionId
          },);
        });
    } else {
      // Show message to the user
      this.openSnackBar('This machine has already any reservations');
    }
  }

  onHourSelected($event: boolean, tile: Tile) {
    const reservation = {
      id: tile.id,
      name: this.laundryUser().key,
      date: tile.hour.begin.toUTCString(),
      deviceId: tile.subject.key,
      connectionId: this.signalRService.connectionId
    };
    if ($event) {
      this.reservationService.addReservation(reservation);
    } else {
      this.reservationService.deleteReservation(reservation);
    }
  }

  clickHourHeader($event: MouseEvent, hour: IHour) {
    console.log($event);
    // verify if all tiles with the same hour are free or mine
    const isFree = this.tiles
      .filter((t) => t.hour && t.hour.begin.getHours() == hour.begin.getHours())
      .every((t) => t.hour.selectedBy == "" || t.hour.selectedBy == this.laundryUser().key);

    if (isFree) {
      this.tiles
        .filter((t) => t.cellType == cellType.HOUR && t.hour && t.hour.begin.getHours() == hour.begin.getHours())
        .forEach((tile) => {

          tile.hour.selectedBy = this.laundryUser().key;
          this.reservationService.addReservation({
            id: tile.id,
            name: this.laundryUser().key,
            date: tile.hour.begin.toUTCString(),
            deviceId: tile.subject.key,
            connectionId: this.signalRService.connectionId
          },);
        });
    } else {
      // Show message to the user
      this.openSnackBar('This hour has already any reservations');
    }
  }

  clickSubjectIcon($event: MouseEvent, subject: ISubject) {
    console.log($event);
    this.openSnackBar(subject.name, 'bottom');
  }
  private openSnackBar(message: string, position: 'top' | 'bottom' = 'top') {
    this._snackBar.open(message, '', { duration: 1500, verticalPosition: position });
  }

  ngOnInit(): void {
    combineLatest([
      this.tileService.tiles$,
      this.subjectService.subjects$,
      this.reservationService.getReservations()
    ]).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([tiles, subjects, reservations]) => {
        this.tiles = tiles;
        this.colsAmount = subjects.length > 3 ? subjects.length + 2 : subjects.length + 1;
        this.signalRService.setMessages(reservations);
     //   this.reservationEntries = reservations;
      });
  }
}
