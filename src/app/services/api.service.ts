import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = ''; // Use relative URLs for SSR
  private httpClient = inject(HttpClient);
  
  constructor() {
    // For SSR, all API calls should go through the SSR server
    // The server will proxy these to the actual backend
    this.baseUrl = '';
  }

  private getTenantCode(): string {
    // Option 1: From URL query parameter (e.g., ?tenant=yourhouse)
    const urlParams = new URLSearchParams(window.location.search);
    const queryTenant = urlParams.get('tenant');
    if (queryTenant) {
      return queryTenant;
    }
    
    // Option 2: From subdomain (e.g., yourhouse.laundry-app.com)
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    const subdomain = parts.length > 2 ? parts[0] : null;
    
    // Option 3: From environment (development/fallback)
    if (!subdomain || subdomain === 'localhost' || hostname === 'localhost') {
      return environment.tenantCode || 'default';
    }
    
    return subdomain;
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-Tenant-Code': this.getTenantCode(),
      'Content-Type': 'application/json'
    });
  }

  public get<T>(endpoint: string): Observable<T> {
    return this.httpClient.get<T>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
  }

  public post<T>(endpoint: string, data: any): Observable<T> {
    return this.httpClient.post<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  public put<T>(endpoint: string, data: any): Observable<T> {
    return this.httpClient.put<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  public delete<T>(endpoint: string, body?: any): Observable<T> {
    const options = {
      headers: this.getHeaders(),
      ...(body && { body })
    };
    return this.httpClient.delete<T>(`${this.baseUrl}${endpoint}`, options);
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }
}