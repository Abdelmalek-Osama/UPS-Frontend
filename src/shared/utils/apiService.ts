/**
 * API Service
 * Centralized API service for all HTTP requests in the application
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * Helper function to build URL with query parameters
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }
  
  return url.toString();
}

/**
 * Helper function to get authentication headers
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/**
 * Helper function to handle API responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
  
  // Handle no-content responses
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

/**
 * GET request
 * @param endpoint - API endpoint (e.g., '/users', '/sites/123')
 * @param options - Optional request options including query params
 */
export async function get<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const url = buildUrl(endpoint, options?.params);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    ...options,
  });
  
  return handleResponse<T>(response);
}

/**
 * POST request
 * @param endpoint - API endpoint (e.g., '/users', '/sites')
 * @param data - Request body data
 * @param options - Optional request options
 */
export async function post<T, D = unknown>(
  endpoint: string,
  data?: D,
  options?: RequestOptions
): Promise<T> {
  const url = buildUrl(endpoint, options?.params);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
  
  return handleResponse<T>(response);
}

/**
 * PUT request
 * @param endpoint - API endpoint (e.g., '/users/123', '/sites/456')
 * @param data - Request body data
 * @param options - Optional request options
 */
export async function put<T, D = unknown>(
  endpoint: string,
  data?: D,
  options?: RequestOptions
): Promise<T> {
  const url = buildUrl(endpoint, options?.params);
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
  
  return handleResponse<T>(response);
}

/**
 * DELETE request
 * @param endpoint - API endpoint (e.g., '/users/123', '/sites/456')
 * @param options - Optional request options
 */
export async function del<T>(
  endpoint: string,
  options?: RequestOptions
): Promise<T> {
  const url = buildUrl(endpoint, options?.params);
  
  const response = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    ...options,
  });
  
  return handleResponse<T>(response);
}

/**
 * PATCH request
 * @param endpoint - API endpoint (e.g., '/users/123', '/sites/456')
 * @param data - Request body data
 * @param options - Optional request options
 */
export async function patch<T, D = unknown>(
  endpoint: string,
  data?: D,
  options?: RequestOptions
): Promise<T> {
  const url = buildUrl(endpoint, options?.params);
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
  
  return handleResponse<T>(response);
}

// Default export with all methods
const apiService = {
  get,
  post,
  put,
  delete: del,
  patch,
};

export default apiService;
