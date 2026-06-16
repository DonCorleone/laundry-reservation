import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  return next(req).pipe(
    catchError((error) => {
      // Only handle 401s in the browser environment
      if (isPlatformBrowser(platformId) && error.status === 401 && req.url.includes('/api/auth/user')) {
        console.log('🔑 401 detected - redirecting to login');
        
        // Use a small delay to ensure any pending operations complete
        setTimeout(() => {
          window.location.href = '/api/auth/login';
        }, 100);
        
        // Return the error to prevent further processing
        return throwError(() => error);
      }
      
      // For other errors, just pass them through
      return throwError(() => error);
    })
  );
};