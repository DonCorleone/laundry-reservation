import { Component, OnDestroy, OnInit, Signal, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { DayService, cellType, Tile } from './services/day.service';
import { hour } from './models/hour';
import { MatGridListModule } from '@angular/material/grid-list';
import { CalendarComponent } from './calendar/calendar.component';
import { ScrollManagerDirective } from './directives/scroll-manager.directive';
import { CommonModule } from '@angular/common';
import { HourHeaderComponent } from './hour-header/hour-header.component';
import { HourComponent } from './hour/hour.component';
import { ScrollSectionDirective } from './directives/scroll-section.directive';
import { ScrollAnchorDirective } from './directives/scroll-anchor.directive';
import { UserComponent } from './user/user.component';
import { SignalRService } from './services/signalr.service';
import { ReservationEntry } from './models/reservation-entry';

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

  reservationEntries!: Signal<ReservationEntry[]>; // Signal to store messages
  title = 'laundry';
  readonly CellType = cellType;

  tiles: Tile[] = [];
  color: string = 'black';

  eventText = '';
  private subscription: Subscription;

  username = signal('');

  constructor(
    private dayService: DayService,
    private signalRService: SignalRService
  ) {
    this.subscription = this.dayService.tiles$.subscribe(
      (x) => (this.tiles = x)
    );
  }

  ngOnInit() {
    this.signalRService.startConnection();
    this.signalRService.addDataListener();

    this.reservationEntries = this.signalRService.getMessages(); 
  }
  onHourSelected($event: boolean, hour: hour) {
    if ($event) {
      this.signalRService.addReservation({id: hour.id, name: this.username(), device: 'Machine 1'});
    } else {
      this.signalRService.deleteReservation({id: hour.id, name: this.username(), device: 'Machine 1'});
    }
  }

  clickHourHeader($event: MouseEvent, hour: hour) {
    this.tiles
      .filter((t) => t.hour?.begin.getHours() == hour.begin.getHours())
      .forEach((t) => {
        t.hour.selectedBy = this.username();
        console.log(hour.end, hour.begin, hour.selectedBy);
      });
  }

  clickMachineColumn($event: MouseEvent, machine: string) {
    this.tiles
      .filter((t) => t.hour && t.machine == machine)
      .forEach((t) => {
        t.hour.selectedBy = this.username();
        console.log(t.hour.end, t.hour.begin, t.hour.selectedBy);
      });
  }

  onUsernameChange(newUsername: string) {
    this.username.set(newUsername);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
