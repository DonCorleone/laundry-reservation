import {inject, Injectable, isDevMode} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {IReservation} from "../models/reservation";
import {catchError, Observable, tap} from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private baseUrl = 'https://laundrysignalr-init.onrender.com'; // render
  private httpClient = inject(HttpClient);

  constructor() {
    if (isDevMode()) {
      // this.baseUrl = 'http://localhost:3000'; // json-server
      /// this.baseUrl = 'http://localhost:5263'; // dotNet
    }
  }

  public getReservations(): Observable<IReservation[]> {
    return this.httpClient.get<IReservation[]>(`${this.baseUrl}/api/ReservationEntries`).pipe(
      catchError(err => {
        console.error('Error fetching reservations:', err);
        throw err;
      }));
  }
  public addReservation(reservationEntry: IReservation): void {
    this.httpClient.post<IReservation>(`${this.baseUrl}/api/ReservationEntries`, reservationEntry).subscribe({
      error: err => {
        console.error('Error adding reservation:', err);
      }
    });
  }
  public deleteReservation(reservationEntry: IReservation): void {
    const options = {
      body: reservationEntry,
    };
    this.httpClient.delete<string>(`${this.baseUrl}/api/ReservationEntries`, options).subscribe({
      error: err => {
        console.error('Error deleting reservation:', err);
      }
    });
  }
}
