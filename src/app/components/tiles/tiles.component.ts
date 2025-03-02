import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, input, OnInit} from '@angular/core';
import {HourComponent} from "../hour/hour.component";
import {HourHeaderComponent} from "../hour-header/hour-header.component";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatIcon, MatIconRegistry} from "@angular/material/icon";
import {ScrollAnchorDirective} from "../../directives/scroll-anchor.directive";
import {ScrollSectionDirective} from "../../directives/scroll-section.directive";
import {cellType, TileService} from "../../services/tile.service";
import {Tile} from "../../models/tile";
import {IHour} from "../../models/hour";
import {combineLatest, take} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SignalRService} from "../../services/signalr.service";
import {ReservationService} from "../../services/reservation.service";
import {SubjectService} from "../../services/subject.service";
import {ILaundryUser} from "../../models/user";
import {Dialog} from "@angular/cdk/dialog";
import {SubjectInfoComponent} from "../subject-info/subject-info.component";
import {IDialogData} from 'src/app/models/dialog-data';
import {MatRipple} from "@angular/material/core";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {LegendComponent} from "../legend/legend.component";
import {ColumnHeaderComponent} from "../column-header/column-header.component";

@Component({
  selector: 'app-tiles',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HourComponent,
    HourHeaderComponent,
    MatGridList,
    MatGridTile,
    MatIcon,
    ScrollAnchorDirective,
    ScrollSectionDirective,
    MatRipple,
    LegendComponent,
    ColumnHeaderComponent,
    ColumnHeaderComponent
  ],
  templateUrl: './tiles.component.html'
})
export class TilesComponent implements OnInit {

  laundryUser = input<ILaundryUser>();
  tiles: Tile[] = [];

  protected readonly CellType = cellType;
  protected colsAmount: number = 0;

  private destroyRef = inject(DestroyRef);
  private dialog = inject(Dialog);
  private isDesktop: boolean;

  private tileService = inject(TileService);
  private signalRService = inject(SignalRService);
  private reservationService = inject(ReservationService);
  private subjectService = inject(SubjectService);
  private changeDetectionRef = inject(ChangeDetectorRef);

  constructor() {
    inject(MatIconRegistry).registerFontClassAlias('fontawesome', 'fa');
    inject(BreakpointObserver)
      .observe([
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge,
      ])
      .pipe(takeUntilDestroyed())
      .subscribe(result => {
        this.isDesktop = result.matches;
      });
  }

  ngOnInit(): void {

    this.reservationService.getReservations().pipe(take(1)).subscribe(x => this.signalRService.setReservations(x))
    combineLatest([
      this.tileService.tiles$,
      this.subjectService.subjects$
    ]).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([tiles, subjects]) => {
        if (!subjects) {
          return;
        }
        this.tiles = tiles;
        const colSpanRowHeader = (this.isDesktop || subjects.length < 4) ? 1 : 2;
        this.colsAmount = subjects.length + colSpanRowHeader;
        this.changeDetectionRef.markForCheck();
      });
  }

  protected onHourSelected($event: boolean, tile: Tile) {
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
    this.changeDetectionRef.markForCheck();
  }

  private handleReservation(tile: Tile, user: string) {
    if (user) {
      if (tile.hour.selectedBy == user) {
        return;
      }
      tile.hour.selectedBy = user;
      this.reservationService.addReservation({
        id: tile.id,
        name: this.laundryUser().key,
        date: tile.hour.begin.toUTCString(),
        deviceId: tile.subject.key,
        connectionId: this.signalRService.connectionId
      });
    } else {
      if (tile.hour.selectedBy == user) {
        return;
      }
      tile.hour.selectedBy = user;
      this.reservationService.deleteReservation({
        id: tile.id,
        name: this.laundryUser().key,
        date: tile.hour.begin.toUTCString(),
        deviceId: tile.subject.key,
        connectionId: this.signalRService.connectionId
      })
    }
  }

  protected clickMachineColumn(tile: Tile) {
    const isFreeOrMine = this.tiles
      .filter((t) => t.cellType == cellType.HOUR && t.subject && t.subject.key == tile.subject.key)
      .every((t) => t.hour.selectedBy == "" || t.hour.selectedBy == this.laundryUser().key);

    if (isFreeOrMine) {
      const sameMachine = this.tiles.filter((t) => t.cellType == cellType.HOUR && t.subject && t.subject.key == tile.subject.key);
      const allFree = sameMachine.every((t) => t.hour.selectedBy == "");
      const user = allFree ? this.laundryUser().key : "";
      sameMachine.forEach((t) => this.handleReservation(t, user));
      this.changeDetectionRef.markForCheck();
    } else {
      // Show message to the user
      const data: IDialogData = {
        body: 'This machine has already any reservations',
      }
      this.openDialog(data);
    }
  }

  protected clickHourHeader($event: MouseEvent, hour: IHour) {
    // verify if all tiles with the same hour are free or mine
    const isFreeOrMine = this.tiles
      .filter((t) => t.cellType == cellType.HOUR && t.hour && t.hour.begin.getHours() == hour.begin.getHours())
      .every((t) => t.hour.selectedBy == "" || t.hour.selectedBy == this.laundryUser().key);

    if (isFreeOrMine) {
      const sameHour = this.tiles.filter((t) => t.cellType == cellType.HOUR && t.hour && t.hour.begin.getHours() == hour.begin.getHours());
      const allFree = sameHour.every((t) => t.hour.selectedBy == "");
      const user = allFree ? this.laundryUser().key : "";
      sameHour.forEach((t) => this.handleReservation(t, user));
      this.changeDetectionRef.markForCheck();
    } else {
      const data: IDialogData = {
        body: 'This hour has already any reservations',
      }
      this.openDialog(data);
    }
  }

  private openDialog(data: IDialogData) {
    const ref = this.dialog.open(
      SubjectInfoComponent, {
        minWidth: '300px',
        data,
      });
  }
}
