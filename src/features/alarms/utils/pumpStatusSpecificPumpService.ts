/**
 * Pump Status Specific Pump Alarm Service
 * Handles all API operations for pump status specific pump alarms
 * Endpoints:
 * - POST /api/v1/alarms/pump-status-specific-pump
 * - GET /api/v1/alarms/pump-status-specific-pump
 * - PUT /api/v1/alarms/pump-status-specific-pump/{id}
 * - GET /api/v1/alarms/pump-status-specific-pump/{id}
 * - GET /api/v1/alarms/pump-status-specific-pump/by-site/{siteId}
 */

import apiService, { ApiResponse } from '../../../shared/utils/apiService';
import type { CreatePumpStatusIdvAlarmRequest, PumpStatusIdvResponse } from '../types';

const BASE_ENDPOINT = '/v1/alarms/pump-status-specific-pump';

/**
 * Create a new pump status specific pump alarm
 */
export const createPumpStatusSpecificPumpAlarm = async (
  alarmData: CreatePumpStatusIdvAlarmRequest
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    console.log('Service: Sending pump status alarm request:', alarmData);
    const response = await apiService.post<any, CreatePumpStatusIdvAlarmRequest>(
      BASE_ENDPOINT,
      alarmData
    );
    console.log('Service: Response received:', response);
    return {
      success: response.isSuccess,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Failed to create pump status specific pump alarm:', error);
    return {
      success: false,
      message: error.message || 'Failed to create alarm',
    };
  }
};

/**
 * Fetch all pump status specific pump alarms
 */
export const fetchAllPumpStatusSpecificPumpAlarms = async (): Promise<{
  success: boolean;
  data: PumpStatusIdvResponse[];
  message: string;
}> => {
  try {
    const response = await apiService.get<{
      isSuccess: boolean;
      data: PumpStatusIdvResponse[];
      message: string;
    }>(BASE_ENDPOINT);
    return {
      success: response.isSuccess,
      data: response.data || [],
      message: response.message || 'Successfully fetched alarms',
    };
  } catch (error: any) {
    console.error('Failed to fetch pump status specific pump alarms:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch alarms',
    };
  }
};

/**
 * Fetch a specific pump status specific pump alarm by ID
 */
export const fetchPumpStatusSpecificPumpAlarmById = async (
  id: number
): Promise<{
  success: boolean;
  data?: PumpStatusIdvResponse;
  message: string;
}> => {
  try {
    const response = await apiService.get<{
      isSuccess: boolean;
      data: PumpStatusIdvResponse;
      message: string;
    }>(`${BASE_ENDPOINT}/${id}`);
    return {
      success: response.isSuccess,
      data: response.data,
      message: response.message || 'Successfully fetched alarm',
    };
  } catch (error: any) {
    console.error(`Failed to fetch pump status specific pump alarm ${id}:`, error);
    return {
      success: false,
      message: error.message || 'Failed to fetch alarm',
    };
  }
};

/**
 * Fetch pump status specific pump alarms by site ID
 */
export const fetchPumpStatusSpecificPumpAlarmsBySiteId = async (
  siteId: number
): Promise<{
  success: boolean;
  data: PumpStatusIdvResponse[];
  message: string;
}> => {
  try {
    const response = await apiService.get<{
      isSuccess: boolean;
      data: PumpStatusIdvResponse[];
      message: string;
    }>(`${BASE_ENDPOINT}/by-site/${siteId}`);
    return {
      success: response.isSuccess,
      data: response.data || [],
      message: response.message || 'Successfully fetched alarms',
    };
  } catch (error: any) {
    console.error(`Failed to fetch pump status specific pump alarms for site ${siteId}:`, error);
    return {
      success: false,
      data: [],
      message: error.message || 'Failed to fetch alarms',
    };
  }
};

/**
 * Update a pump status specific pump alarm
 */
export const updatePumpStatusSpecificPumpAlarm = async (
  id: number,
  alarmData: CreatePumpStatusIdvAlarmRequest
): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const response = await apiService.put<any, CreatePumpStatusIdvAlarmRequest>(
      `${BASE_ENDPOINT}/${id}`,
      alarmData
    );
    return {
      success: response.isSuccess,
      message: response.message,
      data: response.data,
    };
  } catch (error: any) {
    console.error(`Failed to update pump status specific pump alarm ${id}:`, error);
    return {
      success: false,
      message: error.message || 'Failed to update alarm',
    };
  }
};

/**
 * Delete a pump status specific pump alarm
 */
export const deletePumpStatusSpecificPumpAlarm = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiService.delete<{
      isSuccess: boolean;
      message: string;
    }>(`${BASE_ENDPOINT}/${id}`);
    return {
      success: response.isSuccess,
      message: response.message || 'Successfully deleted alarm',
    };
  } catch (error: any) {
    console.error(`Failed to delete pump status specific pump alarm ${id}:`, error);
    return {
      success: false,
      message: error.message || 'Failed to delete alarm',
    };
  }
};
