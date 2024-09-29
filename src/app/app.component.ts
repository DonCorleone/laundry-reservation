import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {combineLatest} from 'rxjs';
import {MatGridListModule} from '@angular/material/grid-list';
import {CalendarComponent} from './calendar/calendar.component';
import {ScrollManagerDirective} from './directives/scroll-manager.directive';
import {CommonModule} from '@angular/common';
import {HourHeaderComponent} from './hour-header/hour-header.component';
import {HourComponent} from './hour/hour.component';
import {ScrollSectionDirective} from './directives/scroll-section.directive';
import {ScrollAnchorDirective} from './directives/scroll-anchor.directive';
import {SignalRService} from './services/signalr.service';
import {ReservationService} from "./services/reservation.service";
import {AuthComponent} from "./auth/auth.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatIcon, MatIconRegistry} from "@angular/material/icon";
import {IReservation} from "./models/reservation";
import {ILaundryUser} from "./models/user";
import {IHour} from "./models/hour";
import {SubjectService} from "./services/subject.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ISubject} from "./models/subject";
import {cellType, TileService} from "./services/tile.service";
import {Tile} from "./models/tile";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  providers: [ScrollSectionDirective, ScrollManagerDirective],
  imports: [
    CommonModule,
    CalendarComponent,
    MatGridListModule,
    HourHeaderComponent,
    HourComponent,
    ScrollSectionDirective,
    ScrollAnchorDirective,
    ScrollManagerDirective,
    AuthComponent,
    MatIcon,
  ],
})
export class AppComponent implements OnInit {

  readonly CellType = cellType;

  tiles: Tile[] = [];
  color: string = 'black';

  laundryUser = signal<ILaundryUser>(null);
  public reservationEntries: IReservation[];

  private _snackBar = inject(MatSnackBar);
  protected colsAmount: number = 0;
  private destroyRef = inject(DestroyRef);

  constructor(
    private tileService: TileService,
    protected signalRService: SignalRService,
    protected reservationService: ReservationService,
    private matIconReg: MatIconRegistry,
    private subjectService: SubjectService
) {}

  ngOnInit() {
    this.matIconReg.setDefaultFontSetClass('material-symbols-outlined');

    combineLatest([
      this.tileService.tiles$,
      this.subjectService.subjects$,
      this.reservationService.getReservations()
    ]).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([tiles, subjects, reservations]) => {
        this.tiles = tiles;
        this.colsAmount = subjects.length > 3 ? subjects.length + 2 : subjects.length + 1;
        this.signalRService.setMessages(reservations);
        this.reservationEntries = reservations;
      });

    this.signalRService.startConnection();
    this.signalRService.addDataListener();
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

  openSnackBar(message: string, position: 'top' | 'bottom' = 'top') {
    this._snackBar.open(message, '', { duration: 1500, verticalPosition: position });
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

  clickSubjectIcon($event: MouseEvent, subject: ISubject) {
    console.log($event);
    this.openSnackBar(subject.name, 'bottom');
  }

  onUsernameChange(user: ILaundryUser) {
    this.laundryUser.set(user);
  }
}
