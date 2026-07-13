/**
 * Application configuration
 * Controls whether to use mock data (localStorage) or real backend API
 */

// Debug: Log raw env values
console.log('🔍 DEBUG - Raw VITE_DEMO_MODE value:', import.meta.env.VITE_DEMO_MODE);
console.log('🔍 DEBUG - Type:', typeof import.meta.env.VITE_DEMO_MODE);
console.log('🔍 DEBUG - All env vars:', import.meta.env);

// Demo mode uses localStorage, Production mode uses real backend API
export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// URL of the full working demo (frontend + backend). Deployed as an Azure Web App.
// Update this after deployment. Can be overridden at build time via VITE_WEBAPP_DEMO_URL.
export const WEBAPP_DEMO_URL =
  import.meta.env.VITE_WEBAPP_DEMO_URL || 'https://senseable-demo.azurewebsites.net';

// Log current mode for debugging
console.log('🚀 SenseAble Mode:', IS_DEMO_MODE ? 'DEMO (localStorage)' : 'PRODUCTION (Backend API)');
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('📊 IS_DEMO_MODE =', IS_DEMO_MODE);
