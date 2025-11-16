import { useState, useEffect } from 'react';
import type { ValueThresholdAlarm, CommunicationAlarm, ThresholdAlarmResponse, CommunicationAlarmResponse } from '../types';
import apiService from '../../../shared/utils/apiService';

export function useAlarmsData() {
  const [thresholdAlarms, setThresholdAlarms] = useState<ValueThresholdAlarm[]>([]);

  const [communicationAlarms, setCommunicationAlarms] = useState<CommunicationAlarm[]>([]);

  const mapToValueThresholdAlarm = (apiAlarm: ThresholdAlarmResponse): ValueThresholdAlarm => {
    const recipients = `${apiAlarm.emails},${apiAlarm.phones}`
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    return {
      id: apiAlarm.alarmId,
      site: apiAlarm.siteName,
      field: String(apiAlarm.fieldName), // Assuming fieldName is a number that needs to be converted to a string
      operator: String(apiAlarm.operator), // Assuming operator is a number that needs to be converted to a string
      threshold: apiAlarm.thresholdValue,
      color: apiAlarm.colorCode,
      severity: apiAlarm.severity === 0 ? 'Warning' : 'Critical', // Assuming 0 is Warning, 1 is Critical
      recipients: recipients,
    };
  };

  const mapToCommunicationAlarm = (apiAlarm: CommunicationAlarmResponse): CommunicationAlarm => {
    const recipients = `${apiAlarm.emails},${apiAlarm.phones}`
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    return {
      id: apiAlarm.alarmId,
      site: apiAlarm.siteName,
      hours: apiAlarm.numHours,
      recipients: recipients,
    };
  };

  useEffect(() => {
    const fetchAlarms = async () => {
      try {
        const thresholdResponse = await apiService.get<{ isSuccess: boolean; data: ThresholdAlarmResponse[] }>('/alarm/threshold');
        if (thresholdResponse.isSuccess) {
          setThresholdAlarms(thresholdResponse.data.map(mapToValueThresholdAlarm));
        }

        const communicationResponse = await apiService.get<{ isSuccess: boolean; data: CommunicationAlarmResponse[] }>('/alarm/communication');
        if (communicationResponse.isSuccess) {
          setCommunicationAlarms(communicationResponse.data.map(mapToCommunicationAlarm));
        }
      } catch (error) {
        console.error('Failed to fetch alarms:', error);
      }
    };

    fetchAlarms();
  }, []);

  // Removed hardcoded sites, fields, and operators as they are either fetched via useSitesData or will be determined dynamically
  const sites: string[] = []; // Placeholder, as sites are fetched by useSitesData
  const fields: string[] = []; // Placeholder, as fields might come from an API or be static in AlarmConfiguration
  const operators: string[] = []; // Placeholder, as operators might come from an API or be static in AlarmConfiguration

  const [isAddCommOpen, setIsAddCommOpen] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const addRecipient = () => {
    if (newRecipient && !recipients.includes(newRecipient)) {
      setRecipients([...recipients, newRecipient]);
      setNewRecipient('');
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const addThresholdAlarm = (newAlarm: ValueThresholdAlarm) => {
    setThresholdAlarms((prevAlarms) => [...prevAlarms, { ...newAlarm, id: prevAlarms.length > 0 ? Math.max(...prevAlarms.map(a => a.id)) + 1 : 1 }]);
    setRecipients([]); // Clear recipients after adding alarm
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
    addRecipient,
    removeRecipient,
    newRecipient,
    setNewRecipient,
    recipients,
    setRecipients,
    addThresholdAlarm,
  };
}
