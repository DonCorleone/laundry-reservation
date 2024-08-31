import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ReservationEntry} from "../models/reservation-entry";

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private baseUrlLocal = 'http://localhost:5263';
  private baseUrlRender = 'https://laundrysignalr-init.onrender.com/api/Reservation';

  constructor(private httpClient: HttpClient) {}

  public getReservations() {
    const customParams = {
      machineids: ['M-1', 'M-2', 'M-3', 'M-4'], // Array of machine IDs
    };

    const queryString = new URLSearchParams(
      customParams.machineids.map((id, index) => [`machineid${index}`, id])
    ).toString();

    return this.httpClient.get<ReservationEntry[]>(`${this.baseUrlLocal}/api/ReservationEntries?${queryString}`);
  }

  public addReservation(reservationEntry: ReservationEntry) {

    this.httpClient.post<ReservationEntry>(`${this.baseUrlLocal}/api/ReservationEntries`, reservationEntry).subscribe(reservation => {
      console.log('Updated reservation:', reservation);
    });
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
