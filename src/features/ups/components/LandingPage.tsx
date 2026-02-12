import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertTriangle, Droplets, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { MapPanel } from "./MapPanel";
import { useLandingOverview } from "../hooks/useLandingOverview";
import { getRecentAlarmEvents, getSiteDashboardData } from "../api/upsApi";
import type { Event } from "../types";

export function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, loading } = useLandingOverview();
  const [recentAlarms, setRecentAlarms] = useState<Event[]>([]);
  const [alarmsLoading, setAlarmsLoading] = useState(true);
  const [yesterdayFlowRate, setYesterdayFlowRate] = useState<number | null>(null);

  // Fetch recent alarm events
  useEffect(() => {
    const fetchRecentAlarms = async () => {
      setAlarmsLoading(true);
      try {
        const events = await getRecentAlarmEvents();
        setRecentAlarms(events.slice(0, 5)); // Show only first 5
      } catch (error) {
        console.error('Failed to fetch recent alarms:', error);
        setRecentAlarms([]);
      } finally {
        setAlarmsLoading(false);
      }
    };

    fetchRecentAlarms();
  }, []);

  // Fetch yesterday's flow data for comparison
  useEffect(() => {
    const fetchYesterdayFlow = async () => {
      try {
        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Use the sites we already have from data.sites
        if (!data.sites || data.sites.length === 0) {
          console.log('No sites available yet');
          return;
        }
        
        console.log(`Fetching yesterday's flow data for ${data.sites.length} sites`);
        
        // Calculate yesterday's total flow by fetching each site's data
        // Use Promise.allSettled to handle failures gracefully
        const flowPromises = data.sites.map(async (site) => {
          try {
            const siteId = typeof site.siteId === 'string' ? parseInt(site.siteId) : site.siteId;
            
            // Fetch site data for the last 7 days (more efficient than custom date range)
            const siteData = await getSiteDashboardData(
              siteId,
              true, // isLast7Days - get last 7 days of data
              false, // isLast30Days
              undefined,
              undefined
            );
            
            // Find yesterday's data from the time series
            const yesterdayFlows = siteData.waterLevel.flow.filter((_, index) => {
              const timestamp = new Date(siteData.waterLevel.timestamps[index]);
              return timestamp.toDateString() === yesterday.toDateString();
            });
            
            // Return the average flow from yesterday, or 0 if no data
            if (yesterdayFlows.length > 0) {
              const avgFlow = yesterdayFlows.reduce((sum, flow) => sum + flow, 0) / yesterdayFlows.length;
              console.log(`Site ${siteId} yesterday avg flow:`, avgFlow);
              return avgFlow;
            }
            
            return 0;
          } catch (error) {
            console.error(`Failed to fetch yesterday's data for site ${site.siteId}:`, error);
            return 0;
          }
        });
        
        const results = await Promise.allSettled(flowPromises);
        
        // Sum up all successful results
        const totalYesterdayFlow = results.reduce((sum, result) => {
          if (result.status === 'fulfilled') {
            return sum + result.value;
          }
          return sum;
        }, 0);
        
        console.log('Total yesterday flow:', totalYesterdayFlow);
        setYesterdayFlowRate(totalYesterdayFlow);
      } catch (error) {
        console.error('Failed to fetch yesterday flow data:', error);
        // Set a fallback value to show something instead of infinite loading
        setYesterdayFlowRate(0);
      }
    };

    if (data.sites && data.sites.length > 0) {
      fetchYesterdayFlow();
    }
  }, [data.sites]);

  // Debug logging

  const handleSiteClick = (siteId: number) => {
    navigate(`/sites/${siteId}`);
  };

  // Format time ago
  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("ups.landing.timeAgo", { time: "just now" });
    if (diffMins < 60) return t("ups.landing.timeAgo", { time: `${diffMins} min` });
    if (diffHours < 24) return t("ups.landing.timeAgo", { time: `${diffHours} hours` });
    return t("ups.landing.timeAgo", { time: `${diffDays} days` });
  };

  // Calculate system overview metrics
  const totalFlowRate = data.sites?.reduce((sum, site) => sum + (site.flowRate || 0), 0) || 2450;
  const activeSites = data.sites?.filter(site => site.status === 'active').length || 7;
  const totalSites = data.sites?.length || 11;
  
  // Calculate urgent alarms from recent alarm events API
  // Urgent alarms are unacknowledged alarms with critical or high severity
  const urgentAlarms = recentAlarms.filter(
    alarm => !alarm.acknowledged && (alarm.severity === 'critical' || alarm.severity === 'high')
  ).length;

  // Calculate flow rate change percentage vs yesterday
  const calculateFlowChange = (): { change: number; isPositive: boolean } | null => {
    // If yesterday's data is still loading or not available
    if (yesterdayFlowRate === null) {
      return null;
    }
    
    // If yesterday's flow was 0, we can't calculate percentage
    if (yesterdayFlowRate === 0) {
      // If today also has flow, show it as 100% increase
      if (totalFlowRate > 0) {
        return { change: 100, isPositive: true };
      }
      // Both are 0, no change
      return { change: 0, isPositive: true };
    }
    
    const change = ((totalFlowRate - yesterdayFlowRate) / yesterdayFlowRate) * 100;
    return {
      change: Math.abs(change),
      isPositive: change >= 0
    };
  };

  const flowChange = calculateFlowChange();

  return (
    <div className="space-y-6">
      

      {/* System Overview Section */}
      <div className="space-y-4">
        {/* System Overview Header */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{t("ups.landing.systemOverview")}</h3>
          <p className="text-sm text-gray-500 mt-1">{t("ups.landing.systemOverviewDescription")}</p>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Flow Rate */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("ups.landing.totalFlowRate")}</p>
                  <p className="text-2xl font-bold text-gray-900">{totalFlowRate.toFixed(0)} m³/s</p>
                  {flowChange ? (
                    <p className={`text-xs flex items-center mt-1 ${
                      flowChange.isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className={`w-3 h-3 mr-1 ${
                        flowChange.isPositive ? '' : 'rotate-180'
                      }`} />
                      {t("ups.landing.vsYesterday", { 
                        change: `${flowChange.isPositive ? '+' : '-'}${flowChange.change.toFixed(1)}%` 
                      })}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      {t("common.loading")}
                    </p>
                  )}
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Droplets className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Sites */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("ups.landing.activeSites")}</p>
                  <p className="text-2xl font-bold text-gray-900">{activeSites}/{totalSites}</p>
                  <p className="text-xs text-gray-500 mt-1">{t("ups.landing.operationalStatus")}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Urgent Alarms */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t("ups.landing.urgentAlarms")}</p>
                  <p className="text-2xl font-bold text-gray-900">{urgentAlarms}</p>
                  <p className="text-xs text-red-600 mt-1">{t("ups.landing.requireAttention")}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avg Battery Level */}

        </div>

        {/* Main Content Grid - Map and Recent Alerts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Geographic Status Map */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t("ups.landing.geographicMap")}</h3>
              <p className="text-sm text-gray-500">{t("ups.landing.mapDirection")}</p>
            </div>
            {/* Map without card wrapper to match screenshot */}
            <div className="rounded-lg overflow-hidden border border-gray-200 h-[400px]">
              <MapPanel
                pins={data.sites}
                onPinClick={handleSiteClick}
                isLoading={loading}
                error={null} // Don't show error on map if we have demo data
              />
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("ups.landing.recentAlerts")}</h3>
            <Card>
              <CardContent className="p-4">
                {alarmsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : recentAlarms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">{t("alarms.noEventsYet")}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAlarms.map((alarm) => (
                      <div 
                        key={alarm.id} 
                        className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                          alarm.severity === 'critical' 
                            ? 'bg-red-50 border-red-200' 
                            : alarm.severity === 'high'
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                        onClick={() => handleSiteClick(Number(alarm.siteId))}
                      >
                        <div className={`p-1 rounded ${
                          alarm.severity === 'critical' 
                            ? 'bg-red-100' 
                            : alarm.severity === 'high'
                            ? 'bg-orange-100'
                            : 'bg-blue-100'
                        }`}>
                          <AlertTriangle className={`w-4 h-4 ${
                            alarm.severity === 'critical' 
                              ? 'text-red-600' 
                              : alarm.severity === 'high'
                              ? 'text-orange-600'
                              : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{alarm.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{getTimeAgo(alarm.timestamp)}</p>
                          <p className={`text-xs font-medium mt-1 ${
                            alarm.severity === 'critical' 
                              ? 'text-red-600' 
                              : alarm.severity === 'high'
                              ? 'text-orange-600'
                              : 'text-blue-600'
                          }`}>
                            {t(`alarms.severity.${alarm.severity}`)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        
      </div>

      {/* Last Updated Info */}
      <div className="text-xs text-gray-500 text-center">
        {t("ups.landing.lastUpdated")}: {data.kpis?.lastUpdated?.toLocaleString() || t("common.loading")}
      </div>
    </div>
  );
}
