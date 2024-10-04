import {Injectable, signal} from '@angular/core';
import * as signalR from '@microsoft/signalr';
import {BehaviorSubject, Observable} from "rxjs";
import {IReservation} from "../models/reservation";

// const baseUrl = 'http://localhost:3000'; // json-server
// const baseUrl = 'http://localhost:5263'; // dotNet
const baseUrl = 'https://laundrysignalr-init.onrender.com'; // render
@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: signalR.HubConnection;
  private reservationEntries = signal<IReservation[]>([]); // Signal to store messages

  hourPerDate = signal<Map<string, number>>(null);
  updatedReservation = new BehaviorSubject<Record<string, string> | null>(null);
  updatedReservation$: Observable< Record<string, string> | null> = this.updatedReservation.asObservable();
  connectionId: string;

  constructor() {

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hub`, {
        withCredentials: true,
      })
      .build();
  }

  startConnection(): void {
    this.hubConnection
      .start()
      .then(() => this.connectionId = this.hubConnection.connectionId)
      .catch((err) => console.log('Error while starting connection: ' + err));
  }

  public addDataListener() {
    this.hubConnection.on(
      'ReservationAdded',
      (reservationEntry: IReservation) => {
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
      (reservationEntry: IReservation) => {
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
      (reservations: IReservation[]) => {
        console.log(`reservations loaded`);
        this.reservationEntries.update((reservationEntries) =>
          (reservationEntries) = reservations);
      }
    );
  }

  public getMessages() {
    return this.reservationEntries.asReadonly(); // Expose messages as a readonly signal
  }
  public setMessages(messages: IReservation[]) {
    this.populateHourPerDate(messages);
    this.reservationEntries.set(messages);
  }

  private populateHourPerDate(reservationEntries: IReservation[]): void {
    if (reservationEntries.length === 0) {
      this.hourPerDate.set(new Map());
      return;
    }
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
}
