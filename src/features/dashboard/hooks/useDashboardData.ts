import { useState, useEffect } from 'react';
import type { FlowDataPoint, DirectorateData, RecentAlarmEvent, ReadingLog, DashboardStats, SiteLookup } from '../types';
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
  const [sites, setSites] = useState<SiteLookup[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    totalSites: 45,
    totalDirectorates: 5,
    totalUsers: 1,
    connectedSites: 45,
    activeAlarms: 12,
    criticalAlarms: 3,
    crisisAlarms: 9,
    totalFlow: 1245,
    flowChange: 8.5,
    activeStations: 38,
    totalStations: 41,
    uptimePercentage: 92.7,
  });

  const { isAuthenticated } = useAuth();

  // Map severity number to string
  const mapSeverityNumber = (severity: any): 'crisis' | 'critical' | 'info' => {
    if (typeof severity === 'string') {
      return severity.toLowerCase() as 'crisis' | 'critical' | 'info';
    }
    // Mapping: 0 = crisis, 1 = critical, 2 = info
    switch (severity) {
      case 0:
        return 'crisis';
      case 1:
        return 'critical';
      case 2:
        return 'info';
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

  // Fetch sites
  const fetchSites = async () => {
    try {
      if (!isAuthenticated) return;

      const response = await apiService.get<any>('/v1/Lookups/Lookup/Sites');

      if (response) {
        let sitesData: SiteLookup[] = [];

        // Extract sites from response
        if (Array.isArray(response.data)) {
          sitesData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          sitesData = response.data.data;
        } else if (Array.isArray(response)) {
          sitesData = response;
        }

        setSites(sitesData);
        // Set first site as default if available
        if (sitesData.length > 0) {
          setSelectedSiteId(sitesData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
      setSites([]);
    }
  };
  // Fetch waterflow data from API
  useEffect(() => {
    const fetchWaterflowData = async () => {
      if (!isAuthenticated || !selectedSiteId) {
        // Clear data if not authenticated or no site selected
        if (!isAuthenticated) {
          setFlowData([]);
          setDirectorateData([]);
        }
        return;
      }

      try {
        // Import the generic get method and ApiResponse type
        const { get } = await import('../../../shared/utils/apiService');

        // Define the response type
        interface WaterflowDataPoint {
          timestamp: string;
          value: number;
        }

        interface ApiResponse<T> {
          isSuccess: boolean;
          message: string;
          data: T;
        }

        // Fetch waterflow data for selected site using generic get method
        const response = await get<ApiResponse<WaterflowDataPoint[]>>(`/v1/LandingPage/waterflow/${selectedSiteId}`);

        if (response.isSuccess && response.data) {
          // Transform API data to chart format
          const transformedData = response.data.map((item: WaterflowDataPoint) => {
            // Parse timestamp and format to show date and time
            const date = new Date(item.timestamp);
            const dateStr = date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit'
            });
            const timeStr = date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            const dateTime = `${dateStr} ${timeStr}`;

            return {
              time: dateTime,
              flow: item.value
            };
          });

          setFlowData(transformedData);
        }
      } catch (error) {
        console.error('Error fetching waterflow data:', error);
        // Keep the existing mock data on error
      }
    };

    fetchWaterflowData();
  }, [isAuthenticated, selectedSiteId]);



  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      if (!isAuthenticated) return;

      const { get } = await import('../../../shared/utils/apiService');

      interface DirectorateStat {
        directorateId: number;
        directorateName: string;
        totalSiteCount: number;
        activeSiteCount: number;
      }

      interface StatisticsResponse {
        totalSites: number;
        totalDirectorates: number;
        totalUsers: number;
        activeAlarmEvents: number;
        sitesPerDirectorate: DirectorateStat[];
        unresolvedCriticalAlarms: number;
        unresolvedCrisisAlarms: number;
      }

      const response = await get<StatisticsResponse>('/v1/LandingPage/statistics');

      if (response) {
        // Calculate active sites from directorate data
        const activeSitesCount = response.sitesPerDirectorate.reduce(
          (sum, dir) => sum + dir.activeSiteCount,
          0
        );

        // Update stats
        setStats(prev => ({
          ...prev,
          totalSites: response.totalSites,
          totalDirectorates: response.totalDirectorates,
          totalUsers: response.totalUsers,
          activeAlarms: response.activeAlarmEvents ??  prev.activeAlarms,
          criticalAlarms: response.unresolvedCriticalAlarms ?? prev.criticalAlarms,
          crisisAlarms: response.unresolvedCrisisAlarms ?? prev.crisisAlarms,
          activeStations: activeSitesCount,
          totalStations: response.totalSites,
          connectedSites: activeSitesCount,
          // Keep other stats as they are or default/mocked for now as they aren't in this specific API
        }));

        // Update directorate data
        const mappedDirectorateData: DirectorateData[] = response.sitesPerDirectorate.map(dir => ({
          name: dir.directorateName,
          sites: dir.totalSiteCount,
          active: dir.activeSiteCount
        }));

        setDirectorateData(mappedDirectorateData);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch data when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setFlowData([]);
      setDirectorateData([]);
      setRecentAlarmEvents([]);
      setReadingLogs([]);
      setSites([]);
      setStats({
        totalSites: 0,
        totalDirectorates: 0,
        totalUsers: 0,
        connectedSites: 0,
        activeAlarms: 0,
        criticalAlarms: 0,
        crisisAlarms: 0,
        totalFlow: 0,
        flowChange: 0,
        activeStations: 0,
        totalStations: 0,
        uptimePercentage: 0,
      });
    } else {
      fetchRecentAlarmEvents();
      fetchRecentReadingLogs();
      fetchSites();
      fetchDashboardStats();
    }
  }, [isAuthenticated]);

  return {
    flowData,
    directorateData,
    recentAlarmEvents,
    readingLogs,
    stats,
    sites,
    selectedSiteId,
    setSelectedSiteId,
    fetchRecentAlarmEvents,
    fetchRecentReadingLogs,
    fetchDashboardStats,
  };
}
