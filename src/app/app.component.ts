import {Component, OnInit, signal, ViewChild} from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {CalendarComponent} from './components/calendar/calendar.component';
import {ScrollManagerDirective} from './directives/scroll-manager.directive';
import {CommonModule} from '@angular/common';
import {HourHeaderComponent} from './components/hour-header/hour-header.component';
import {HourComponent} from './components/hour/hour.component';
import {ScrollSectionDirective} from './directives/scroll-section.directive';
import {ScrollAnchorDirective} from './directives/scroll-anchor.directive';
import {SignalRService} from './services/signalr.service';
import {AuthComponent} from "./components/auth/auth.component";
import {MatIcon, MatIconRegistry} from "@angular/material/icon";
import {IReservation} from "./models/reservation";
import {ILaundryUser} from "./models/user";
import {TilesComponent} from "./components/tiles/tiles.component";
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
    TilesComponent,
  ],
})
export class AppComponent implements OnInit {

  laundryUser = signal<ILaundryUser>(null);
  color: string = 'black';

  public reservationEntries: IReservation[];


  @ViewChild('gridList') timeTableRef: any;

  constructor(
    protected signalRService: SignalRService,
    private matIconReg: MatIconRegistry
  ) {

  }

  ngOnInit() {
    this.matIconReg.setDefaultFontSetClass('material-symbols-outlined');

    this.signalRService.startConnection();
    this.signalRService.addDataListener();
  }

  onUsernameChange(user: ILaundryUser) {
    this.laundryUser.set(user);
  }
}
