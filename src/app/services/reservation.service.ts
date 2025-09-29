import {inject, Injectable} from '@angular/core';
import {IReservation} from "../models/reservation";
import {catchError, Observable, map} from "rxjs";
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiService = inject(ApiService);

  public getReservations(): Observable<IReservation[]> {
    return this.apiService.get<any[]>('/api/ReservationEntries').pipe(
      map(backendReservations => backendReservations.map(item => this.transformBackendToFrontend(item))),
      catchError(err => {
        console.error('Error fetching reservations:', err);
        throw err;
      }));
  }

  private transformBackendToFrontend(backendItem: any): IReservation {
    return {
      id: backendItem.Id || backendItem.id,
      name: backendItem.Name || backendItem.name,
      deviceId: backendItem.DeviceId || backendItem.deviceId,
      date: backendItem.Date || backendItem.date,
      tenantId: backendItem.TenantId || backendItem.tenantId,
      createdAt: backendItem.CreatedAt || backendItem.createdAt,
      updatedAt: backendItem.UpdatedAt || backendItem.updatedAt,
      expiresAt: backendItem.ExpiresAt || backendItem.expiresAt
    };
  }
  
  public addReservation(reservationEntry: IReservation): void {
    const createReservationRequest = {
      name: reservationEntry.name,
      deviceId: reservationEntry.deviceId,
      date: reservationEntry.date,
      id: reservationEntry.id
    };

    this.apiService.post<any>('/api/ReservationEntries', createReservationRequest).subscribe({
      next: (response) => {
        // Reservation added successfully
      },
      error: err => {
        console.error('Error adding reservation:', err);
      }
    });
  }
  
  public deleteReservation(reservationEntry: IReservation): void {
    const reservationId = encodeURIComponent(reservationEntry.id);

    this.apiService.delete<string>(`/api/ReservationEntries/${reservationId}`).subscribe({
      next: (response) => {
        // Reservation deleted successfully
      },
      error: err => {
        console.error('Error deleting reservation:', err);
      }
    });
  }
}
