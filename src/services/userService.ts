import { mockUserService } from './mockUserService';

/**
 * User and profile state is lightweight personalization data (accessibility
 * needs, cultural context, tags). It is managed client-side via localStorage in
 * all modes — no authentication or server persistence is required. Only text
 * analysis and rewriting use the model backend (see analyzeService).
 */
export const userService = mockUserService;
