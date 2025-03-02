import { Injectable, isDevMode, Signal, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { IReservation } from '../models/reservation';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private baseUrl = 'https://laundrysignalr-init.onrender.com'; // render
  private hubConnection: signalR.HubConnection;
  private reservationEntries = signal<IReservation[]>([]); // Signal to store messages
  private isLoading = signal<boolean>(true);
  private loadStartTime: number;

  hourPerDate = signal<Map<string, number>>(null);
  private updatedReservation = new BehaviorSubject<Record<string, string> | null>(null);
  updatedReservation$: Observable<Record<string, string> | null> = this.updatedReservation.asObservable();
  connectionId: string;

  private readonly RESERVATION_ADDED = 'ReservationAdded';
  private readonly RESERVATION_UPDATED = 'ReservationUpdated';
  private readonly RESERVATION_DELETED = 'ReservationDeleted';
  private readonly RESERVATIONS_LOADED = 'ReservationsLoaded';
  private readonly MIN_LOADING_TIME = 1500; // minimum loading time in milliseconds

  constructor() {
    if (isDevMode()) {
      // this.baseUrl = 'http://localhost:3000'; // json-server
      // this.baseUrl = 'http://localhost:5263'; // dotNet
    }
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hub`, {
        withCredentials: true,
      })
      .build();
  }

  private ensureMinLoadingTime(): void {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.loadStartTime;
    const remainingTime = Math.max(0, this.MIN_LOADING_TIME - elapsedTime);

    if (remainingTime > 0) {
      timer(remainingTime).subscribe(() => {
        this.isLoading.set(false);
      });
    } else {
      this.isLoading.set(false);
    }
  }

  startConnection(): void {
    this.loadStartTime = Date.now();
    this.isLoading.set(true);
    this.hubConnection
      .start()
      .then(() => (this.connectionId = this.hubConnection.connectionId))
      .catch((err) => {
        console.error('Error while starting connection: ' + err);
        this.ensureMinLoadingTime();
      });
  }

  public addDataListener(): void {
    const handleReservation = (reservationEntry: IReservation) => {
      this.reservationEntries.update((reservationEntries) => [
        ...reservationEntries,
        reservationEntry,
      ]);
      this.updatedReservation.next({ [reservationEntry.id]: reservationEntry.name });
    };

    this.hubConnection.on(this.RESERVATION_ADDED, handleReservation);
    this.hubConnection.on(this.RESERVATION_UPDATED, handleReservation);
    this.hubConnection.on(this.RESERVATION_DELETED, (reservationId: string) => {
      const reservationEntry = this.reservationEntries().find((entry) => entry.id === reservationId);
      this.reservationEntries.update((reservationEntries) =>
        reservationEntries.filter((entry) => entry.id !== reservationId)
      );
      this.updatedReservation.next({ [reservationEntry.id]: '' });
    });
    this.hubConnection.on(this.RESERVATIONS_LOADED, (reservations: IReservation[]) => {
      this.reservationEntries.update(() => reservations);
      this.ensureMinLoadingTime();
    });
  }

  public getLoadingState(): Signal<boolean> {
    return this.isLoading.asReadonly();
  }

  public getReservations(): Signal<IReservation[]> {
    return this.reservationEntries.asReadonly();
  }

  public setReservations(messages: IReservation[]): void {
    this.populateHourPerDate(messages);
    this.reservationEntries.set(messages);
    this.ensureMinLoadingTime();
  }

  private populateHourPerDate(reservationEntries: IReservation[]): void {
    const hourMap = new Map<string, number>();
    reservationEntries.forEach((reservation) => {
      const date = new Date(reservation.date);
      date.setHours(0, 0, 0, 0);
      const dateString = date.toISOString();
      hourMap.set(dateString, (hourMap.get(dateString) || 0) + 1);
    });
    this.hourPerDate.set(hourMap);
  }
}
