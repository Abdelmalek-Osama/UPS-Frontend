import { useState, useEffect } from 'react';
import type { FlowDataPoint, DirectorateData, ActiveAlarm, RecentReading, DashboardStats } from '../types';
import { useAuth } from '../../../shared/contexts/AuthContext'; // Import useAuth

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

  const [activeAlarms, setActiveAlarms] = useState<ActiveAlarm[]>([
    { id: 1, site: 'محطة رفع - الجيزة 01', type: 'battery', message: 'البطارية منخفضة', severity: 'Warning', time: '10:30' },
    { id: 2, site: 'القناطر - القاهرة 03', type: 'communication', message: 'فقدان الاتصال', severity: 'Critical', time: '09:15' },
    { id: 3, site: 'محطة رفع - الإسكندرية 02', type: 'flow', message: 'تدفق عالي غير طبيعي', severity: 'Warning', time: '08:45' },
  ]);

  const [recentReadings, setRecentReadings] = useState<RecentReading[]>([
    { site: 'القناطر - القاهرة 01', type: 'WaterLevel', time: '11:30', uswl: 125.4, dswl: 122.1, flow: 34.5 },
    { site: 'محطة رفع - الجيزة 02', type: 'PumpStation', time: '11:25', totalFlow: 145.2, uptime: 8.5 },
    { site: 'القناطر - الدقهلية 05', type: 'WaterLevel', time: '11:20', uswl: 98.7, dswl: 95.2, flow: 28.9 },
  ]);

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

  const { isAuthenticated } = useAuth(); // Get isAuthenticated from AuthContext

  // Fetch waterflow data from API
  useEffect(() => {
    const fetchWaterflowData = async () => {
      if (!isAuthenticated) {
        // Clear data if not authenticated
        setFlowData([]);
        setDirectorateData([]);
        setActiveAlarms([]);
        setRecentReadings([]);
        setStats({
          totalSites: 0, connectedSites: 0, activeAlarms: 0, criticalAlarms: 0,
          warningAlarms: 0, totalFlow: 0, flowChange: 0, activeStations: 0,
          totalStations: 0, uptimePercentage: 0
        });
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

        // Fetch waterflow data for site ID 2 using generic get method
        const response = await get<ApiResponse<WaterflowDataPoint[]>>('/v1/LandingPage/waterflow/2');

        if (response.isSuccess && response.data) {
          // Transform API data to chart format
          const transformedData = response.data.map((item: WaterflowDataPoint) => {
            // Parse timestamp and format to HH:mm
            const date = new Date(item.timestamp);
            const time = date.toLocaleTimeString('ar-EG', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });

            return {
              time,
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
  }, [isAuthenticated]);

  return {
    flowData,
    directorateData,
    activeAlarms,
    recentReadings,
    stats,
  };
}
