import { Injectable, isDevMode, Signal, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { IReservation } from '../models/reservation';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private baseUrl = 'https://laundrysignalr-init.onrender.com'; // render
  private hubConnection: signalR.HubConnection;
  private reservationEntries = signal<IReservation[]>([]); // Signal to store messages

  hourPerDate = signal<Map<string, number>>(null);
  private updatedReservation = new BehaviorSubject<Record<string, string> | null>(null);
  updatedReservation$: Observable<Record<string, string> | null> = this.updatedReservation.asObservable();
  connectionId: string;

  private readonly RESERVATION_ADDED = 'ReservationAdded';
  private readonly RESERVATION_UPDATED = 'ReservationUpdated';
  private readonly RESERVATION_DELETED = 'ReservationDeleted';
  private readonly RESERVATIONS_LOADED = 'ReservationsLoaded';

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

  startConnection(): void {
    this.hubConnection
      .start()
      .then(() => (this.connectionId = this.hubConnection.connectionId))
      .catch((err) => {
        console.error('Error while starting connection: ' + err);
        // Handle the error appropriately
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
    });
  }

  public getReservations(): Signal<IReservation[]> {
    return this.reservationEntries.asReadonly(); // Expose messages as a readonly signal
  }

  public setReservations(messages: IReservation[]): void {
    this.populateHourPerDate(messages);
    this.reservationEntries.set(messages);
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
