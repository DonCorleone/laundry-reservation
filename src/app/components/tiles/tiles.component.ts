import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, input, OnInit} from '@angular/core';
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
import {combineLatest} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {SignalRService} from "../../services/signalr.service";
import {ReservationService} from "../../services/reservation.service";
import {SubjectService} from "../../services/subject.service";
import {ILaundryUser} from "../../models/user";
import {Dialog} from "@angular/cdk/dialog";
import {SubjectInfoComponent} from "../subject-info/subject-info.component";
import {IDialogData} from 'src/app/models/dialog-data';
import {MatButton, MatFabButton, MatMiniFabButton} from "@angular/material/button";
import {MatRipple} from "@angular/material/core";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {LegendComponent} from "../legend/legend.component";

@Component({
  selector: 'app-tiles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HourComponent,
    HourHeaderComponent,
    MatGridList,
    MatGridTile,
    MatIcon,
    ScrollAnchorDirective,
    ScrollSectionDirective,
    MatFabButton,
    MatMiniFabButton,
    MatButton,
    MatRipple,
    LegendComponent
  ],
  templateUrl: './tiles.component.html',
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
    combineLatest([
      this.tileService.tiles$,
      this.subjectService.subjects$,
      this.reservationService.getReservations()
    ]).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([tiles, subjects, reservations]) => {
        if (!subjects) {
          return;
        }
        this.tiles = tiles;
        const colSpanRowHeader = (this.isDesktop || subjects.length < 4) ? 1 : 2;
        this.colsAmount = subjects.length + colSpanRowHeader;
        this.signalRService.setMessages(reservations);
        this.changeDetectionRef.markForCheck();
      });
  }
  protected clickMachineColumn($event: MouseEvent, subject: ISubject) {
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

      this.changeDetectionRef.markForCheck();
    } else {
      // Show message to the user
      const data: IDialogData = {
        body: 'This machine has already any reservations',
      }
      this.openDialog(data);
    }
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
  protected clickHourHeader($event: MouseEvent, hour: IHour) {
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
      this.changeDetectionRef.markForCheck();
    } else {
      const data: IDialogData = {
        body: 'This hour has already any reservations',
      }
      this.openDialog(data);
    }
  }
  protected clickSubjectIcon($event: MouseEvent, subject: ISubject) {
    $event.preventDefault();
    $event.stopPropagation();
    const data: IDialogData = {
      body: subject.name,
      imageUrl: subject.image
    }
    this.openDialog(data);
  }
  private openDialog(data: IDialogData) {
    const ref = this.dialog.open(
      SubjectInfoComponent, {
        minWidth: '300px',
        data,
      });
  }
}
