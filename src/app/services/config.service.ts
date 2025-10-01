import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { ApiService, AppConfig } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private httpClient = inject(HttpClient);
  private apiService = inject(ApiService);
  private config: AppConfig | null = null;

  async loadConfig(): Promise<void> {
    try {
      // Fetch configuration from server endpoint
      this.config = await firstValueFrom(
        this.httpClient.get<AppConfig>('/api/config')
      );
      
      // Set the config in ApiService for future API calls
      this.apiService.setAppConfig(this.config);
      
      console.log('🔧 App config loaded:', this.config);
    } catch (error) {
      console.error('❌ Failed to load app config:', error);
      // Fallback to default config
      this.config = {
        backendUrl: 'https://laundrysignalr-mongodb.onrender.com',
        tenantCode: 'default'
      };
      this.apiService.setAppConfig(this.config);
    }
  }

  getConfig(): AppConfig | null {
    return this.config;
  }

  getTenantCode(): string {
    return this.config?.tenantCode || 'default';
  }
}