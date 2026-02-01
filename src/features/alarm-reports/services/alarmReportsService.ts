/**
 * Alarm Reports API Service
 */

import apiService from '../../../shared/utils/apiService';
import type {
  AlarmReportConfiguration,
  CreateAlarmReportPayload,
  ApiResponse
} from '../types';

export const alarmReportsService = {
  /**
   * Fetch all email report configurations
   */
  async getReportConfigurations(): Promise<AlarmReportConfiguration[]> {
    const response = await apiService.get<ApiResponse<AlarmReportConfiguration[]> | AlarmReportConfiguration[]>(
      '/v1/email-reports'
    );

    // Handle different response formats
    if (Array.isArray(response)) {
      return response;
    }

  if (response && typeof response === 'object' && 'data' in response) {
      const data = (response as ApiResponse<AlarmReportConfiguration[]>).data;
return Array.isArray(data) ? data : [];
    }

    return [];
  },

  /**
   * Create a new email report configuration
   */
  async createReportConfiguration(payload: CreateAlarmReportPayload): Promise<AlarmReportConfiguration> {
    const response = await apiService.post<ApiResponse<AlarmReportConfiguration>>(
      '/v1/email-reports',
      payload
    );

    if (response && typeof response === 'object' && 'data' in response) {
      return (response as ApiResponse<AlarmReportConfiguration>).data;
    }

  return response as AlarmReportConfiguration;
},

  /**
   * Delete an email report configuration
   */
  async deleteReportConfiguration(id: number): Promise<void> {
    await apiService.delete<ApiResponse<void>>(
      `/v1/email-reports/${id}`
 );
  }
};

export default alarmReportsService;
