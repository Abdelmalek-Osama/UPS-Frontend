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

  // In a real app, you would fetch data from an API here
  useEffect(() => {
    // Clear simulated data if not authenticated
    if (!isAuthenticated) {
      setFlowData([]);
      setDirectorateData([]);
      setActiveAlarms([]);
      setRecentReadings([]);
      setStats({
        totalSites: 0, connectedSites: 0, activeAlarms: 0, criticalAlarms: 0,
        warningAlarms: 0, totalFlow: 0, flowChange: 0, activeStations: 0,
        totalStations: 0, uptimePercentage: 0
      });
    }
    // Simulated data fetching
  }, [isAuthenticated]);

  return {
    flowData,
    directorateData,
    activeAlarms,
    recentReadings,
    stats,
  };
}
