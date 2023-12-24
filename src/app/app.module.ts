import { NgModule } from '@angular/core';
import {BrowserModule, HammerModule} from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core'
import {
  MatSidenavContainer,
  MatSidenavModule,
} from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { HourComponent } from './hour/hour.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ScrollManagerDirective } from './directives/scroll-manager.directive';
import { ScrollSectionDirective } from './directives/scroll-section.directive';
import { ScrollAnchorDirective } from './directives/scroll-anchor.directive';
import { MatCardModule} from "@angular/material/card";
import {HourHeaderComponent} from "./hour-header/hour-header.component";

@NgModule({
  declarations: [AppComponent, HourComponent, CalendarComponent, ScrollManagerDirective, ScrollSectionDirective, ScrollAnchorDirective],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatGridListModule,
    FormsModule,
    MatCardModule,
    MatRippleModule,
    MatSidenavModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    HammerModule,
    HourHeaderComponent
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
