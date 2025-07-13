import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { AuthModule } from '@auth0/auth0-angular';
import { environment } from '../environments/environment';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      AuthModule.forRoot({
        domain: environment.auth0.domain,
        clientId: environment.auth0.clientId,
        authorizationParams: {
          redirect_uri: environment.auth0.baseUrl
        }
      })
    ),
    // provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay())
  ],
};
