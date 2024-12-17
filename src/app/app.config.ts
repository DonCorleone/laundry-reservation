import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
   // provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideHttpClient()
  ],
};
