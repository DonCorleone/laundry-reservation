import {inject, Injectable} from '@angular/core';
import {IReservation} from "../models/reservation";
import {catchError, Observable, map} from "rxjs";
import { ApiService } from './api.service';
import { SignalRService } from './signalr.service';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiService = inject(ApiService);
  private signalRService = inject(SignalRService);
  private pendingRequests = new Set<string>();

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
  
  public async addReservation(reservationEntry: IReservation): Promise<void> {
    const requestKey = `add-${reservationEntry.id}`;
    
    // Check if this request is already pending
    if (this.pendingRequests.has(requestKey)) {
      console.log('Reservation request already pending for:', reservationEntry.id);
      return;
    }
    
    const createReservationRequest = {
      name: reservationEntry.name,
      deviceId: reservationEntry.deviceId,
      date: reservationEntry.date,
      id: reservationEntry.id
    };

    // Mark request as pending
    this.pendingRequests.add(requestKey);

    try {
      // Primary approach: Use SignalR hub method
      await this.signalRService.createReservation(createReservationRequest);
      this.pendingRequests.delete(requestKey);
    } catch (signalRError) {
      console.warn('SignalR reservation creation failed, falling back to API:', signalRError);
      
      // Fallback approach: Use REST API
      this.apiService.post<any>('/api/ReservationEntries', createReservationRequest).subscribe({
        next: (response) => {
          this.pendingRequests.delete(requestKey);
        },
        error: err => {
          console.error('Error adding reservation via API fallback:', err);
          this.pendingRequests.delete(requestKey);
        }
      });
    }
  }
  
  public async deleteReservation(reservationEntry: IReservation): Promise<void> {
    const requestKey = `delete-${reservationEntry.id}`;
    
    // Check if this request is already pending
    if (this.pendingRequests.has(requestKey)) {
      console.log('Deletion request already pending for:', reservationEntry.id);
      return;
    }

    // Mark request as pending
    this.pendingRequests.add(requestKey);

    try {
      // Primary approach: Use SignalR hub method
      await this.signalRService.deleteReservation(reservationEntry.id);
      this.pendingRequests.delete(requestKey);
    } catch (signalRError) {
      console.warn('SignalR reservation deletion failed, falling back to API:', signalRError);
      
      // Fallback approach: Use REST API
      const reservationId = encodeURIComponent(reservationEntry.id);
      this.apiService.delete<string>(`/api/ReservationEntries/${reservationId}`).subscribe({
        next: (response) => {
          this.pendingRequests.delete(requestKey);
        },
        error: err => {
          console.error('Error deleting reservation via API fallback:', err);
          this.pendingRequests.delete(requestKey);
        }
      });
    }
  }

  public isRequestPending(reservationId: string): boolean {
    return this.pendingRequests.has(`add-${reservationId}`) || this.pendingRequests.has(`delete-${reservationId}`);
  }
}
