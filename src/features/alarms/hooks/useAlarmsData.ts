import { useState, useEffect } from 'react';
import type { ValueThresholdAlarm, CommunicationAlarm, ThresholdAlarmResponse, CommunicationAlarmResponse, CreateThresholdAlarmRequest, CreateCommunicationAlarmRequest } from '../types';
import { Severity } from '../types'; // Import Severity enum
import apiService from '../../../shared/utils/apiService';
 
export function useAlarmsData() {
  const [thresholdAlarms, setThresholdAlarms] = useState<ValueThresholdAlarm[]>([]);
 
  const [communicationAlarms, setCommunicationAlarms] = useState<CommunicationAlarmResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
 
  const mapToValueThresholdAlarm = (apiAlarm: ThresholdAlarmResponse): ValueThresholdAlarm => {
    const recipients = [
      ...(apiAlarm.emails ? apiAlarm.emails.split(',').map(s => s.trim()).filter(Boolean) : []),
      ...(apiAlarm.phones ? apiAlarm.phones.split(',').map(s => s.trim()).filter(Boolean) : []),
    ];
 
    return {
      id: apiAlarm.alarmId,
      siteId: apiAlarm.siteId,
      site: apiAlarm.siteName,
      alarmName: apiAlarm.alarmName,
      method: apiAlarm.method, // Use actual method from API
      field: String(apiAlarm.fieldName), // Assuming fieldName is a number that needs to be converted to a string
      operator: String(apiAlarm.operator), // Assuming operator is a number that needs to be converted to a string
      threshold: apiAlarm.thresholdValue,
      color: apiAlarm.colorCode,
      severity: apiAlarm.severity === 0 ? 'Warning' : 'Critical', // Assuming 0 is Warning, 1 is Critical
      recipients: recipients || [], // Ensure recipients is always an array
    };
  };
 
  const fetchAlarms = async () => {
    setIsLoading(true); // Set loading to true before fetching
    try {
      const thresholdResponse = await apiService.get<{ isSuccess: boolean; data: ThresholdAlarmResponse[] }>('/v1/alarm/threshold');
      if (thresholdResponse.isSuccess) {
        setThresholdAlarms(thresholdResponse.data.map(mapToValueThresholdAlarm));
      }
 
      const communicationResponse = await apiService.get<{ isSuccess: boolean; data: CommunicationAlarmResponse[] }>('/v1/alarm/communication');
      if (communicationResponse.isSuccess) {
        setCommunicationAlarms(communicationResponse.data);
      } else {
        console.error("Failed to fetch communication alarms, isSuccess was false:", communicationResponse);
      }
    } catch (error) {
      console.error('Failed to fetch alarms:', error); // Log the actual error object
    } finally {
      setIsLoading(false); // Set loading to false after fetching (success or failure)
    }
  };
 
  useEffect(() => {
    fetchAlarms();
  }, []);
 
  // Removed hardcoded sites, fields, and operators as they are either fetched via useSitesData or will be determined dynamically
  const sites: string[] = []; // Placeholder, as sites are fetched by useSitesData
  const fields: string[] = []; // Placeholder, as fields might come from an API or be static in AlarmConfiguration
  const operators: string[] = []; // Placeholder, as operators might come from an API or be static in AlarmConfiguration
 
  const [isAddCommOpen, setIsAddCommOpen] = useState(false);
  const addThresholdAlarm = (newAlarm: ValueThresholdAlarm) => {
    setThresholdAlarms((prevAlarms) => [...prevAlarms, { ...newAlarm, id: prevAlarms.length > 0 ? Math.max(...prevAlarms.map(a => a.id)) + 1 : 1 }]);
  };
 
  const createThresholdAlarm = async (alarmData: CreateThresholdAlarmRequest) => {
    try {
      const response = await apiService.post<any, CreateThresholdAlarmRequest>('/v1/alarm/threshold', alarmData);
      if (response.isSuccess) {
        fetchAlarms(); // Re-fetch alarms to update the list
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error('Failed to create threshold alarm:', error);
      return { success: false, message: error.message };
    }
  };
 
  const createCommunicationAlarm = async (alarmData: CreateCommunicationAlarmRequest) => {
    try {
      const response = await apiService.post<any, CreateCommunicationAlarmRequest>('/v1/alarm/communication', alarmData);
      if (response.isSuccess) {
        fetchAlarms(); // Re-fetch alarms to update the list
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error('Failed to create communication alarm:', error);
      return { success: false, message: error.message };
    }
  };
 
  const updateThresholdAlarm = async (alarmId: number, alarmData: CreateThresholdAlarmRequest) => {
    try {
      const response = await apiService.put<any, CreateThresholdAlarmRequest>(`/v1/alarm/threshold/${alarmId}`, alarmData);
      if (response.isSuccess) {
        fetchAlarms(); // Re-fetch alarms to update the list
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error(`Failed to update threshold alarm ${alarmId}:`, error);
      return { success: false, message: error.message };
    }
  };
 
  const updateCommunicationAlarm = async (alarmId: number, alarmData: CreateCommunicationAlarmRequest) => {
    try {
      const response = await apiService.put<any, CreateCommunicationAlarmRequest>(`/v1/alarm/communication/${alarmId}`, alarmData);
      if (response.isSuccess) {
        fetchAlarms(); // Re-fetch alarms to update the list
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error(`Failed to update communication alarm ${alarmId}:`, error);
      return { success: false, message: error.message };
    }
  };
 
  return {
    thresholdAlarms,
    setThresholdAlarms,
    communicationAlarms,
    setCommunicationAlarms,
    isAddCommOpen,
    setIsAddCommOpen,
    sites,
    fields,
    operators,
    addThresholdAlarm,
    createThresholdAlarm,
    createCommunicationAlarm,
    updateThresholdAlarm,
    updateCommunicationAlarm,
    isLoading, // Return isLoading state
  };
}
 
 