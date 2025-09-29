import { Injectable, isDevMode, Signal, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, timer, firstValueFrom } from 'rxjs';
import { IReservation } from '../models/reservation';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private reservationEntries = signal<IReservation[]>([]); // Signal to store messages
  private isLoading = signal<boolean>(true);
  private loadStartTime: number;
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);

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
    // SignalR will be initialized when startConnection is called
  }

  private async initializeHubConnection(): Promise<void> {
    if (this.hubConnection) {
      return; // Already initialized
    }

    try {
      // Fetch configuration from server
      const config = await firstValueFrom(
        this.http.get<{backendUrl: string, tenantCode: string}>('/api/config')
      );
      
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${config.backendUrl}/hub`, {
          withCredentials: true,
          headers: {
            'X-Tenant-Code': config.tenantCode
          }
        })
        .build();

      console.log('SignalR Hub URL:', `${config.backendUrl}/hub`);
    } catch (error) {
      console.error('Failed to fetch backend configuration:', error);
      // Fallback to default production URL
      const fallbackUrl = 'https://laundrysignalr-init.onrender.com';
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${fallbackUrl}/hub`, {
          withCredentials: true,
          headers: {
            'X-Tenant-Code': 'default'
          }
        })
        .build();
      console.log('SignalR Hub URL (fallback):', `${fallbackUrl}/hub`);
    }
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

  async startConnection(): Promise<void> {  
    // Only start connection on the browser side
    if (!isPlatformBrowser(this.platformId)) {
      this.ensureMinLoadingTime();
      return;
    }

    this.loadStartTime = Date.now();
    this.isLoading.set(true);
    
    await this.initializeHubConnection();
    
    this.hubConnection
      .start()
      .then(() => (this.connectionId = this.hubConnection.connectionId))
      .catch((err) => {
        console.error('Error while starting connection: ' + err);
        this.ensureMinLoadingTime();
      });
  }

  public addDataListener(): void {
    // Only add listeners on the browser side and if hub connection exists
    if (!isPlatformBrowser(this.platformId) || !this.hubConnection) {
      return;
    }

    const handleReservation = (reservationEntry: IReservation) => {
      this.reservationEntries.update((reservationEntries) => [
        ...reservationEntries,
        reservationEntry,
      ]);
      // Backend now sends connectionId as the id field directly
      this.updatedReservation.next({ [reservationEntry.id]: reservationEntry.name });
    };

    this.hubConnection.on(this.RESERVATION_ADDED, handleReservation);
    this.hubConnection.on(this.RESERVATION_UPDATED, handleReservation);
    this.hubConnection.on(this.RESERVATION_DELETED, (reservationId: string) => {
      const reservationEntry = this.reservationEntries().find((entry) => entry.id === reservationId);
      this.reservationEntries.update((reservationEntries) =>
        reservationEntries.filter((entry) => entry.id !== reservationId)
      );
      // Backend now sends connectionId as the id field directly
      this.updatedReservation.next({ [reservationId]: '' });
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
