import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Droplets, Activity, TrendingUp } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { MapPanel } from "./MapPanel";
import { useLandingOverview } from "../hooks/useLandingOverview";

export function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, loading } = useLandingOverview();

  // Debug logging

  const handleSiteClick = (siteId: number) => {
    navigate(`/sites/${siteId}`);
  };

  // Calculate system overview metrics
  const totalFlowRate = data.sites?.reduce((sum, site) => sum + (site.flowRate || 0), 0) || 2450;
  const activeSites = data.sites?.filter(site => site.status === 'active').length || 7;
  const totalSites = data.sites?.length || 11;
  const urgentAlarms = data.kpis?.urgentAlarms || 2;

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
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {t("ups.landing.vsYesterday", { change: "+2.5%" })}
                  </p>
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
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Critical Alert 1 */}
                    <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="p-1 bg-red-100 rounded">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{t("ups.landing.miniaBridge")}</p>
                        <p className="text-xs text-gray-500">{t("ups.landing.minia")} • {t("ups.landing.timeAgo", { time: "1 min" })}</p>
                        <p className="text-xs font-medium text-red-600 mt-1">{t("ups.landing.criticalLevel")}</p>
                      </div>
                    </div>

                    {/* Critical Alert 2 */}
                    <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="p-1 bg-red-100 rounded">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{t("ups.landing.maghaghaIntake")}</p>
                        <p className="text-xs text-gray-500">{t("ups.landing.minia")} • {t("ups.landing.timeAgo", { time: "2 hours" })}</p>
                        <p className="text-xs font-medium text-red-600 mt-1">{t("ups.landing.criticalLevel")}</p>
                      </div>
                    </div>

                    {/* View All Button */}
                    <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-2">
                      {t("ups.landing.viewAllAlerts")} →
                    </button>
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
