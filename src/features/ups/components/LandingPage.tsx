import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { AlertTriangle, Droplets, Activity } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { MapPanel } from "./MapPanel";
import { useLandingOverview } from "../hooks/useLandingOverview";
import { useWaterLevelReadings } from "../hooks/useWaterLevelReadings";
import { calculateTotalFlowRate } from "../utils/flowRateCalculations";
import { getRecentAlarmEvents } from "../api/upsApi";
import type { Event } from "../types";

export function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, loading } = useLandingOverview();
  const [recentAlarms, setRecentAlarms] = useState<Event[]>([]);
  

  // Fetch water level readings for Ibrahimiya Head Regulator (site 1)
  const { readings, loading: flowLoading, error: flowError } = useWaterLevelReadings(1);

  // Calculate total flow rate from readings
  const flowRateResult = useMemo(() => {
    if (readings.length === 0) {
      return { totalFlowRate: 0, readingsCount: 0 };
    }
    return calculateTotalFlowRate(readings);
  }, [readings]);


  // Fetch recent alarm events for urgent alarms count
  useEffect(() => {
    const fetchRecentAlarms = async () => {
      try {
        const events = await getRecentAlarmEvents({ timeRangeMode: 0, pageNumber: 1, pageSize: 100 });
        setRecentAlarms(events);
      } catch (error) {
        console.error('Failed to fetch recent alarms:', error);
      }
    };

    fetchRecentAlarms();
  }, [])

  const handleSiteClick = (siteId: number) => {
    navigate(`/sites/${siteId}`);
  };



  // Calculate system overview metrics
  const totalFlowRate = flowRateResult.totalFlowRate;
  const activeSites = data.sites?.filter(site => site.status === 'active').length || 0;
  const totalSites = data.sites?.length || 0;
  
  // Calculate urgent alarms from recent alarm events API
  // Urgent alarms are unacknowledged alarms with critical or high severity
  const urgentAlarms = recentAlarms.filter(
    alarm => !alarm.acknowledged && (alarm.severity === 'critical' || alarm.severity === 'high')
  ).length;

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
                  {flowLoading ? (
                    <p className="text-2xl font-bold text-gray-900">{t("common.loading")}</p>
                  ) : flowError ? (
                    <p className="text-sm text-red-600">{t("ups.landing.flowRateError")}</p>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{totalFlowRate.toFixed(0)} {t("ups.landing.flowRateUnit")}</p>
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

        {/* Geographic Status Map */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t("ups.landing.geographicMap")}</h3>
            <p className="text-sm text-gray-500">{t("ups.landing.mapDirection")}</p>
          </div>
          <div className="rounded-lg overflow-hidden border border-gray-200 h-[400px]">
            <MapPanel
              pins={data.sites}
              onPinClick={handleSiteClick}
              isLoading={loading}
              error={null}
            />
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
