import { useState, useEffect } from 'react';
import type { FlowDataPoint, DirectorateData, RecentAlarmEvent, ReadingLog, DashboardStats } from '../types';
import { useAuth } from '../../../shared/contexts/AuthContext';
import apiService from '../../../shared/utils/apiService';

export function useDashboardData() {
  const [flowData, setFlowData] = useState<FlowDataPoint[]>([
    { time: '00:00', flow: 120 },
    { time: '04:00', flow: 135 },
    { time: '08:00', flow: 158 },
    { time: '12:00', flow: 142 },
    { time: '16:00', flow: 165 },
    { time: '20:00', flow: 148 },
  ]);

  const [directorateData, setDirectorateData] = useState<DirectorateData[]>([
    { name: 'القاهرة', sites: 12, active: 11 },
    { name: 'الجيزة', sites: 8, active: 8 },
    { name: 'الإسكندرية', sites: 15, active: 13 },
    { name: 'الدقهلية', sites: 10, active: 9 },
  ]);

  const [recentAlarmEvents, setRecentAlarmEvents] = useState<RecentAlarmEvent[]>([]);
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>([]);

  const [stats, setStats] = useState<DashboardStats>({
    totalSites: 45,
    connectedSites: 45,
    activeAlarms: 12,
    criticalAlarms: 3,
    warningAlarms: 9,
    totalFlow: 1245,
    flowChange: 8.5,
    activeStations: 38,
    totalStations: 41,
    uptimePercentage: 92.7,
  });

  const { isAuthenticated } = useAuth();

  // Map severity number to string
  const mapSeverityNumber = (severity: any): 'critical' | 'warning' | 'info' => {
    if (typeof severity === 'string') {
      return severity.toLowerCase() as 'critical' | 'warning' | 'info';
    }
    // Assuming: 0 = info, 1 = warning, 2 = critical
    switch (severity) {
      case 0:
        return 'info';
      case 1:
        return 'warning';
      case 2:
        return 'critical';
      default:
        return 'info';
    }
  };

  // Fetch recent alarm events
  const fetchRecentAlarmEvents = async () => {
    try {
      if (!isAuthenticated) return;

      const response = await apiService.get<any>('/v1/alarm-events', {
        params: {
          unresolvedOnly: true,
          'pagination.PageNumber': 1,
          'pagination.PageSize': 5,
        },
      });

      if (response) {
        let events: RecentAlarmEvent[] = [];

        // Extract events from nested response structure: response.data.data.data
        if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
          events = response.data.data.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          events = response.data.data;
        } else if (Array.isArray(response.data)) {
          events = response.data;
        }

        // Map API response to RecentAlarmEvent
        const mappedEvents = events.map((event: any) => ({
          id: event.id,
          alarmName: event.alarmName || 'Alarm',
          siteName: event.siteName || '',
          fieldName: event.fieldName || '',
          actualValue: event.actualValue,
          thresholdValue: event.thresholdValue,
          severity: mapSeverityNumber(event.severity),
          colorCode: event.colorCode,
          triggeredAt: event.triggeredAt,
          message: event.message,
        }));

        setRecentAlarmEvents(mappedEvents.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching recent alarm events:', error);
      setRecentAlarmEvents([]);
    }
  };

  // Fetch recent reading logs
  const fetchRecentReadingLogs = async () => {
    try {
      if (!isAuthenticated) return;

      const response = await apiService.get<any>('/v1/reading-logs', {
        params: {
          'PageNumber': 1,
          'PageSize': 5,
        },
      });

      if (response) {
        let logs: any[] = [];

        // Extract logs from nested response structure
        if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
          logs = response.data.data.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          logs = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          logs = response.data;
        } else if (Array.isArray(response)) {
          logs = response;
        }

        // Map API response to ReadingLog
        // The API returns audit logs with: readingType, id, siteName, actionType, timeStamp, createdBy, actionDate
        const mappedLogs = logs.map((log: any) => ({
          id: log.id,
          site: log.siteName || '',
          type: log.readingType === 'WaterLevel' ? 'WaterLevel' : 'PumpStation',
          timestamp: log.actionDate || log.timeStamp || new Date().toISOString(),
          actionType: log.actionType || '',
          uswl: undefined,
          dswl: undefined,
          calculatedFlow: undefined,
          totalFlow: undefined,
          uptime: undefined,
          isManual: false,
        }));

        console.log('Mapped Reading Logs:', mappedLogs);
        setReadingLogs(mappedLogs.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching recent reading logs:', error);
      setReadingLogs([]);
    }
  };

  // Fetch data when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setFlowData([]);
      setDirectorateData([]);
      setRecentAlarmEvents([]);
      setReadingLogs([]);
      setStats({
        totalSites: 0,
        connectedSites: 0,
        activeAlarms: 0,
        criticalAlarms: 0,
        warningAlarms: 0,
        totalFlow: 0,
        flowChange: 0,
        activeStations: 0,
        totalStations: 0,
        uptimePercentage: 0,
      });
    } else {
      fetchRecentAlarmEvents();
      fetchRecentReadingLogs();
    }
  }, [isAuthenticated]);

  return {
    flowData,
    directorateData,
    recentAlarmEvents,
    readingLogs,
    stats,
    fetchRecentAlarmEvents,
    fetchRecentReadingLogs,
  };
}
