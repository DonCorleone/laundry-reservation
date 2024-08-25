import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { HAMMER_GESTURE_CONFIG, HammerModule } from '@angular/platform-browser';
import { MyHammerConfig } from './directives/my-hammer-config';

export const appConfig: ApplicationConfig = {
  providers: [
   // provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideHttpClient(),
    // here
    importProvidersFrom(HammerModule),
    // provide your HAMMER_GESTURE_CONFIG after the previous line
    // so that it overrides the default one provided by HammerModule
    { provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig },
  ],
};
