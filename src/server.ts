import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import dotenv from 'dotenv';
import { auth } from 'express-openid-connect';
dotenv.config();

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
// Auth0 SSR middleware
app.use(auth({
  issuerBaseURL: `https://${process.env['AUTH0_DOMAIN']}`,
  baseURL: process.env['AUTH0_BASE_URL'] || 'http://localhost:4000',
  clientID: process.env['AUTH0_CLIENT_ID'],
  secret: process.env['AUTH0_CLIENT_SECRET'],
  authRequired: false,
  auth0Logout: true,
}));

// Auth endpoints for Angular frontend
app.get('/api/auth/user', (req, res) => {
  if (req.oidc && req.oidc.isAuthenticated()) {
    res.json(req.oidc.user);
  } else {
    res.status(401).json({});
  }
});

app.get('/api/auth/login', (req, res) => {
  res.oidc.login({ returnTo: '/' });
});

app.get('/api/auth/logout', (req, res) => {
  res.oidc.logout({ returnTo: '/' });
});

// Handle Auth0 callback
app.get('/callback', (req, res) => {
  // This route is handled by express-openid-connect automatically
  // It will process the Auth0 callback and redirect to returnTo URL
  res.redirect('/');
});

const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
