import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal} from '@angular/core';
import {MatGridListModule} from '@angular/material/grid-list';
import {CalendarComponent} from './components/calendar/calendar.component';
import {ScrollManagerDirective} from './directives/scroll-manager.directive';
import {CommonModule} from '@angular/common';
import {ScrollSectionDirective} from './directives/scroll-section.directive';
import {SignalRService} from './services/signalr.service';
import {AuthComponent} from "./components/auth/auth.component";
import {MatIconRegistry} from "@angular/material/icon";
import {ILaundryUser} from "./models/user";
import {TilesComponent} from "./components/tiles/tiles.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ScrollSectionDirective, ScrollManagerDirective],
    imports: [
        CommonModule,
        CalendarComponent,
        MatGridListModule,
        ScrollSectionDirective,
        ScrollManagerDirective,
        AuthComponent,
        TilesComponent,
    ]
})
export class AppComponent implements OnInit {

  protected laundryUser = signal<ILaundryUser>(null);
  protected signalRService = inject(SignalRService);
  private matIconReg = inject(MatIconRegistry);
  private changeDetectionRef = inject(ChangeDetectorRef);

  ngOnInit() {
    this.matIconReg.setDefaultFontSetClass('material-symbols-outlined');
    this.signalRService.startConnection();
    this.signalRService.addDataListener();
  }

  onUsernameChange(user: ILaundryUser) {
    this.laundryUser.set(user);
    this.changeDetectionRef.detectChanges()
  }
}
