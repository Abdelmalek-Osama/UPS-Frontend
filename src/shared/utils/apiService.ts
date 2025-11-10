/**
 * API Service
 * Centralized API service for all HTTP requests in the application using Axios
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = 'https://localhost:7123/api';

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
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle errors globally
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    if (error.response) {
      // Server responded with error
      const errorMessage = error.response.data?.message || error.message;
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

// Export axios instance for direct use if needed
export { axiosInstance };

// Default export with all methods
const apiService = {
  get,
  post,
  put,
  delete: del,
  patch,
  instance: axiosInstance,
};

export default apiService;
