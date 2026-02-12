import { DataServiceFactory } from '../services/DataServiceFactory';

/**
 * API Configuration utility
 * Provides easy switching between demo and live modes
 */
export class ApiConfig {
  private static readonly DEMO_MODE_KEY = 'ups_demo_mode';
  private static readonly API_BASE_URL_KEY = 'ups_api_base_url';

  /**
   * Initialize API configuration based on environment and stored preferences
   */
  static initialize(): void {
    const isDemoMode = this.isDemoMode();
    const apiBaseUrl = this.getApiBaseUrl();

    DataServiceFactory.configure({
      mode: isDemoMode ? 'demo' : 'live',
      apiBaseUrl: apiBaseUrl,
      enableCaching: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
    });
  }

  /**
   * Switch to demo mode
   */
  static enableDemoMode(): void {
    localStorage.setItem(this.DEMO_MODE_KEY, 'true');
    DataServiceFactory.switchMode('demo');
  }

  /**
   * Switch to live mode with optional API base URL
   */
  static enableLiveMode(apiBaseUrl?: string): void {
    localStorage.setItem(this.DEMO_MODE_KEY, 'false');
    
    if (apiBaseUrl) {
      this.setApiBaseUrl(apiBaseUrl);
    }

    DataServiceFactory.configure({
      mode: 'live',
      apiBaseUrl: this.getApiBaseUrl(),
    });
  }

  /**
   * Check if currently in demo mode
   */
  static isDemoMode(): boolean {
    // Check environment variable first
    if (import.meta.env.VITE_FORCE_DEMO_MODE === 'true') {
      return true;
    }

    // Check localStorage
    const stored = localStorage.getItem(this.DEMO_MODE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }

    // Default to demo mode in development, live in production
    return import.meta.env.DEV;
  }

  /**
   * Get the API base URL
   */
  static getApiBaseUrl(): string {
    // Check environment variable first
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl) {
      return envUrl;
    }

    // Check localStorage
    const stored = localStorage.getItem(this.API_BASE_URL_KEY);
    if (stored) {
      return stored;
    }

    // Default URLs
    return import.meta.env.DEV ? 'http://localhost:5000/api/v1' : '/api/v1';
  }

  /**
   * Set the API base URL
   */
  static setApiBaseUrl(url: string): void {
    localStorage.setItem(this.API_BASE_URL_KEY, url);
    
    if (!this.isDemoMode()) {
      DataServiceFactory.configure({
        mode: 'live',
        apiBaseUrl: url,
      });
    }
  }

  /**
   * Get current configuration status
   */
  static getStatus(): {
    mode: 'demo' | 'live';
    apiBaseUrl: string;
    isDemoMode: boolean;
  } {
    return {
      mode: this.isDemoMode() ? 'demo' : 'live',
      apiBaseUrl: this.getApiBaseUrl(),
      isDemoMode: this.isDemoMode(),
    };
  }

  /**
   * Reset to default configuration
   */
  static reset(): void {
    localStorage.removeItem(this.DEMO_MODE_KEY);
    localStorage.removeItem(this.API_BASE_URL_KEY);
    this.initialize();
  }
}

// Auto-initialize on module load
ApiConfig.initialize();