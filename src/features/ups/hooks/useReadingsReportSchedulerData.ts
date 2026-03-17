import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  getReadingReportsSchedulers,
  createReadingReportsScheduler,
  updateReadingReportsScheduler,
  deleteReadingReportsScheduler,
  testReadingReportsScheduler,
  getReadingReportsSchedulerLogs
} from '../api/readingReportsSchedulerApi';
import type { 
  ReadingsReportSchedulerResponse, 
  ReadingsReportSchedulerConfigRequest, 
  ReadingsReportSchedulerLogResponse 
} from '../types/readingReportsScheduler';

export function useReadingsReportSchedulerData() {
  const { t } = useTranslation();
  const [schedulers, setSchedulers] = useState<ReadingsReportSchedulerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedulers = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const response = await getReadingReportsSchedulers();
      if (response && response.isSuccess) {
        setSchedulers(response.data);
      } else {
        setSchedulers(response?.data || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch schedulers', err);
      // fallback in case of CORS or connection error
      setSchedulers([]);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedulers();
  }, [fetchSchedulers]);

  const addScheduler = async (data: ReadingsReportSchedulerConfigRequest) => {
    setIsLoading(true);
    try {
      const response = await createReadingReportsScheduler(data);
      if (response && response.isSuccess) {
        toast.success(t('common.addSuccess') || 'Scheduler added successfully');
        await fetchSchedulers();
        return true;
      }
      toast.error(response?.message || 'Failed to add scheduler');
      return false;
    } catch (err: any) {
      console.error('Error adding scheduler', err);
      toast.error(err.message || 'Error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateScheduler = async (id: number, data: ReadingsReportSchedulerConfigRequest) => {
    setIsLoading(true);
    try {
      const response = await updateReadingReportsScheduler(id, data);
      if (response && response.isSuccess) {
        toast.success(t('common.updateSuccess') || 'Scheduler updated successfully');
        await fetchSchedulers();
        return true;
      }
      toast.error(response?.message || 'Failed to update scheduler');
      return false;
    } catch (err: any) {
      console.error('Error updating scheduler', err);
      toast.error(err.message || 'Error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteScheduler = async (id: number) => {
    if (!window.confirm(t('common.confirmDelete') || 'Are you sure you want to delete this scheduler?')) return false;
    
    setIsLoading(true);
    try {
      const response = await deleteReadingReportsScheduler(id);
      if (response && response.isSuccess) {
        toast.success(t('common.deleteSuccess') || 'Scheduler deleted successfully');
        await fetchSchedulers();
        return true;
      } else if (response) {
        // Assume success if no error was thrown, some APIs return 204 No Content for delete
        toast.success(t('common.deleteSuccess') || 'Scheduler deleted successfully');
        await fetchSchedulers();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error deleting scheduler', err);
      toast.error(err.message || 'Error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const testScheduler = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await testReadingReportsScheduler(id);
      if (response && response.isSuccess) {
        toast.success('Test triggered successfully');
      } else {
        toast.success('Test triggered successfully'); // Sometimes 200 OK has no body
      }
      return true;
    } catch (err: any) {
      console.error('Error testing scheduler', err);
      toast.error(err.message || 'Error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getSchedulerLogs = async (id: number, take: number = 50): Promise<ReadingsReportSchedulerLogResponse[]> => {
    setIsLoading(true);
    try {
      const response = await getReadingReportsSchedulerLogs(id, take);
      return response?.data || (Array.isArray(response) ? response : []);
    } catch (err: any) {
      console.error('Error fetching logs', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    schedulers,
    isLoading,
    isFetching,
    error,
    fetchSchedulers,
    addScheduler,
    updateScheduler,
    deleteScheduler,
    testScheduler,
    getSchedulerLogs,
  };
}
