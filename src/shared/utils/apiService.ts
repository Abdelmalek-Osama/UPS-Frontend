/**
 * API Service
 * Centralized API service for all HTTP requests in the application using Axios
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import i18n from '../../i18n';
import { getAccessToken, getRefreshToken, setAuthCookies, removeAuthCookies } from './cookieService';
import type { Site } from '../../features/sites/types';
import type { RecentAlarmEvent, ReadingLog } from '../../features/dashboard/types';

let onLogoutCallback: (() => void) | null = null;

export const setLogoutCallback = (callback: () => void) => {
  onLogoutCallback = callback;
};

let logoutInitiated = false; // New flag to prevent multiple logout triggers

//const API_BASE_URL = 'https://localhost:5001/api/';
//const API_BASE_URL = 'https://localhost:7123/api/';
const API_BASE_URL = 'https://fw3.soft-trend.com:8883/api/';
//const API_BASE_URL = "https://dairoot.duckdns.org:5050/api"


/**
 * Create axios instance with default configuration
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Create a separate axios instance for refresh token requests without interceptors
 */
const axiosRefreshInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add authentication token
 */
axiosInstance.interceptors.request.use(
  (config: any) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log full request config for debugging
    if (config.url?.includes('/v1/Sites')) {
      console.log('Axios Request Config:', JSON.stringify({
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data
      }, null, 2));
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

export interface AuthResponse {
  fullName: string;
  email: string;
  role: 'Admin' | 'Operator';
  lastLoginDate: Date;
  accessToken: string;
  accessTokenExpiryDate: Date;
  refreshToken: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export interface UserDto {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Operator';
  sites?: Site[]; // Added sites property as an array of Site objects
  isActive: boolean;
  createdAt: string;
  updatedAt?: Date;
  lastLoginAt?: Date;
}

let isRefreshing = false;
let failedRequestsQueue: any[] = [];

const processQueue = (error: AxiosError | Error | null, token: string | null = null) => {
  failedRequestsQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedRequestsQueue = [];
};

// Helper function to translate known API error messages
const translateApiError = (errorMessage: string): string => {
  // Map of known API error messages to i18n keys
  const errorMap: Record<string, string> = {
    'The AlarmName field is required.': 'errors.alarmNameRequired',
    'The SiteId field is required.': 'errors.siteIdRequired',
    'The method field is required.': 'errors.methodRequired',
    'The Emails field is required.': 'errors.emailsRequired',
    'The Phones field is required.': 'errors.phonesRequired',
    'The monitoringHours field is required.': 'errors.monitoringHoursRequired',
    'The pumpStatusOperation field is required.': 'errors.pumpStatusOperationRequired',
    'The MonitoringHours field is required.': 'errors.monitoringHoursRequired',
    'Failed to create pump status PS alarm.': 'errors.failedToCreateAlarm',
    'Failed to update pump status PS alarm.': 'errors.failedToUpdateAlarm',
    'An unexpected error occurred.': 'errors.unexpectedError',
  };

  const translationKey = errorMap[errorMessage];
  if (translationKey) {
    return i18n.t(translationKey, { ns: 'translation' });
  }
  return errorMessage;
};

// Helper function to extract the most specific error message from Axios response data
const getErrorMessageFromResponseData = (responseData: any): string => {
  let errorMessage = i18n.t('errors.unexpectedError', { ns: 'translation' }); // Default ultimate fallback

  if (responseData.errors) {
    let validationErrors: string[] = [];
    for (const key in responseData.errors) {
      if (Array.isArray(responseData.errors[key])) {
        // Translate each validation error
        const translatedErrors = responseData.errors[key].map((err: string) => translateApiError(err));
        validationErrors = validationErrors.concat(translatedErrors);
      }
    }
    if (validationErrors.length > 0) {
      return validationErrors.join(', '); // Prioritize validation errors
    } else if (typeof responseData.title === 'string' && responseData.title.trim() !== '') {
      return translateApiError(responseData.title); // Fallback to title if errors object is empty
    } else if (typeof responseData.message === 'string' && responseData.message.trim() !== '') {
      return translateApiError(responseData.message); // Fallback to message if errors object and title are empty
    } else {
      return i18n.t('errors.validationError', { ns: 'translation' }); // Generic validation error fallback
    }
  } else if (typeof responseData.message === 'string' && responseData.message.trim() !== '') {
    return translateApiError(responseData.message); // Prioritize general message
  } else if (typeof responseData.title === 'string' && responseData.title.trim() !== '') {
    return translateApiError(responseData.title); // Fallback to title
  }
  return errorMessage;
};

/**
 * Response interceptor to handle errors globally and refresh token
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // If the error is 401 and it's the login endpoint, do not attempt to refresh the token.
    if (error.response?.status === 401 && originalRequest?.url?.includes('/v1/Auth/login')) {
      const customErrorMessage = getErrorMessageFromResponseData(error.response.data); // Use helper to get the specific message
      return Promise.reject(new Error(customErrorMessage)); // Reject with a custom error message
    }

    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = getRefreshToken();

          if (refreshToken) {
            try {
              const response = await axiosRefreshInstance.post<ApiResponse<AuthResponse>>(`/v1/Auth/refresh`, { refreshToken });
              const { accessToken, accessTokenExpiryDate, refreshToken: newRefreshToken } = response.data.data;
              setAuthCookies(accessToken, newRefreshToken, new Date(accessTokenExpiryDate));
              axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }
              processQueue(null, accessToken);
              return axiosInstance(originalRequest);
            } catch (refreshError: any) {
              clearAllUserData(); // Clear all user data on refresh token failure
              processQueue(refreshError, null);
              if (!logoutInitiated && onLogoutCallback) {
                logoutInitiated = true; // Set flag to true
                onLogoutCallback(); // Call callback before throwing error
              } else if (!logoutInitiated) {
                logoutInitiated = true; // Set flag to true
                window.location.href = '/logout'; // Fallback if callback not set
              }

              let errorMessage = 'فشل في تحديث الرمز المميز. يرجى تسجيل الدخول مرة أخرى.'; // Default custom error message
              
              let errorMessage = i18n.t('errors.tokenRefreshFailed', { ns: 'translation' }); // Default custom error message
              if (refreshError.isAxiosError && refreshError.response && refreshError.response.data) {
                errorMessage = getErrorMessageFromResponseData(refreshError.response.data); // Use helper for refresh error
              }
              throw new Error(errorMessage);
            }
          } else {
            clearAllUserData(); // Clear all user data if no refresh token
            processQueue(new Error(i18n.t('errors.noRefreshToken', { ns: 'translation' })), null); // Custom error message
            if (!logoutInitiated && onLogoutCallback) {
              logoutInitiated = true; // Set flag to true
              onLogoutCallback(); // Call callback before throwing error
            } else if (!logoutInitiated) {
              logoutInitiated = true; // Set flag to true
              window.location.href = '/logout'; // Fallback if callback not set
            }
            throw new Error(i18n.t('errors.noRefreshToken', { ns: 'translation' })); // Custom error message
          }
        } else {
          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({ resolve, reject });
          })
            .then(token => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return axiosInstance(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }
      } finally {
        isRefreshing = false;
        // Reset logoutInitiated after a short delay to allow subsequent logins if needed
        setTimeout(() => {
          logoutInitiated = false;
        }, 1000);
      }
    } else if (error.response) {
      // Server responded with error
      const responseData: any = error.response.data; // Cast to any to access properties
      const customErrorMessage = getErrorMessageFromResponseData(responseData); // Use helper to get the message
      throw new Error(customErrorMessage);
    } else if (error.request) {
      // Request made but no response
      throw new Error(i18n.t('errors.noServerResponse')); // Custom network error message
    } else {
      // Something else happened
      throw new Error(i18n.t('errors.unexpectedError')); // Custom generic error message
    }
  }
);

interface RequestOptions extends AxiosRequestConfig {
  params?: Record<string, string | number | boolean>;
}

/**
 * GET request
 * @param endpoint - API endpoint (e.g., '/users', '/sites/123')
 * @param options - Optional Axios request options including query params
 */
export async function get<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const response = await axiosInstance.get<T>(endpoint, options);
  return response.data;
}

/**
 * POST request
 * @param endpoint - API endpoint (e.g., '/users', '/sites')
 * @param data - Request body data
 * @param options - Optional Axios request options
 */
export async function post<T, D = unknown>(
  endpoint: string,
  data?: D,
  options?: RequestOptions
): Promise<T> {
  const response = await axiosInstance.post<T>(endpoint, data, options);
  return response.data;
}

/**
 * PUT request
 * @param endpoint - API endpoint (e.g., '/users/123', '/sites/456')
 * @param data - Request body data
 * @param options - Optional Axios request options
 */
export async function put<T, D = unknown>(
  endpoint: string,
  data?: D,
  options?: RequestOptions
): Promise<T> {
  const response = await axiosInstance.put<T>(endpoint, data, options);
  return response.data;
}

/**
 * DELETE request
 * @param endpoint - API endpoint (e.g., '/users/123', '/sites/456')
 * @param options - Optional Axios request options
 */
export async function del<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const response = await axiosInstance.delete<T>(endpoint, options);
  return response.data;
}

/**
 * PATCH request
 * @param endpoint - API endpoint (e.g., '/users/123', '/sites/456')
 * @param data - Request body data
 * @param options - Optional Axios request options
 */
export async function patch<T, D = unknown>(
  endpoint: string,
  data?: D,
  options?: RequestOptions
): Promise<T> {
  const response = await axiosInstance.patch<T>(endpoint, data, options);
  return response.data;
}

export const refreshAccessToken = async (refreshToken: string): Promise<ApiResponse<AuthResponse>> => {
  const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/v1/Auth/refresh', { refreshToken });
  return response.data;
};

export const loginUser = async (credentials: any): Promise<ApiResponse<AuthResponse>> => {
  const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/v1/Auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData: any): Promise<UserDto> => {
  const response = await axiosInstance.post<UserDto>('/v1/Users', userData);
  return response.data;
};

export const getRecentAlarmEvents = async (): Promise<ApiResponse<RecentAlarmEvent[]>> => {
  const response = await axiosInstance.get<ApiResponse<RecentAlarmEvent[]>>('/v1/AlarmEvents/recent');
  return response.data;
};

export const getRecentReadingLogs = async (): Promise<ApiResponse<ReadingLog[]>> => {
  const response = await axiosInstance.get<ApiResponse<ReadingLog[]>>('/v1/ReadingLogs/recent');
  return response.data;
};

export const logoutUser = async (): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post<ApiResponse<any>>('/v1/Auth/logout');
  clearAllUserData(); // Use the centralized function
  return response.data;
};

