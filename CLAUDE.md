# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Laundry Calendar** application built with Angular 20+ that uses **Server-Side Rendering (SSR)** with Express. The application manages laundry machine reservations with real-time updates via SignalR and supports multi-tenant architecture.

## Development Commands

### Development
```bash
npm start                    # Start Angular dev server (client-side only)
ng serve                     # Same as npm start
npm run watch               # Build in watch mode
```

### Building
```bash
npm run build               # Production build with SSR
```

### Running SSR Server
```bash
npm run ssr                 # Run the built SSR server (requires build first)
npm run serve:ssr           # Alias for ssr command
```

### Testing
```bash
npm test                    # Run tests with Karma
ng test                     # Same as npm test
```

### Backend Development (json-server)
For local development with mock data:
```bash
json-server --watch db.json --routes routes.json
```

## Architecture

### SSR + Express Server Architecture

The application uses Angular SSR with a custom Express server (`src/server.ts`) that handles:

1. **Multi-tenant routing**: Extracts tenant code from subdomain (e.g., `museggstrasse-18.slotwi.se`)
2. **Auth0 SSR authentication**: Dynamic Auth0 middleware with tenant-specific configuration
3. **API proxy**: Proxies API calls to backend with `X-Tenant-Code` headers
4. **Configuration endpoint**: `/api/config` returns `backendUrl` and `tenantCode` to frontend

The Express server runs before Angular SSR and intercepts:
- `/api/auth/*` - Auth0 authentication endpoints
- `/api/config` - Configuration endpoint for frontend
- `/api/*` - Proxied to backend with tenant headers
- All other routes - Handled by Angular SSR

### Multi-Tenant System

**Server-side** (`src/server.ts:31-61`):
- Tenant is extracted from subdomain in Express middleware
- Stored in `req.tenantCode` for use throughout request lifecycle
- Passed to Auth0 via `authorizationParams.acr_value: tenant:${tenantCode}`
- Forwarded to backend via `X-Tenant-Code` header in API proxy

**Client-side**:
- `ConfigService` (`src/app/services/config.service.ts`): Fetches config from `/api/config` on app initialization via `APP_INITIALIZER`
- `ApiService` (`src/app/services/api.service.ts`): Adds `X-Tenant-Code` header to all HTTP requests
- `SignalRService` (`src/app/services/signalr.service.ts`): Connects to SignalR hub with tenant query parameter and header

### Real-time Updates (SignalR)

`SignalRService` manages WebSocket connection to backend hub:
- **Initialization**: Fetches config from `/api/config` to get `backendUrl` and `tenantCode`
- **Connection**: Connects to `${backendUrl}/hub?tenant=${tenantCode}` with `X-Tenant-Code` header
- **SSR-aware**: Only initializes on browser side using `isPlatformBrowser()`
- **Events handled**:
  - `ReservationAdded` - New reservation created
  - `ReservationUpdated` - Reservation modified
  - `ReservationDeleted` - Reservation removed
  - `ReservationsLoaded` - Initial data load
- **Direct hub methods**:
  - `createReservation()` - Invoke `CreateReservation` hub method
  - `deleteReservation()` - Invoke `DeleteReservation` hub method
- Uses Angular signals for reactive state management

### Authentication (Auth0)

**SSR Server** (`src/server.ts`):
- `express-openid-connect` middleware with dynamic `baseURL` based on request host
- Endpoints: `/api/auth/user`, `/api/auth/login`, `/api/auth/logout`
- Handles `/callback` route for Auth0 redirects

**Frontend** (`src/app/app.config.ts`):
- `@auth0/auth0-angular` configured with `AuthModule.forRoot()`
- Auth interceptor (`src/app/interceptors/auth.interceptor.ts`) adds auth headers to requests

### State Management

- **Angular Signals**: Used extensively for reactive state (reservations, loading states, etc.)
- **RxJS**: Used for HTTP requests and SignalR observables
- **BehaviorSubject**: Used in SignalRService for `updatedReservation$` stream

### Key Services

- `ApiService`: Centralized HTTP client with tenant header injection
- `ConfigService`: Loads runtime configuration from SSR server on app init
- `SignalRService`: Manages real-time WebSocket connection and reservation state
- `ReservationService`: Business logic for reservation operations
- `SubjectService`: Manages laundry machine/subject data
- `TileService`: Grid/calendar tile management
- `DateSelectorService`: Date navigation and selection

### Component Structure

- `AppComponent`: Root component, initializes SignalR connection
- `CalendarComponent`: Main calendar view
- `TilesComponent`: Grid tile rendering
- `AuthComponent`: Authentication UI
- `SplashScreenComponent`: Loading screen with minimum display time
- Custom directives: `ScrollManagerDirective`, `ScrollSectionDirective`, `ScrollAnchorDirective`

### Environment Configuration

- Development: `src/environments/environment.ts`
- Production: `src/environments/environment.prod.ts` (via `angular.json` file replacements)
- Runtime config: Fetched from `/api/config` endpoint (overrides compile-time environment)

Environment files contain:
- `tenantCode`: Default tenant (fallback)
- `backendUrl`: Backend API URL
- `auth0`: Auth0 domain, clientId, and callback URL

## Important Implementation Details

### SSR Considerations

- Always check `isPlatformBrowser()` before accessing browser-only APIs (window, localStorage, etc.)
- Services must handle both server and browser contexts
- SignalR only connects on browser side
- API calls during SSR go through Express proxy

### Configuration Loading

The app uses a two-stage configuration:
1. **Compile-time**: Environment files baked into build
2. **Runtime**: `/api/config` endpoint provides dynamic config (tenant code, backend URL)
   - Loaded via `APP_INITIALIZER` before app starts
   - Injected into `ApiService` and used by `SignalRService`

### API Proxy Flow

Client → Express SSR Server → Backend
- Client makes request to `/api/*`
- Express middleware adds `X-Tenant-Code` from subdomain
- Request proxied to backend with tenant header
- Response returned to client

### Material Design

Uses Angular Material with:
- Theme: `pink-bluegrey` (production), `deeppurple-amber` (tests)
- Icon font: `material-symbols-outlined` (set in AppComponent)

### Styling

- Tailwind CSS 4.0
- PostCSS processing
- Component-specific styles using Angular's encapsulation
