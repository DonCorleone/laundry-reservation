// src/app/services/signalr.service.ts
import {Injectable, Signal, signal} from '@angular/core';
import * as signalR from '@microsoft/signalr';
import {ReservationEntry} from '../models/reservation-entry';
import {BehaviorSubject, Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: signalR.HubConnection;
  private reservationEntries = signal<ReservationEntry[]>([]); // Signal to store messages
 // private baseUrlLocal = 'http://localhost:5263';
  private baseUrlRender = 'https://laundrysignalr-init.onrender.com';
  hourPerDate = signal<Map<string, number>>(null);
  updatedReservation = new BehaviorSubject<Record<string, string> | null>(null);
  updatedReservation$: Observable< Record<string, string> | null> = this.updatedReservation.asObservable();

  constructor() {
    const customParams = {
      machineids: ['M-1', 'M-2', 'M-3', 'M-4'], // Array of machine IDs
    };

    const queryString = new URLSearchParams(
      customParams.machineids.map((id, index) => [`machineid${index}`, id])
    ).toString();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrlRender}/hub?${queryString}`, {
        withCredentials: true,
      })
      .build();
  }

  startConnection(): void {
    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log('Error while starting connection: ' + err));
  }

  public addDataListener() {
    this.hubConnection.on(
      'ReservationAdded',
      (reservationEntry: ReservationEntry) => {
        console.log(
          `Reservation with id: ${reservationEntry.id} has been added`
        );
        this.reservationEntries.update((reservationEntries) => [
          ...reservationEntries,
          reservationEntry,
        ]);
        this.updatedReservation.next({ [reservationEntry.id]: reservationEntry.name });
      }
    );
    this.hubConnection.on(
      'ReservationUpdated',
      (reservationEntry: ReservationEntry) => {
        console.log(
          `Reservation with id: ${reservationEntry.id} has been updated`
        );
        this.reservationEntries.update((reservationEntries) => [
          ...reservationEntries,
          reservationEntry,
        ]);
        this.updatedReservation.next({ [reservationEntry.id]: reservationEntry.name });
      }
    );
    this.hubConnection.on(
      'ReservationDeleted',
      (reservationId: string) => {
        console.log(`Reservation with id: ${reservationId} has been deleted`);
        const reservationEntry = this.reservationEntries().find((entry) => entry.id === reservationId);

        this.reservationEntries.update((reservationEntries) =>
          // find the reservation with the id and remove it
          reservationEntries.filter((entry) => entry.id !== reservationId)
        );

        this.updatedReservation.next({ [reservationEntry.id]: "" });
      }
    );
    this.hubConnection.on(
      'ReservationsLoaded',
      (reservations: ReservationEntry[]) => {
        console.log(`reservations loaded`);
        this.reservationEntries.update((reservationEntries) =>
          (reservationEntries) = reservations);
      }
    );
  }

  public getMessages() {
    return this.reservationEntries.asReadonly(); // Expose messages as a readonly signal
  }
  setMessages(messages: ReservationEntry[]) {
    this.populateHourPerDate(messages);
    this.reservationEntries.set(messages);
  }

  private populateHourPerDate(reservationEntries: ReservationEntry[]): void {
    reservationEntries.forEach((reservation) => {
      const date = new Date(reservation.date);
      date.setHours(0, 0, 0, 0);
      if (!this.hourPerDate() ) {
        this.hourPerDate.set(new Map());
      }
      if (this.hourPerDate()?.has(date.toISOString())) {
        this.hourPerDate().set(date.toISOString(), this.hourPerDate().get(date.toISOString())! + 1);
      } else {
        this.hourPerDate().set(date.toISOString(), 1);
      }
    });
  }

  getHourPerDate(): Signal<Map<string, number>> {
    return this.hourPerDate.asReadonly();
  }
}
