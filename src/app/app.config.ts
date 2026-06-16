import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
  PLATFORM_ID,
  inject,
  APP_INITIALIZER,
} from '@angular/core';
import { AuthModule } from '@auth0/auth0-angular';
import { environment } from '../environments/environment';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './interceptors/auth.interceptor';
import { ConfigService } from './services/config.service';

function initializeApp(configService: ConfigService) {
  return () => configService.loadConfig();
}

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
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideClientHydration(withEventReplay()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ConfigService],
      multi: true
    }
  ],
};
