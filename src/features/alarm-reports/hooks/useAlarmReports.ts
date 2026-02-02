/**
 * Alarm Reports Configuration Hook
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import alarmReportsService from '../services/alarmReportsService';
import type { AlarmReportConfiguration, CreateAlarmReportPayload } from '../types';

export function useAlarmReports() {
  const { t } = useTranslation();
  const [configurations, setConfigurations] = useState<AlarmReportConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all configurations
  const fetchConfigurations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await alarmReportsService.getReportConfigurations();
  setConfigurations(data);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
 toast.error(errorMessage);
    } finally {
  setIsLoading(false);
    }
  }, []);

  // Create a new configuration
  const createConfiguration = useCallback(async (payload: CreateAlarmReportPayload) => {
  try {
      const newConfig = await alarmReportsService.createReportConfiguration(payload);
      setConfigurations(prev => [...prev, newConfig]);
      toast.success(t('alarmReports.configurationCreatedSuccess'));
      return newConfig;
    } catch (err) {
      const errorMessage = (err as Error).message;
      toast.error(errorMessage);
      throw err;
    }
  }, [t]);

  // Update an existing configuration
  const updateConfiguration = useCallback(async (id: number, payload: CreateAlarmReportPayload) => {
  try {
      const updatedConfig = await alarmReportsService.updateReportConfiguration(id, payload);
      setConfigurations(prev => prev.map(config => config.id === id ? updatedConfig : config));
      toast.success(t('alarmReports.configurationUpdatedSuccess'));
  return updatedConfig;
    } catch (err) {
      const errorMessage = (err as Error).message;
      toast.error(errorMessage);
      throw err;
    }
  }, [t]);

  // Delete a configuration
  const deleteConfiguration = useCallback(async (id: number) => {
    try {
      await alarmReportsService.deleteReportConfiguration(id);
      setConfigurations(prev => prev.filter(config => config.id !== id));
      toast.success(t('alarmReports.configurationDeletedSuccess'));
    } catch (err) {
      const errorMessage = (err as Error).message;
      toast.error(errorMessage);
    throw err;
    }
  }, [t]);

  return {
    configurations,
    isLoading,
    error,
    fetchConfigurations,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    setConfigurations
  };
}
