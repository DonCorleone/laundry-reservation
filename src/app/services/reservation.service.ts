import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IReservation} from "../models/reservation";

// const baseUrl = 'http://localhost:3000'; // json-server
// const baseUrl = 'http://localhost:5263'; // dotNet
const baseUrl = 'https://laundrysignalr-init.onrender.com'; // render

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  constructor(private httpClient: HttpClient) {}

  public getReservations() {
    return this.httpClient.get<IReservation[]>(`${baseUrl}/api/ReservationEntries`);
  }

  public addReservation(reservationEntry: IReservation) {
    this.httpClient.post<IReservation>(`${baseUrl}/api/ReservationEntries`, reservationEntry).subscribe(reservation => {
      console.log('Updated reservation:', reservation);
    });
  }

  public deleteReservation(reservationEntry: IReservation) {
    // call the API to delete the reservation with the reservation as http body
    const options = {
      body: reservationEntry,
    };
    this.httpClient.delete<string>(`${baseUrl}/api/ReservationEntries`, options).subscribe(reservationId => {
      console.log('Deleted reservation:', reservationId);
    });
  }
}
