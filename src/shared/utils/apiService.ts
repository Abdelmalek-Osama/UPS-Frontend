/**
 * API Service
 * Centralized API service for all HTTP requests in the application using Axios
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getAccessToken, getRefreshToken, setAuthCookies, removeAuthCookies } from './cookieService';

const API_BASE_URL = 'http://softtrend.ddns.net:8883/api/';

/**
 * Create axios instance with default configuration
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
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
  isActive: boolean;
  createdAt: Date;
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

/**
 * Response interceptor to handle errors globally and refresh token
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // If the error is 401 and it's the login endpoint, do not attempt to refresh the token.
    if (error.response?.status === 401 && originalRequest?.url?.includes('/v1/Auth/login')) {
      return Promise.reject(error); // Directly reject so LoginPage can handle it
    }

    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = getRefreshToken();

          if (refreshToken) {
            try {
              const response = await axiosInstance.post<ApiResponse<AuthResponse>>(`/v1/Auth/refresh`, { refreshToken });
              const { accessToken, accessTokenExpiryDate, refreshToken: newRefreshToken } = response.data.data;
              setAuthCookies(accessToken, newRefreshToken, new Date(accessTokenExpiryDate));
              axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }
              processQueue(null, accessToken);
              return axiosInstance(originalRequest);
            } catch (refreshError: any) {
              removeAuthCookies();
              processQueue(refreshError, null);
              console.error('Unable to refresh token', refreshError);
              throw refreshError;
            }
          } else {
            removeAuthCookies();
            processQueue(new Error('No refresh token available'), null);
            throw new Error('No refresh token available');
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
      }
    } else if (error.response) {
      // Server responded with error
      const errorMessage = (error.response.data as any)?.message || error.message;
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message);
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

export const refreshAccessToken = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/v1/Auth/refresh', { refreshToken });
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
  instance: axiosInstance,
};

export default apiService;
