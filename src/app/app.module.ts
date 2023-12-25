import { NgModule } from '@angular/core';
import {BrowserModule, HammerModule} from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core'
import {
  MatSidenavModule,
} from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { CalendarComponent } from './calendar/calendar.component';
import { ScrollManagerDirective } from './directives/scroll-manager.directive';
import { ScrollSectionDirective } from './directives/scroll-section.directive';
import { ScrollAnchorDirective } from './directives/scroll-anchor.directive';
import { MatCardModule} from "@angular/material/card";
import {HourHeaderComponent} from "./hour-header/hour-header.component";
import { HourComponent } from "./hour/hour.component";

@NgModule({
    declarations: [AppComponent, ScrollManagerDirective, ScrollSectionDirective, ScrollAnchorDirective],
    providers: [],
    bootstrap: [AppComponent],
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
        HourHeaderComponent,
        HourComponent,
        CalendarComponent
    ]
})
export class AppModule {}
