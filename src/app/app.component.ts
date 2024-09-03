import {Component, OnDestroy, OnInit, Signal, signal} from '@angular/core';
import {map, Subscription} from 'rxjs';
import {DayService, cellType, Tile} from './services/day.service';
import {hour} from './models/hour';
import {MatGridListModule} from '@angular/material/grid-list';
import {CalendarComponent} from './calendar/calendar.component';
import {ScrollManagerDirective} from './directives/scroll-manager.directive';
import {CommonModule} from '@angular/common';
import {HourHeaderComponent} from './hour-header/hour-header.component';
import {HourComponent} from './hour/hour.component';
import {ScrollSectionDirective} from './directives/scroll-section.directive';
import {ScrollAnchorDirective} from './directives/scroll-anchor.directive';
import {UserComponent} from './user/user.component';
import {SignalRService} from './services/signalr.service';
import {ReservationEntry} from './models/reservation-entry';
import {ReservationService} from "./services/reservation.service";

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
    UserComponent,
  ],
})
export class AppComponent implements OnDestroy, OnInit {

  title = 'laundry';
  readonly CellType = cellType;

  tiles: Tile[] = [];
  color: string = 'black';

  eventText = '';
  private subscription: Subscription;

  username = signal('');

  hourPerDate = this.signalRService.getHourPerDate();
  public reservationEntries: ReservationEntry[];


  constructor(
    private dayService: DayService,
    private signalRService: SignalRService,
    protected reservationService: ReservationService
  ) {
    this.subscription = this.dayService.tiles$.subscribe(
      (x) => (this.tiles = x)
    );
  }

  ngOnInit() {
   this.reservationService.getReservations().subscribe((reservations) => {
      this.signalRService.setMessages(reservations);
     this.reservationEntries = reservations;
    });
    this.signalRService.startConnection();
    this.signalRService.addDataListener();
  }

  onHourSelected($event: boolean, tile: Tile) {
    if ($event) {
      this.reservationService.addReservation({
        id: tile.id,
        name: this.username(),
        date: tile.hour.begin.toUTCString(),
        deviceId: tile.machine
      });
    } else {
      this.reservationService.deleteReservation({
        id: tile.id,
        name: this.username(),
        date: tile.hour.begin.toUTCString(),
        deviceId: tile.machine
      });
    }
  }

  clickHourHeader($event: MouseEvent, hour: hour) {
    // count all tiles with the same hour and find one which is not free
    // if there is no such tile, then all tiles are free
    // if there is such tile, then all tiles are not free
    const notFree = this.tiles
      .filter((t) => t.hour && t.hour.begin.getHours() == hour.begin.getHours())
      .some((t) => t.hour.selectedBy != "");

    if (!notFree) {
      this.tiles
        .filter((t) => t.cellType == cellType.HOUR &&  t.hour && t.hour.begin.getHours() == hour.begin.getHours())
        .forEach((tile) => {
          this.reservationService.addReservation({
            id: tile.id,
            name: this.username(),
            date: tile.hour.begin.toUTCString(),
            deviceId: tile.machine
          });
        });
    } else {
      // Show message to the user
      window.alert('This hour has already any reservations');
    }
  }

  clickMachineColumn($event: MouseEvent, machine: string) {
    // count all tiles with the same machine and find one which is not free
    // if there is no such tile, then all tiles are free
    // if there is such tile, then all tiles are not free
    const notFree = this.tiles
      .filter((t) => t.cellType == cellType.HOUR && t.machine == machine)
      .some((t) => t.hour?.selectedBy != "");

    if (!notFree) {
      this.tiles
        .filter((t) => t.cellType == cellType.HOUR && t.machine == machine)
        .forEach((tile) => {
          this.reservationService.addReservation({
            id: tile.id,
            name: this.username(),
            date: tile.hour.begin.toUTCString(),
            deviceId: tile.machine
          });
        });
    } else {
      // Show message to the user
      window.alert('This machine has already any reservations');
    }
  }

  onUsernameChange(newUsername: string) {
    this.username.set(newUsername);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
