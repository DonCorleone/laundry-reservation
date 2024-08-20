// src/app/services/signalr.service.ts
import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { ReservationEntry } from '../models/reservation-entry';
@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: signalR.HubConnection;
  private reservationEntries = signal<ReservationEntry[]>([]); // Signal to store messages
  private baseUrlLocal = 'http://localhost:5263';
  private baseUrlRender = 'https://laundrysignalr-init.onrender.com/api/ReservationEntries';

  constructor(private httpClient: HttpClient) {
    // Add custom parameters to the connection URL
    const customParams = {
      machineid: 'Machine 1',
    };
    const queryString = new URLSearchParams(customParams).toString();
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrlLocal}/hub?${queryString}`, {
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
          `User: ${reservationEntry.name}, Time: ${reservationEntry.timestamp}`
        );
        this.reservationEntries.update((reservationEntries) => [
          ...reservationEntries,
          reservationEntry,
        ]);
        // expose the message to the UI
      }
    );
    this.hubConnection.on(
      'ReservationDeleted',
      (reservationId: number) => {
        console.log(`Reservation with id: ${reservationId} has been deleted`);
        this.reservationEntries.update((reservationEntries) =>
          reservationEntries.filter((entry) => entry.id !== reservationId)
        );
      }
    );
    this.hubConnection.on(
      'ReservationsLoaded',
      (reservations: ReservationEntry[]) => {
        console.log(`reservations loded`);
        this.reservationEntries.update((reservationEntries) => (reservationEntries) = reservations);
      }
    );
  }

  getMessages() {
    return this.reservationEntries.asReadonly(); // Expose messages as a readonly signal
  }
  public addReservation(reservationEntry: ReservationEntry) {

    this.httpClient.post<ReservationEntry>(`${this.baseUrlLocal}api/ReservationEntries`, reservationEntry).subscribe(reservation => {
      console.log('Updated reservation:', reservation);
    });

    // this.hubConnection
    //   .invoke('newMessage', reservationEntry)
    //   .catch((err) => console.error(err));
  }

  public deleteReservation(reservationEntry: ReservationEntry) {

    // call the API to delete the reservation with the reservation as http body
    const options = {
      body: reservationEntry,
    };
    this.httpClient.delete<ReservationEntry>(`${this.baseUrlLocal}/api/ReservationEntries`, options).subscribe(reservationId => {
      console.log('Deleted reservation:', reservationId);
    });
  }
}
