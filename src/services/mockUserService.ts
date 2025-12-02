import { User, UserPreferences } from '../types';
import { getColorPalette } from '../utils/colorPalettes';

/**
 * Mock user service using localStorage for demo purposes
 * Mimics the real API but stores data in browser localStorage
 */

const STORAGE_KEYS = {
  USERS: 'senseable_users',
  CURRENT_USER_ID: 'senseable_current_user_id',
  PREFERENCES: 'senseable_preferences',
};

// Helper to get next user ID
const getNextUserId = (): number => {
  const users = getUsers();
  return users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
};

// Helper to get all users
const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

// Helper to save users
const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

// Helper to get all preferences
const getAllPreferences = (): UserPreferences[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
  return data ? JSON.parse(data) : [];
};

// Helper to save preferences
const saveAllPreferences = (prefs: UserPreferences[]) => {
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
};

export const mockUserService = {
  async register(data: any): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const users = getUsers();
    const newUser: User = {
      id: getNextUserId(),
      name: data.name,
      email: data.email || `user${Date.now()}@demo.com`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id.toString());

    return newUser;
  },

  async getProfile(userId: number): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const users = getUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  async updateProfile(userId: number, data: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex] = {
      ...users[userIndex],
      ...data,
      updated_at: new Date().toISOString(),
    };

    saveUsers(users);
    return users[userIndex];
  },

  async getPreferences(userId: number): Promise<UserPreferences> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const allPrefs = getAllPreferences();
    const prefs = allPrefs.find(p => p.user_id === userId);

    if (!prefs) {
      // Return default preferences
      return {
        id: Date.now(),
        user_id: userId,
        accessibility_need: 'none',
        reading_level: 'intermediate',
        preferred_complexity: 'moderate',
        color_palette: getColorPalette('none'),
        other_preferences: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return prefs;
  },

  async updatePreferences(userId: number, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const allPrefs = getAllPreferences();
    const existingIndex = allPrefs.findIndex(p => p.user_id === userId);

    const updatedPrefs: UserPreferences = {
      id: existingIndex >= 0 ? allPrefs[existingIndex].id : Date.now(),
      user_id: userId,
      accessibility_need: preferences.accessibility_need || 'none',
      reading_level: preferences.reading_level || 'intermediate',
      preferred_complexity: preferences.preferred_complexity || 'moderate',
      color_palette: preferences.color_palette || getColorPalette(preferences.accessibility_need || 'none'),
      other_preferences: preferences.other_preferences || {},
      created_at: existingIndex >= 0 ? allPrefs[existingIndex].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      allPrefs[existingIndex] = updatedPrefs;
    } else {
      allPrefs.push(updatedPrefs);
    }

    saveAllPreferences(allPrefs);
    return updatedPrefs;
  },
};
