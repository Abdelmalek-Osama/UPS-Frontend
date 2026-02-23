import { useState, useEffect } from 'react';
import type { ValueThresholdAlarm, CreateThresholdAlarmRequest, CreateCommunicationAlarmRequest, CommunicationAlarmResponse, SensorStatusResponse, PumpStatusPSResponse, PumpStatusIdvResponse, CreateSensorStatusAlarmRequest, CreatePumpStatusPSAlarmRequest, CreatePumpStatusIdvAlarmRequest, SiteConfiguration } from '../types';
import { Severity } from '../types'; // Import Severity enum
import apiService, { ApiResponse } from '../../../shared/utils/apiService';
import {
  fetchAllPumpStatusSpecificPumpAlarms,
  fetchPumpStatusSpecificPumpAlarmById,
  fetchPumpStatusSpecificPumpAlarmsBySiteId,
  createPumpStatusSpecificPumpAlarm,
  updatePumpStatusSpecificPumpAlarm,
  deletePumpStatusSpecificPumpAlarm,
} from '../utils/pumpStatusSpecificPumpService';

interface ThresholdAlarmApiResponse {
  alarmId: number;
  siteId: number;
  siteName: string;
  alarmName: string;
  fieldName: number;
  criticalOperator: number;
  criticalThresholdValue: number;
  criticalColorCode: string;
  crisisOperator: number;
  crisisThresholdValue: number;
  crisisColorCode?: string;
  emails: string;
  phones: string;
}
 
