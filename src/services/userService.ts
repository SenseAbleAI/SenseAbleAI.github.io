import api from './api';
import { User, UserPreferences } from '../types';
import { IS_DEMO_MODE } from '../config';
import { mockUserService } from './mockUserService';

/**
 * Real user service using backend API
 */
const realUserService = {
  async register(data: any): Promise<User> {
    const response = await api.post('/api/users/register', data);
    return response.data;
  },

  async getProfile(userId: number): Promise<User> {
    const response = await api.get(`/api/users/profile/${userId}`);
    return response.data;
  },

  async updateProfile(userId: number, data: Partial<User>): Promise<User> {
    const response = await api.put(`/api/users/profile/${userId}`, data);
    return response.data;
  },

  async getPreferences(userId: number): Promise<UserPreferences> {
    const response = await api.get(`/api/users/preferences/${userId}`);
    return response.data;
  },

  async updatePreferences(userId: number, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await api.put(`/api/users/preferences/${userId}`, preferences);
    return response.data;
  },
};

/**
 * Export either mock or real service based on config
 * Demo mode: Uses localStorage (no backend needed)
 * Production mode: Uses real backend API
 */
export const userService = IS_DEMO_MODE ? mockUserService : realUserService;
