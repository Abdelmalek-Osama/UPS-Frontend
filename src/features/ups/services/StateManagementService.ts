import type { TimeRange, Site, User } from '../types';

/**
 * State management service for UPS Dashboard
 * Provides centralized state management and persistence
 */
export class StateManagementService {
  private static instance: StateManagementService | null = null;
  private storage: Storage;

  private constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  static getInstance(): StateManagementService {
    if (!this.instance) {
      this.instance = new StateManagementService();
    }
    return this.instance;
  }

  // Time Range State Management
  saveTimeRange(key: string, timeRange: TimeRange): void {
    try {
      this.storage.setItem(`ups_timerange_${key}`, JSON.stringify({
        ...timeRange,
        startDate: timeRange.startDate?.toISOString(),
        endDate: timeRange.endDate?.toISOString(),
      }));
    } catch (error) {
      console.warn('Failed to save time range to storage:', error);
    }
  }

  getTimeRange(key: string): TimeRange | null {
    try {
      const stored = this.storage.getItem(`ups_timerange_${key}`);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        startDate: parsed.startDate ? new Date(parsed.startDate) : undefined,
        endDate: parsed.endDate ? new Date(parsed.endDate) : undefined,
      };
    } catch (error) {
      console.warn('Failed to load time range from storage:', error);
      return null;
    }
  }

  // User Preferences
  saveUserPreferences(userId: string, preferences: Record<string, any>): void {
    try {
      this.storage.setItem(`ups_prefs_${userId}`, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  }

  getUserPreferences(userId: string): Record<string, any> {
    try {
      const stored = this.storage.getItem(`ups_prefs_${userId}`);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
      return {};
    }
  }

  // Selected Sites State
  saveSelectedSites(key: string, siteIds: string[]): void {
    try {
      this.storage.setItem(`ups_selected_sites_${key}`, JSON.stringify(siteIds));
    } catch (error) {
      console.warn('Failed to save selected sites:', error);
    }
  }

  getSelectedSites(key: string): string[] {
    try {
      const stored = this.storage.getItem(`ups_selected_sites_${key}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load selected sites:', error);
      return [];
    }
  }

  // Map State Management
  saveMapState(center: [number, number], zoom: number): void {
    try {
      this.storage.setItem('ups_map_state', JSON.stringify({ center, zoom }));
    } catch (error) {
      console.warn('Failed to save map state:', error);
    }
  }

  getMapState(): { center: [number, number]; zoom: number } | null {
    try {
      const stored = this.storage.getItem('ups_map_state');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load map state:', error);
      return null;
    }
  }

  // Data Service Mode
  saveDataServiceMode(mode: 'demo' | 'live'): void {
    try {
      this.storage.setItem('ups_data_service_mode', mode);
    } catch (error) {
      console.warn('Failed to save data service mode:', error);
    }
  }

  getDataServiceMode(): 'demo' | 'live' {
    try {
      const stored = this.storage.getItem('ups_data_service_mode');
      return (stored as 'demo' | 'live') || 'demo';
    } catch (error) {
      console.warn('Failed to load data service mode:', error);
      return 'demo';
    }
  }

  // Language Preferences
  saveLanguage(language: string): void {
    try {
      this.storage.setItem('ups_language', language);
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }
  }

  getLanguage(): string {
    try {
      return this.storage.getItem('ups_language') || 'en';
    } catch (error) {
      console.warn('Failed to load language preference:', error);
      return 'en';
    }
  }

  // Export Settings
  saveExportSettings(settings: Record<string, any>): void {
    try {
      this.storage.setItem('ups_export_settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save export settings:', error);
    }
  }

  getExportSettings(): Record<string, any> {
    try {
      const stored = this.storage.getItem('ups_export_settings');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn('Failed to load export settings:', error);
      return {};
    }
  }

  // Clear all UPS-related storage
  clearAllData(): void {
    try {
      const keys = Object.keys(this.storage);
      keys.forEach(key => {
        if (key.startsWith('ups_')) {
          this.storage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear storage data:', error);
    }
  }

  // Clear specific data type
  clearData(prefix: string): void {
    try {
      const keys = Object.keys(this.storage);
      keys.forEach(key => {
        if (key.startsWith(`ups_${prefix}_`)) {
          this.storage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn(`Failed to clear ${prefix} data:`, error);
    }
  }
}

// Export singleton instance
export const stateManager = StateManagementService.getInstance();