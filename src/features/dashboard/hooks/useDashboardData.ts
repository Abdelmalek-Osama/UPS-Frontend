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

  // Fetch recent alarm events
  const fetchRecentAlarmEvents = async () => {
    try {
      if (!isAuthenticated) return;

      const response = await apiService.get<any>('/v1/alarm-events', {
        params: {
          unresolvedOnly: true,
          'pagination.PageNumber': 1,
          'pagination.PageSize': 3,
        },
      });

      if (response && response.data) {
        let events: RecentAlarmEvent[] = [];

        // Extract events from various possible response formats
        if (Array.isArray(response.data)) {
          events = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          events = response.data.data;
        }

        // Map API response to RecentAlarmEvent
        const mappedEvents = events.map((event: any) => ({
          id: event.id,
          alarmName: event.alarmName,
          siteName: event.siteName,
          fieldName: event.fieldName,
          actualValue: event.actualValue,
          thresholdValue: event.thresholdValue,
          severity: event.severity?.toLowerCase() || 'info',
          colorCode: event.colorCode,
          triggeredAt: event.triggeredAt,
          message: event.message,
        }));

        setRecentAlarmEvents(mappedEvents);
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

      const response = await apiService.get<any>('/v1/ReadingLogs/recent', {
        params: {
          'pagination.PageNumber': 1,
          'pagination.PageSize': 3,
        },
      });

      if (response && response.data) {
        let logs: ReadingLog[] = [];

        // Extract logs from various possible response formats
        if (Array.isArray(response.data)) {
          logs = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          logs = response.data.data;
        }

        // Map API response to ReadingLog
        const mappedLogs = logs.map((log: any) => ({
          id: log.id,
          site: log.site || log.siteName,
          type: log.readingType === 'WaterLevel' ? 'WaterLevel' : 'PumpStation',
          timestamp: log.timestamp || log.dateTime,
          uswl: log.uswl,
          dswl: log.dswL1 || log.dswl,
          calculatedFlow: log.calculatedFlow || log.flow,
          totalFlow: log.totalFlow,
          uptime: log.totalUptime || log.uptime,
          isManual: log.isManual,
        }));

        setReadingLogs(mappedLogs);
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