export const clearAllUserData = () => {
  removeAuthCookies();
  localStorage.clear();
  sessionStorage.clear();
  // Also explicitly set isLogged to false in session storage
  sessionStorage.setItem('isLogged', 'false');
  // Explicitly remove Authorization header from axios instance defaults
  delete axiosInstance.defaults.headers.common['Authorization'];
};

/**
 * Download file as blob
 * @param endpoint - API endpoint (e.g., '/v1/readings/export')
 * @param filename - Suggested filename for the download
 * @param options - Optional Axios request options including query params
 */
export async function downloadFile(
  endpoint: string,
  filename: string,
  options?: RequestOptions
): Promise<void> {
  try {
    const response = await axiosInstance.get(endpoint, {
      ...options,
      responseType: 'blob',
    });

    // Try to get filename from Content-Disposition header if available
    let downloadFilename = filename;
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        downloadFilename = filenameMatch[1].replace(/['"]/g, '');
        // Handle UTF-8 encoded filenames
        if (downloadFilename.startsWith('UTF-8\'\'')) {
          downloadFilename = decodeURIComponent(downloadFilename.replace(/^UTF-8''/, ''));
        }
      }
    }

    // Determine content type from response or blob
    const contentType = response.headers['content-type'] || response.data.type || 'application/octet-stream';

    // Create a blob from the response with proper content type
    const blob = new Blob([response.data], { type: contentType });

    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('Error downloading file', error);
    throw error;
  }
}

// Export axios instance for direct use if needed
export { axiosInstance };

// Default export with all methods
const apiService = {
  get,
  post,
  put,
  delete: del,
  patch,
  refreshAccessToken,
  loginUser,
  registerUser,
  logoutUser,
  downloadFile,
  instance: axiosInstance,
};

export default apiService;
