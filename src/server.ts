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

// Extend Express Request interface to include tenant information
declare global {
  namespace Express {
    interface Request {
      tenantCode?: string;
    }
  }
}
dotenv.config();

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

// Add JSON body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth0 SSR middleware with dynamic baseURL
app.use((req, res, next) => {
  // Extract tenant from subdomain and determine baseURL
  const host = req.get('host') || 'localhost:4000';
  const protocol = req.secure || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const baseURL = `${protocol}://${host}`;
  
  // Extract tenant code from subdomain (e.g., museggstrasse-18.slotwi.se -> museggstrasse-18)
  const hostParts = host.split('.');
  let tenantCode = 'default';
  if (hostParts.length > 2 && !host.includes('localhost') && !host.includes('onrender.com')) {
    tenantCode = hostParts[0]; // First part is the tenant code
  }
  
  // Create Auth0 middleware with dynamic configuration
  const authMiddleware = auth({
    issuerBaseURL: `https://${process.env['AUTH0_DOMAIN']}`,
    baseURL: baseURL,
    clientID: process.env['AUTH0_CLIENT_ID'],
    secret: process.env['AUTH0_CLIENT_SECRET'],
    authRequired: false,
    auth0Logout: true,
    authorizationParams: {
      acr_value: `tenant:${tenantCode}`,
    }
  });
  
  // Store tenant info for later use
  req.tenantCode = tenantCode;
  
  authMiddleware(req, res, next);
});

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

// Configuration endpoint for client-side services
app.get('/api/config', (req, res) => {
  res.json({
    backendUrl: process.env['BACKEND_URL'] || 'https://laundrysignalr-mongodb.onrender.com',
    tenantCode: req.tenantCode || 'default'
  });
});

// Handle Auth0 callback
app.get('/callback', (req, res) => {
  // This route is handled by express-openid-connect automatically
  // It will process the Auth0 callback and redirect to returnTo URL
  res.redirect('/');
});

// API Proxy endpoints for multi-tenant backend
const BACKEND_URL = process.env['NODE_ENV'] === 'production' 
  ? 'https://laundrysignalr-mongodb.onrender.com' 
  : 'http://localhost:5263';

// CORS middleware for API routes
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Tenant-Code');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Proxy API calls to backend with tenant headers
app.use('/api', async (req, res, next) => {
  try {
    // Skip proxy for OPTIONS requests (already handled above)
    if (req.method === 'OPTIONS') {
      return next();
    }
    
    const backendUrl = `${BACKEND_URL}${req.originalUrl}`;
    const requestBody = req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined;
        
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'X-Tenant-Code': req.tenantCode || 'default',
        'Content-Type': 'application/json'
      },
      body: requestBody
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('Backend Error Response:', responseText);
      throw new Error(`Backend responded with status: ${response.status} - ${responseText}`);
    }
    
    // Try to parse as JSON, fallback to text
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = responseText;
    }
    
    res.json(data);
  } catch (error) {
    console.error('API Proxy Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
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
