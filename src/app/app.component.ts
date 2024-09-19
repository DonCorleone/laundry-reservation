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
import {SignalRService} from './services/signalr.service';
import {ReservationEntry} from './models/reservation-entry';
import {ReservationService} from "./services/reservation.service";
import {AuthComponent} from "./auth/auth.component";
import {laundryUser} from "./models/user";

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
  ],
})
export class AppComponent implements OnDestroy, OnInit {

  title = 'laundry';
  readonly CellType = cellType;

  tiles: Tile[] = [];
  color: string = 'black';

  eventText = '';
  private subscription: Subscription;

  laundryUser = signal<laundryUser>(null);

  hourPerDate = this.signalRService.getHourPerDate();
  public reservationEntries: ReservationEntry[];


  constructor(
    private dayService: DayService,
    protected signalRService: SignalRService,
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
    const reservation = {
      id: tile.id,
      name: this.laundryUser().key,
      date: tile.hour.begin.toUTCString(),
      deviceId: tile.machine
    };
    if ($event) {
      this.reservationService.addReservation(reservation);
    } else {
      this.reservationService.deleteReservation(reservation);
    }
  }

  clickHourHeader($event: MouseEvent, hour: hour) {

    // verify if all tiles with the same hour are free or mine
    const isFree = this.tiles
      .filter((t) => t.hour && t.hour.begin.getHours() == hour.begin.getHours())
      .every((t) => t.hour.selectedBy == "" || t.hour.selectedBy == this.laundryUser().key);

    if (isFree) {
      this.tiles
        .filter((t) => t.cellType == cellType.HOUR && t.hour && t.hour.begin.getHours() == hour.begin.getHours())
        .forEach((tile) => {
          this.reservationService.addReservation({
            id: tile.id,
            name: this.laundryUser().key,
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
    const isFree = this.tiles
      .filter((t) => t.cellType == cellType.HOUR && t.machine == machine)
      .every((t) => t.hour.selectedBy == "" || t.hour.selectedBy == this.laundryUser().key);

    if (isFree) {
      this.tiles
        .filter((t) => t.cellType == cellType.HOUR && t.machine == machine)
        .forEach((tile) => {
          this.reservationService.addReservation({
            id: tile.id,
            name: this.laundryUser().key,
            date: tile.hour.begin.toUTCString(),
            deviceId: tile.machine
          });
        });
    } else {
      // Show message to the user
      window.alert('This machine has already any reservations');
    }
  }

  onUsernameChange(user: laundryUser) {
    this.laundryUser.set(user);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