export function useAlarmsData() {
  const [thresholdAlarms, setThresholdAlarms] = useState<ValueThresholdAlarm[]>([]);
 
  const [communicationAlarms, setCommunicationAlarms] = useState<CommunicationAlarmResponse[]>([]);
  const [sensorStatusAlarms, setSensorStatusAlarms] = useState<SensorStatusResponse[]>([]);
  const [pumpStatusPSAlarms, setPumpStatusPSAlarms] = useState<PumpStatusPSResponse[]>([]);
  const [pumpStatusIdvAlarms, setPumpStatusIdvAlarms] = useState<PumpStatusIdvResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [fetchError, setFetchError] = useState<boolean>(false); // Added error state
  const [pumpStatusIdvSiteConfiguration, setPumpStatusIdvSiteConfiguration] = useState<SiteConfiguration | undefined>(undefined);
  const [pumpStatusIdvConfigLoading, setPumpStatusIdvConfigLoading] = useState(false);
  const [pumpStatusPSSiteConfiguration, setPumpStatusPSSiteConfiguration] = useState<SiteConfiguration | undefined>(undefined);
  const [pumpStatusPSConfigLoading, setPumpStatusPSConfigLoading] = useState(false);
 
  const mapToValueThresholdAlarm = (apiAlarm: ThresholdAlarmApiResponse): ValueThresholdAlarm => {
    const recipients = [
      ...(apiAlarm.emails ? apiAlarm.emails.split(',').map(s => s.trim()).filter(Boolean) : []),
      ...(apiAlarm.phones ? apiAlarm.phones.split(',').map(s => s.trim()).filter(Boolean) : []),
    ];
 
    return {
      id: apiAlarm.alarmId,
      siteId: apiAlarm.siteId,
      site: apiAlarm.siteName,
      alarmName: apiAlarm.alarmName,
      field: apiAlarm.fieldName,
      criticalOperator: apiAlarm.criticalOperator,
      criticalThresholdValue: apiAlarm.criticalThresholdValue,
      criticalColorCode: apiAlarm.criticalColorCode,
      crisisOperator: apiAlarm.crisisOperator,
      crisisThresholdValue: apiAlarm.crisisThresholdValue,
      crisisColorCode: apiAlarm.crisisColorCode,
      severity: 'Critical',
      recipients: recipients || [],
    };
  };
 
  const fetchAlarms = async () => {
    setIsLoading(true); // Set loading to true before fetching
    setFetchError(false); // Reset error state
    let hasError = false;
    try {
      const thresholdResponse = await apiService.get<{ isSuccess: boolean; data: ThresholdAlarmApiResponse[] }>('/v1/alarm/threshold');
      if (thresholdResponse.isSuccess) {
        setThresholdAlarms(thresholdResponse.data.map(mapToValueThresholdAlarm));
      } else {
        console.error('Failed to fetch threshold alarms, isSuccess was false:', thresholdResponse);
        hasError = true;
      }
 
      const communicationResponse = await apiService.get<{ isSuccess: boolean; data: CommunicationAlarmResponse[] }>('/v1/alarm/communication');
      if (communicationResponse.isSuccess) {
        setCommunicationAlarms(communicationResponse.data);
      } else {
        console.error("Failed to fetch communication alarms, isSuccess was false:", communicationResponse);
        hasError = true;
      }

      const sensorStatusResponse = await apiService.get<{ isSuccess: boolean; data: SensorStatusResponse[] }>('/v1/alarm/sensor-status');
      if (sensorStatusResponse.isSuccess) {
        setSensorStatusAlarms(sensorStatusResponse.data);
      } else {
        console.error("Failed to fetch sensor status alarms, isSuccess was false:", sensorStatusResponse);
        hasError = true;
      }

      const pumpStatusPSResponse = await apiService.get<{ isSuccess: boolean; data: PumpStatusPSResponse[] }>('/v1/alarm/pump-status-operation');
      if (pumpStatusPSResponse.isSuccess) {
        setPumpStatusPSAlarms(pumpStatusPSResponse.data);
      } else {
        console.error("Failed to fetch pump status PS alarms, isSuccess was false:", pumpStatusPSResponse);
        hasError = true;
      }

      const pumpStatusIdvResponse = await fetchAllPumpStatusSpecificPumpAlarms();
      if (pumpStatusIdvResponse.success) {
        setPumpStatusIdvAlarms(pumpStatusIdvResponse.data);
      } else {
        console.error("Failed to fetch pump status IDV alarms:", pumpStatusIdvResponse.message);
        hasError = true;
      }
      
      if (hasError) {
        setFetchError(true);
      }
    } catch (error) {
      console.error('An error occurred while fetching alarms:', error); // Log the actual error object
      setFetchError(true); // Set error state on network failure
    } finally {
      setIsLoading(false); // Set loading to false after fetching (success or failure)
    }
  };
 
  useEffect(() => {
    fetchAlarms();
  }, []);

  const fetchPumpStatusIdvSiteConfiguration = async (siteId: number) => {
    setPumpStatusIdvConfigLoading(true);
    try {
      const response = await apiService.get<ApiResponse<SiteConfiguration>>(`/v1/Sites/${siteId}`);
      setPumpStatusIdvSiteConfiguration(response.data);
    } catch (error) {
      console.error("Failed to fetch site configuration:", error);
      setPumpStatusIdvSiteConfiguration(undefined);
    } finally {
      setPumpStatusIdvConfigLoading(false);
    }
  };

  const fetchPumpStatusPSSiteConfiguration = async (siteId: number) => {
    setPumpStatusPSConfigLoading(true);
    try {
      const response = await apiService.get<ApiResponse<SiteConfiguration>>(`/v1/Sites/${siteId}`);
      setPumpStatusPSSiteConfiguration(response.data);
    } catch (error) {
      console.error("Failed to fetch site configuration:", error);
      setPumpStatusPSSiteConfiguration(undefined);
    } finally {
      setPumpStatusPSConfigLoading(false);
    }
  };
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

  const createSensorStatusAlarm = async (alarmData: CreateSensorStatusAlarmRequest) => {
    try {
      console.log('POST /v1/alarm/sensor-status - Parameters:', alarmData);
      const response = await apiService.post<any, CreateSensorStatusAlarmRequest>('/v1/alarm/sensor-status', alarmData);
      if (response.isSuccess) {
        fetchAlarms(); // Re-fetch alarms to update the list
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error('Failed to create sensor status alarm:', error);
      return { success: false, message: error.message };
    }
  };

  const updateSensorStatusAlarm = async (alarmId: number, alarmData: CreateSensorStatusAlarmRequest) => {
    try {
      const response = await apiService.put<any, CreateSensorStatusAlarmRequest>(`/v1/alarm/sensor-status/${alarmId}`, alarmData);
      if (response.isSuccess) {
        fetchAlarms(); // Re-fetch alarms to update the list
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error(`Failed to update sensor status alarm ${alarmId}:`, error);
      return { success: false, message: error.message };
    }
  };

  const deleteSensorStatusAlarm = async (alarmId: number) => {
    try {
      const response = await apiService.delete<any>(`/v1/alarm/sensor-status/${alarmId}`);
      if (response.isSuccess) {
        fetchAlarms(); // Re-fetch alarms to update the list
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error(`Failed to delete sensor status alarm ${alarmId}:`, error);
      return { success: false, message: error.message };
    }
  };

  const createPumpStatusPSAlarm = async (alarmData: CreatePumpStatusPSAlarmRequest) => {
    try {
      const response = await apiService.post<any, CreatePumpStatusPSAlarmRequest>('/v1/alarm/pump-status-operation', alarmData);
      if (response.isSuccess) {
        fetchAlarms(); // Re-fetch alarms to update the list
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error('Failed to create pump status PS alarm:', error);
      return { success: false, message: error.message };
    }
  };

  const updatePumpStatusPSAlarm = async (alarmId: number, alarmData: CreatePumpStatusPSAlarmRequest) => {
    try {
      const response = await apiService.put<any, CreatePumpStatusPSAlarmRequest>(`/v1/alarm/pump-status-operation/${alarmId}`, alarmData);
      if (response.isSuccess) {
        fetchAlarms(); // Re-fetch alarms to update the list
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error(`Failed to update pump status PS alarm ${alarmId}:`, error);
      return { success: false, message: error.message };
    }
  };

  const createPumpStatusIdvAlarm = async (alarmData: CreatePumpStatusIdvAlarmRequest) => {
    try {
      const response = await createPumpStatusSpecificPumpAlarm(alarmData);
      if (response.success) {
        fetchAlarms(); // Re-fetch alarms to update the list
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error('Failed to create pump status IDV alarm:', error);
      return { success: false, message: error.message };
    }
  };

  const updatePumpStatusIdvAlarm = async (alarmId: number, alarmData: CreatePumpStatusIdvAlarmRequest) => {
    try {
      const response = await updatePumpStatusSpecificPumpAlarm(alarmId, alarmData);
      if (response.success) {
        fetchAlarms(); // Re-fetch alarms to update the list
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error(`Failed to update pump status IDV alarm ${alarmId}:`, error);
      return { success: false, message: error.message };
    }
  };

  const deletePumpStatusIdvAlarm = async (alarmId: number) => {
    try {
      const response = await deletePumpStatusSpecificPumpAlarm(alarmId);
      if (response.success) {
        fetchAlarms(); // Re-fetch alarms to update the list
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      console.error(`Failed to delete pump status IDV alarm ${alarmId}:`, error);
      return { success: false, message: error.message };
    }
  };

  const fetchPumpStatusIdvAlarmsByAltSiteId = async (siteId: number) => {
    try {
      const response = await fetchPumpStatusSpecificPumpAlarmsBySiteId(siteId);
      return response;
    } catch (error: any) {
      console.error(`Failed to fetch pump status IDV alarms for site ${siteId}:`, error);
      return { success: false, data: [], message: error.message };
    }
  };
 
  return {
    thresholdAlarms,
    setThresholdAlarms,
    communicationAlarms,
    setCommunicationAlarms,
    sensorStatusAlarms,
    setSensorStatusAlarms,
    pumpStatusPSAlarms,
    setPumpStatusPSAlarms,
    pumpStatusIdvAlarms,
    setPumpStatusIdvAlarms,
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
    createSensorStatusAlarm,
    updateSensorStatusAlarm,
    deleteSensorStatusAlarm,
    createPumpStatusPSAlarm,
    updatePumpStatusPSAlarm,
    createPumpStatusIdvAlarm,
    updatePumpStatusIdvAlarm,
    deletePumpStatusIdvAlarm,
    fetchPumpStatusIdvAlarmsByAltSiteId,
    isLoading, // Return isLoading state
    fetchError, // Return error state
    fetchPumpStatusIdvSiteConfiguration,
    pumpStatusIdvSiteConfiguration,
    pumpStatusIdvConfigLoading,
    fetchPumpStatusPSSiteConfiguration,
    pumpStatusPSSiteConfiguration,
    pumpStatusPSConfigLoading,
  };
}
 
 