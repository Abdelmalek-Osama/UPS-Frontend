import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { Checkbox } from "../../../components/ui/checkbox";
import { ArrowLeft, Search, Info, ChevronDown, AlertTriangle, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { TimeFilterBar } from "./TimeFilterBar";
import { DatePicker } from "../../../components/ui/datepicker";
import { DirectorateWLChart } from "./DirectorateWLChart";
import { DirectorateFlowChart } from "./DirectorateFlowChart";
import { PumpOperatingTimesChart } from "./PumpOperatingTimesChart";
import { ExportDropdown } from "./common/ExportDropdown";
import { useGovernorateOverview } from "../hooks/useGovernorateOverview";
import { useDirectoratesList } from "../hooks/useDirectoratesList";
import { useSitesList } from "../hooks/useSitesList";
import { useAllPumpSitesDailySummary } from "../hooks/useAllPumpSitesDailySummary";
import { exportReport, getRecentAlarmEvents } from "../api/upsApi";
import { exportTableToCSV, exportTableToExcel, exportPageAsPNG } from "../utils/exportUtils";
import type { RecentAlarmEventsRequest } from "../api/upsApi";
import { formatDateForApi } from "../../../lib/utils";
import type { DateRange, TimeFilter, SiteSummary, Event } from "../types";
import type { CalculationOptions } from "./TimeFilterBar";

// Main regulators for each canal (which sites to show in USWL/DSWL chart)
// Order is now determined by canalOrder from backend, not by array position
const MAIN_REGULATORS = {
  "Ibrahimiya": ["13", "12", "11", "32", "10", "9", "8", "1", "44","58"],
  "Bahr Youssef": ["7", "6", "20", "5", "19", "4", "3", "2"]
};

export function DirectoratePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedDirectorateIds, setSelectedDirectorateIds] = useState<string[]>([]);
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<TimeFilter>("latest");
  const [range, setRange] = useState<DateRange>({});
  const [calculations, setCalculations] = useState<CalculationOptions>({
    levels: "average",
    flow: "sum"
  });
  const [pumpDate, setPumpDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPumpStation, setSelectedPumpStation] = useState<SiteSummary | null>(null);
  // Alarms keyed by canalId: 0 = Ibrahimiya, 1 = Bahr Youssef
  const [alarmsByCanal, setAlarmsByCanal] = useState<Record<number, Event[]>>({ 0: [], 1: [] });
  const [alarmsLoading, setAlarmsLoading] = useState(true);
  const [bahrYoussefAlarmsPage, setBahrYoussefAlarmsPage] = useState(1);
  const [ibrahimiyaAlarmsPage, setIbrahimiyaAlarmsPage] = useState(1);
  const ALARMS_PAGE_SIZE = 6;
  const [isExportingPage, setIsExportingPage] = useState(false);

  useEffect(() => {
    const buildAlarmRequest = (canalId: number): RecentAlarmEventsRequest => {
      const base = { pageNumber: 1, pageSize: 100, canalIds: [canalId] };
      switch (filter) {
        case "latest": return { ...base, timeRangeMode: 0 };
        case "24h":    return { ...base, timeRangeMode: 1 };
        case "week":   return { ...base, timeRangeMode: 2 };
        case "month":  return { ...base, timeRangeMode: 3 };
        case "custom":
          return {
            ...base,
            timeRangeMode: 4,
            startDate: range.start ? formatDateForApi(range.start) : undefined,
            endDate:   range.end   ? formatDateForApi(range.end)   : undefined,
          };
        case "specific": {
          const d = range.targetDate ?? new Date();
          const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
          const dayEnd   = new Date(d); dayEnd.setHours(23, 59, 59, 999);
          return {
            ...base,
            timeRangeMode: 4,
            startDate: formatDateForApi(dayStart),
            endDate:   formatDateForApi(dayEnd),
          };
        }
        default: return { ...base, timeRangeMode: 0 };
      }
    };

    const fetchAlarms = async () => {
      setAlarmsLoading(true);
      try {
        const [canal0Events, canal1Events] = await Promise.all([
          getRecentAlarmEvents(buildAlarmRequest(0)),
          getRecentAlarmEvents(buildAlarmRequest(1)),
        ]);
        setAlarmsByCanal({ 0: canal0Events, 1: canal1Events });
        setIbrahimiyaAlarmsPage(1);
        setBahrYoussefAlarmsPage(1);
      } catch (error) {
        console.error('Failed to fetch recent alarms:', error);
        setAlarmsByCanal({ 0: [], 1: [] });
      } finally {
        setAlarmsLoading(false);
      }
    };
    fetchAlarms();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, range.start, range.end, range.targetDate, range.targetTime]);

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return t("ups.landing.timeAgo", { time: t("ups.landing.justNow") });
    if (diffMins < 60) return t("ups.landing.timeAgo", { time: `${diffMins}` + t("ups.landing.min") });
    if (diffHours < 24) return t("ups.landing.timeAgo", { time: `${diffHours}` + t("ups.landing.hours") });
    return t("ups.landing.timeAgo", { time: `${diffDays} days` });
  };

  const { directorates, loading: directoratesLoading } = useDirectoratesList();
  const { sites, loading: sitesLoading } = useSitesList();
  // Use first selected directorate for API call, or empty string if none selected
  const apiDirectorateId = selectedDirectorateIds.length > 0 ? selectedDirectorateIds[0] : "";
  const { data, error } = useGovernorateOverview(apiDirectorateId, filter, range);

  // Derive timeRangeMode from pumpDate: 4 = Custom (specific day), 0 = Latest (2h)
  const pumpTimeRangeMode: 0 | 4 = pumpDate ? 4 : 0;
  const { data: allPumpsSummary, loading: pumpSummaryLoading } = useAllPumpSitesDailySummary({
    timeRangeMode: pumpTimeRangeMode,
    date: pumpDate,
  });

  // Get directorate name based on language
  const getDirectorateName = (directorateId: string) => {
    const directorate = directorates.find(d => String(d.id) === directorateId);
    if (!directorate) return "";
    return t('_rtl') === 'rtl' ? (directorate.arabicName || directorate.name) : directorate.name;
  };

  // Get site name based on language
  const getSiteNameById = (siteId: string) => {
    const site = sites.find(s => String(s.id) === siteId);
    if (!site) return "";
    return t('_rtl') === 'rtl' ? (site.arabicName || site.name) : site.name;
  };

  // Handle export functionality
  const handleExport = async (format: "pdf" | "excel") => {
    try {
      await exportReport("governorate", format, filter, range, undefined, apiDirectorateId);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Handle full page export as PNG
  const handleExportPageAsPNG = async () => {
    setIsExportingPage(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const branchNames = orderedBranches.map(b => b.name).join('-');
      const filename = `directorate-${branchNames}-${timestamp}`;
      await exportPageAsPNG(filename, 'main');
    } catch (error) {
      console.error("Page export failed:", error);
    } finally {
      setIsExportingPage(false);
    }
  };

  const orderedBranches = useMemo(() => {
    const order = ["Ibrahimiya", "Bahr Youssef"];
    return [...data.branches].sort((a, b) => {
      const indexA = order.indexOf(a.name);
      const indexB = order.indexOf(b.name);
      if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [data.branches]);

  // Check if required time is selected
  const isTimeSelected = useMemo(() => {
    if (filter === "custom") return !!range.start && !!range.end;
    if (filter === "specific") return !!range.targetDate && !!range.targetTime;
    return true; // latest, week, month don't require time selection
  }, [filter, range.start, range.end, range.targetDate, range.targetTime]);

  // const handleSiteClick = (siteId: string) => {
  //   navigate(`/sites/${siteId}`);
  // };

  const filterSites = (sites: SiteSummary[]) => {
    if (!searchTerm) return sites;
    return sites.filter(site => {
      const searchLower = searchTerm.toLowerCase();
      const englishName = site.siteName.toLowerCase();
      const arabicName = (site.siteArabicName || '').toLowerCase();
      return englishName.includes(searchLower) || arabicName.includes(searchLower);
    });
  };



  const renderBranchSection = (branchName: string, sites: SiteSummary[], showAlerts = true) => {
    // Filter sites by directorate if directorates are selected
    let filteredByDirectorate = sites;
    if (selectedDirectorateIds.length > 0) {
      const selectedDirIds = selectedDirectorateIds.map(id => parseInt(id));
      filteredByDirectorate = sites.filter(site => site.directorateId !== undefined && selectedDirIds.includes(site.directorateId));
    }
    
    // Filter by selected sites if sites are selected
    let filteredBySite = filteredByDirectorate;
    if (selectedSiteIds.length > 0) {
      filteredBySite = filteredByDirectorate.filter(site => selectedSiteIds.includes(site.siteId));
    }
    
    const sortedSites = filteredBySite.sort((a, b) => a.position - b.position);
    const filteredSites = filterSites(sortedSites);
    
    // Get site name based on language
    const getSiteName = (site: SiteSummary) => 
      t('_rtl') === 'rtl' ? (site.siteArabicName || site.siteName) : site.siteName;
    
    // USWL/DSWL Profile Chart: Only show main regulators, ordered by canalOrder from backend
    const mainRegulatorIds = MAIN_REGULATORS[branchName as keyof typeof MAIN_REGULATORS] || [];
    const mainRegulators = filteredBySite.filter(site => 
      mainRegulatorIds.includes(site.siteId)
    );
    const profileChartData = mainRegulators
      .sort((a, b) => (a.canalOrder ?? 0) - (b.canalOrder ?? 0))
      .map(site => ({
        id: site.siteId,
        name: getSiteName(site),
        uswl: site.upstream,
        dswl: site.downstream
      }));
    
    // Flow Chart: Include all sites in position order
    const finalFlowData = sortedSites.map(site => {
      const numPumps = (site as any).siteConfiguration?.numPumps || 0;
      let flowValue = site.flowRate;
      
      // If site has pumps, use total pump flow instead of calculated flow
      if (numPumps > 0 && (site as any).pumpData) {
        // Use totalFlow from API if available, otherwise sum the flows
        flowValue = (site as any).pumpData.totalFlow != null
          ? (site as any).pumpData.totalFlow
          : (site as any).pumpData.flows?.reduce((sum: number, flow: number) => sum + flow, 0);
      }
      
      return {
        id: site.siteId,
        name: getSiteName(site),
        calculatedFlow: flowValue
      };
    });

    // Check if this is Bahr Youssef (has pump stations)
    const isPumpBranch = branchName === "Bahr Youssef";
    
    // Get localized branch name
    const branchKey = branchName === "Ibrahimiya" ? "ups.branches.ibrahimia" : "ups.branches.bahrYoussef";
    const localizedBranchName = t(branchKey);

    // Get alarms for this canal directly from the per-canal fetch
    const canalId = branchName === "Ibrahimiya" ? 0 : 1;
    const branchAlarms = alarmsByCanal[canalId] ?? [];

    return (
      <div key={branchName} className="space-y-6">
        <h2 className={`text-2xl font-bold text-gray-900 ${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}`}>{localizedBranchName}</h2>

        {/* Sites Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              {t('_rtl') === 'rtl' ? (
                <>
                  {/* Arabic: Search and Export on left, Title on right */}
                  <div className="flex items-center gap-3">
                    <ExportDropdown
                      onExportCSV={() => {
                        const columns = [
                          { key: 'siteName', header: t("ups.directorate.siteName") },
                          { key: 'status', header: t("common.status") },
                          { key: 'upstream', header: t("ups.directorate.upstream") },
                          { key: 'downstream', header: t("ups.directorate.downstream") },
                          { key: 'flowRate', header: t("ups.directorate.flow") },
                          { key: 'date', header: t("common.date") },
                          { key: 'hour', header: t("common.hour") }
                        ];
                        const exportData = filteredSites.map(site => ({
                          siteName: getSiteName(site),
                          status: site.status,
                          upstream: site.upstream != null ? site.upstream.toFixed(2) : "-",
                          downstream: site.downstream != null ? site.downstream.toFixed(2) : "-",
                          flowRate: (() => {
                            const numPumps = (site as any).siteConfiguration?.numPumps || 0;
                            if (numPumps > 0 && (site as any).pumpData) {
                              const totalFlow = (site as any).pumpData.totalFlow != null
                                ? (site as any).pumpData.totalFlow
                                : (site as any).pumpData.flows?.reduce((sum: number, flow: number) => sum + flow, 0);
                              return totalFlow != null ? totalFlow.toFixed(1) : "-";
                            }
                            return site.flowRate != null ? site.flowRate.toFixed(1) : "-";
                          })(),
                          date: site.lastReading ? (() => {
                            const date = new Date(site.lastReading);
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                          })() : "-",
                          hour: site.lastReading ? (() => {
                            const date = new Date(site.lastReading);
                            const hours = String(date.getHours()).padStart(2, '0');
                            const minutes = String(date.getMinutes()).padStart(2, '0');
                            return `${hours}:${minutes}`;
                          })() : "-"
                        }));
                        exportTableToCSV(exportData, columns, `${localizedBranchName}-sites`);
                      }}
                      onExportExcel={() => {
                        const columns = [
                          { key: 'siteName', header: t("ups.directorate.siteName") },
                          { key: 'status', header: t("common.status") },
                          { key: 'upstream', header: t("ups.directorate.upstream") },
                          { key: 'downstream', header: t("ups.directorate.downstream") },
                          { key: 'flowRate', header: t("ups.directorate.flow") },
                          { key: 'date', header: t("common.date") },
                          { key: 'hour', header: t("common.hour") }
                        ];
                        const exportData = filteredSites.map(site => ({
                          siteName: getSiteName(site),
                          status: site.status,
                          upstream: site.upstream != null ? site.upstream.toFixed(2) : "-",
                          downstream: site.downstream != null ? site.downstream.toFixed(2) : "-",
                          flowRate: (() => {
                            const numPumps = (site as any).siteConfiguration?.numPumps || 0;
                            if (numPumps > 0 && (site as any).pumpData) {
                              const totalFlow = (site as any).pumpData.totalFlow != null
                                ? (site as any).pumpData.totalFlow
                                : (site as any).pumpData.flows?.reduce((sum: number, flow: number) => sum + flow, 0);
                              return totalFlow != null ? totalFlow.toFixed(1) : "-";
                            }
                            return site.flowRate != null ? site.flowRate.toFixed(1) : "-";
                          })(),
                          date: site.lastReading ? (() => {
                            const date = new Date(site.lastReading);
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                          })() : "-",
                          hour: site.lastReading ? (() => {
                            const date = new Date(site.lastReading);
                            const hours = String(date.getHours()).padStart(2, '0');
                            const minutes = String(date.getMinutes()).padStart(2, '0');
                            return `${hours}:${minutes}`;
                          })() : "-"
                        }));
                        exportTableToExcel(exportData, columns, `${localizedBranchName}-sites`);
                      }}
                      size="sm"
                    />
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={t("ups.directorate.searchSites")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                  </div>
                  <CardTitle className="text-right">{t("ups.directorate.branchSites", { branch: localizedBranchName })}</CardTitle>
                </>
              ) : (
                <>
                  {/* English: Title on left, Search and Export on right */}
                  <CardTitle className="text-left">{t("ups.directorate.branchSites", { branch: localizedBranchName })}</CardTitle>
                  <div className="flex items-center gap-3">
                    <ExportDropdown
                      onExportCSV={() => {
                        const columns = [
                          { key: 'siteName', header: t("ups.directorate.siteName") },
                          { key: 'status', header: t("common.status") },
                          { key: 'upstream', header: t("ups.directorate.upstream") },
                          { key: 'downstream', header: t("ups.directorate.downstream") },
                          { key: 'flowRate', header: t("ups.directorate.flow") },
                          { key: 'date', header: t("common.date") },
                          { key: 'hour', header: t("common.hour") }
                        ];
                        const exportData = filteredSites.map(site => ({
                          siteName: getSiteName(site),
                          status: site.status,
                          upstream: site.upstream != null ? site.upstream.toFixed(2) : "-",
                          downstream: site.downstream != null ? site.downstream.toFixed(2) : "-",
                          flowRate: (() => {
                            const numPumps = (site as any).siteConfiguration?.numPumps || 0;
                            if (numPumps > 0 && (site as any).pumpData) {
                              const totalFlow = (site as any).pumpData.totalFlow != null
                                ? (site as any).pumpData.totalFlow
                                : (site as any).pumpData.flows?.reduce((sum: number, flow: number) => sum + flow, 0);
                              return totalFlow != null ? totalFlow.toFixed(1) : "-";
                            }
                            return site.flowRate != null ? site.flowRate.toFixed(1) : "-";
                          })(),
                          date: site.lastReading ? (() => {
                            const date = new Date(site.lastReading);
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                          })() : "-",
                          hour: site.lastReading ? (() => {
                            const date = new Date(site.lastReading);
                            const hours = String(date.getHours()).padStart(2, '0');
                            const minutes = String(date.getMinutes()).padStart(2, '0');
                            return `${hours}:${minutes}`;
                          })() : "-"
                        }));
                        exportTableToCSV(exportData, columns, `${localizedBranchName}-sites`);
                      }}
                      onExportExcel={() => {
                        const columns = [
                          { key: 'siteName', header: t("ups.directorate.siteName") },
                          { key: 'status', header: t("common.status") },
                          { key: 'upstream', header: t("ups.directorate.upstream") },
                          { key: 'downstream', header: t("ups.directorate.downstream") },
                          { key: 'flowRate', header: t("ups.directorate.flow") },
                          { key: 'date', header: t("common.date") },
                          { key: 'hour', header: t("common.hour") }
                        ];
                        const exportData = filteredSites.map(site => ({
                          siteName: getSiteName(site),
                          status: site.status,
                          upstream: site.upstream != null ? site.upstream.toFixed(2) : "-",
                          downstream: site.downstream != null ? site.downstream.toFixed(2) : "-",
                          flowRate: (() => {
                            const numPumps = (site as any).siteConfiguration?.numPumps || 0;
                            if (numPumps > 0 && (site as any).pumpData) {
                              const totalFlow = (site as any).pumpData.totalFlow != null
                                ? (site as any).pumpData.totalFlow
                                : (site as any).pumpData.flows?.reduce((sum: number, flow: number) => sum + flow, 0);
                              return totalFlow != null ? totalFlow.toFixed(1) : "-";
                            }
                            return site.flowRate != null ? site.flowRate.toFixed(1) : "-";
                          })(),
                          date: site.lastReading ? (() => {
                            const date = new Date(site.lastReading);
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                          })() : "-",
                          hour: site.lastReading ? (() => {
                            const date = new Date(site.lastReading);
                            const hours = String(date.getHours()).padStart(2, '0');
                            const minutes = String(date.getMinutes()).padStart(2, '0');
                            return `${hours}:${minutes}`;
                          })() : "-"
                        }));
                        exportTableToExcel(exportData, columns, `${localizedBranchName}-sites`);
                      }}
                      size="sm"
                    />
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={t("ups.directorate.searchSites")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Table dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center"></TableHead>
                  <TableHead className="text-center">{t("ups.directorate.siteName")}</TableHead>
                  <TableHead className="text-center">{t("common.status")}</TableHead>
                  <TableHead className="text-center">{t("ups.directorate.upstream")}</TableHead>
                  <TableHead className="text-center">{t("ups.directorate.downstream")}</TableHead>
                  <TableHead className="text-center">{t("ups.directorate.flow")}</TableHead>
                  <TableHead className="text-center">{t("common.date")}</TableHead>
                  <TableHead className="text-center">{t("common.hour")}</TableHead>
                  {isPumpBranch && <TableHead className="text-center">{t("common.details")}</TableHead>}
                  {/* <TableHead className="text-center"></TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSites.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isPumpBranch ? 10 : 9} className="text-center text-gray-500">
                      {searchTerm ? t("ups.directorate.noSitesMatch") : t("common.noData")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSites.map((site) => (
                    <TableRow key={site.siteId} className="hover:bg-gray-50">
                      <TableCell className="text-center">
                      </TableCell>
                      <TableCell className="font-medium text-center">{getSiteName(site)}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          className={
                            site.status === "active" ? "bg-green-100 text-green-700 border-0" :
                            site.status === "alarm" ? "bg-red-100 text-red-700 border-0" :
                            "bg-gray-100 text-gray-600 border-0"
                          }
                        >
                          {site.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{site.upstream != null ? site.upstream.toFixed(2) : "-"}</TableCell>
                      <TableCell className="text-center">{site.downstream != null ? site.downstream.toFixed(2) : "-"}</TableCell>
                      <TableCell className="text-blue-600 font-medium text-center">
                        {(() => {
                          const numPumps = (site as any).siteConfiguration?.numPumps || 0;
                          if (numPumps > 0 && (site as any).pumpData) {
                            // Use totalFlow from API if available, otherwise sum the flows
                            const totalFlow = (site as any).pumpData.totalFlow != null
                              ? (site as any).pumpData.totalFlow
                              : (site as any).pumpData.flows?.reduce((sum: number, flow: number) => sum + flow, 0);
                            return totalFlow != null ? totalFlow.toFixed(1) : "-";
                          }
                          return site.flowRate != null ? site.flowRate.toFixed(1) : "-";
                        })()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 text-center">
                        {site.lastReading ? (() => {
                          const date = new Date(site.lastReading);
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          return `${year}-${month}-${day}`;
                        })() : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 text-center">
                        {site.lastReading ? (() => {
                          const date = new Date(site.lastReading);
                          const hours = String(date.getHours()).padStart(2, '0');
                          const minutes = String(date.getMinutes()).padStart(2, '0');
                          return `${hours}:${minutes}`;
                        })() : "-"}
                      </TableCell>
                      {isPumpBranch && (
                        <TableCell className="text-center">
                          {(site as any).siteConfiguration?.numPumps > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPumpStation(site)}
                              className="h-8 w-8 p-0"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                      {/* <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSiteClick(site.siteId)}
                        >
                          {t('_rtl') === 'rtl' ? '←' : '→'}
                        </Button>
                      </TableCell> */}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upstream/Downstream Profile Chart (USWL vs DSWL Histogram) */}
        <DirectorateWLChart branchName={localizedBranchName} data={profileChartData} />

        {/* Calculated Flow Chart (Line Graph) */}
        <DirectorateFlowChart branchName={localizedBranchName} data={finalFlowData} />

        {/* Recent Alerts */}
        {showAlerts && (() => {
          const currentPage = ibrahimiyaAlarmsPage;
          const setPage = setIbrahimiyaAlarmsPage;
          const totalPages = Math.max(1, Math.ceil(branchAlarms.length / ALARMS_PAGE_SIZE));
          const safePage = Math.min(currentPage, totalPages);
          const paginatedAlarms = branchAlarms.slice((safePage - 1) * ALARMS_PAGE_SIZE, safePage * ALARMS_PAGE_SIZE);
          return (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  {t('_rtl') === 'rtl' ? (
                    <>
                      {/* Arabic: count on left, title on right */}
                      {branchAlarms.length > 0 && (
                        <span className="text-sm text-gray-500">
                          {branchAlarms.length} {t("alarms.total")}
                        </span>
                      )}
                      <CardTitle className="text-right">{t("ups.landing.recentAlerts")}</CardTitle>
                    </>
                  ) : (
                    <>
                      {/* English: title on left, count on right */}
                      <CardTitle className="text-left">{t("ups.landing.recentAlerts")}</CardTitle>
                      {branchAlarms.length > 0 && (
                        <span className="text-sm text-gray-500">
                          {branchAlarms.length} {t("alarms.total")}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
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
                ) : branchAlarms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">{t("alarms.noEventsYet")}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {paginatedAlarms.map((alarm) => (
                        <div
                          key={alarm.id}
                          className={`flex items-start space-x-3 p-3 rounded-lg border ${
                            alarm.severity === 'critical'
                              ? 'bg-red-50 border-red-200'
                              : alarm.severity === 'high'
                              ? 'bg-orange-50 border-orange-200'
                              : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className={`p-1 rounded ${
                            alarm.severity === 'critical' ? 'bg-red-100' : alarm.severity === 'high' ? 'bg-orange-100' : 'bg-blue-100'
                          }`}>
                            <AlertTriangle className={`w-4 h-4 ${
                              alarm.severity === 'critical' ? 'text-red-600' : alarm.severity === 'high' ? 'text-orange-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{alarm.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{getTimeAgo(alarm.timestamp)}</p>
                            <p className={`text-xs font-medium mt-1 ${
                              alarm.severity === 'critical' ? 'text-red-600' : alarm.severity === 'high' ? 'text-orange-600' : 'text-blue-600'
                            }`}>
                              {t(`alarms.severity.${alarm.severity}`)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={safePage <= 1}
                        >
                          {t('_rtl') === 'rtl' ? '›' : '‹'}
                        </Button>
                        <span className="text-sm text-gray-600">
                          {safePage} / {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={safePage >= totalPages}
                        >
                          {t('_rtl') === 'rtl' ? '‹' : '›'}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          );
        })()}

      </div>
    );
  };

  // Build pump sites for the operating hours table/chart from the daily-summary API
  const getPumpSitesForTable = () => {
    let items = allPumpsSummary;

    // Filter by selected sites if any
    if (selectedSiteIds.length > 0) {
      items = items.filter(item => selectedSiteIds.includes(String(item.siteId)));
    }

    // Build a lookup of numPumps from by-canals API data (siteConfiguration.numPumps)
    const numPumpsFromConfig = new Map<number, number>();
    for (const branch of data.branches) {
      for (const site of branch.sites) {
        const cfg = (site as any).siteConfiguration;
        if (cfg?.numPumps != null) {
          numPumpsFromConfig.set(Number(site.siteId), Number(cfg.numPumps));
        }
      }
    }

    // Resolve numPumps: prefer siteConfiguration from by-canals, fall back to daily-summary field
    const resolveNumPumps = (item: typeof items[0]) => {
      const fromConfig = numPumpsFromConfig.get(item.siteId);
      if (fromConfig != null) return fromConfig;
      if (item.numPumps != null) return item.numPumps;
      return 0;
    };

    return items.map(item => ({
      siteId: String(item.siteId),
      siteName: item.siteName,
      siteArabicName: item.siteArabicName,
      siteConfiguration: { numPumps: resolveNumPumps(item) },
      pumpData: {
        operatingTimes: [
          item.p1_TimeSum ?? null, item.p2_TimeSum ?? null, item.p3_TimeSum ?? null,
          item.p4_TimeSum ?? null, item.p5_TimeSum ?? null, item.p6_TimeSum ?? null,
          item.p7_TimeSum ?? null, item.p8_TimeSum ?? null, item.p9_TimeSum ?? null,
          item.p10_TimeSum ?? null,
        ],
        flows: [
          null, null, null, null, null,
          null, null, null, null, null,
        ],
        totalFlow: item.totalFlowSum ?? null,
      },
    }));
  };

  return (
    <div id="main" className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t("common.overview")}
        </Button>
        <span className="text-gray-400">/</span>
        <span className="font-medium text-gray-900">{t("ups.directorate.directorateView")}</span>
      </div>

      {/* Directorate Selection and Title */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("ups.pages.canalViewTitle")}</h1>
            <p className="text-gray-500 mt-1">
              {t("ups.pages.canalViewDescription", { branches: orderedBranches.map(b => b.name).join(' & ') })}
            </p>
          </div>
          <div className="flex gap-3">
            {/* Directorate Filter */}
            <div className="w-80">
              <label htmlFor="directorate-select" className="block text-sm font-medium text-gray-700 mb-2">
                {t("common.selectDirectorate") || "Filter by Directorate"}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-10"
                    disabled={directoratesLoading}
                  >
                    <span className="truncate">
                      {selectedDirectorateIds.length === 0
                        ? t("ups.directorate.allDirectorates")
                        : selectedDirectorateIds.length === 1
                        ? getDirectorateName(selectedDirectorateIds[0])
                        : `${selectedDirectorateIds.length} ${t("ups.directorate.directoratesSelected") || "directorates selected"}`}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-2 border-b">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {t("ups.directorate.selectDirectorates") || "Select Directorates"}
                      </span>
                      {selectedDirectorateIds.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDirectorateIds([])}
                          className="h-6 px-2 text-xs"
                        >
                          {t("common.clearAll") || "Clear All"}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {directorates.map((directorate) => {
                      const isSelected = selectedDirectorateIds.includes(String(directorate.id));
                      return (
                        <div
                          key={directorate.id}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                          onClick={() => {
                            const id = String(directorate.id);
                            if (isSelected) {
                              setSelectedDirectorateIds(prev => prev.filter(d => d !== id));
                            } else {
                              setSelectedDirectorateIds(prev => [...prev, id]);
                            }
                          }}
                        >
                          <Checkbox
                            checked={isSelected}

                          />
                          <label className="flex-1 text-sm cursor-pointer">
                            {t('_rtl') === 'rtl' ? (directorate.arabicName || directorate.name) : directorate.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Site Filter */}
            <div className="w-80">
              <label htmlFor="site-select" className="block text-sm font-medium text-gray-700 mb-2">
                {t("ups.directorate.filterBySite") || "Filter by Site"}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-10"
                    disabled={sitesLoading}
                  >
                    <span className="truncate">
                      {selectedSiteIds.length === 0
                        ? t("ups.directorate.allSites") || "All Sites"
                        : selectedSiteIds.length === 1
                        ? getSiteNameById(selectedSiteIds[0])
                        : `${selectedSiteIds.length} ${t("ups.directorate.sitesSelected") || "sites selected"}`}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-2 border-b">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {t("ups.directorate.selectSites") || "Select Sites"}
                      </span>
                      {selectedSiteIds.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSiteIds([])}
                          className="h-6 px-2 text-xs"
                        >
                          {t("common.clearAll") || "Clear All"}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {sites.map((site) => {
                      const isSelected = selectedSiteIds.includes(String(site.id));
                      return (
                        <div
                          key={site.id}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                          onClick={() => {
                            const id = String(site.id);
                            if (isSelected) {
                              setSelectedSiteIds(prev => prev.filter(s => s !== id));
                            } else {
                              setSelectedSiteIds(prev => [...prev, id]);
                            }
                          }}
                        >
                          <Checkbox
                            checked={isSelected}

                          />
                          <label className="flex-1 text-sm cursor-pointer">
                            {t('_rtl') === 'rtl' ? (site.arabicName || site.name) : site.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* Export Full Page Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleExportPageAsPNG}
          disabled={isExportingPage}
          className="gap-2"
          variant="outline"
        >
          <Download className="w-4 h-4" />
          {isExportingPage ? t("common.exporting") || "Exporting..." : t("common.exportAsImage") || "Export as Image"}
        </Button>
      </div>
      <TimeFilterBar
        value={filter}
        onChange={setFilter}
        range={range}
        onRangeChange={setRange}
        calculations={calculations}
        onCalculationsChange={setCalculations}
        onExport={handleExport}
        showCalculations={false}
        showLatestOption={true}
        showExport={true}
      />

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Time Selection Warning */}
      {!isTimeSelected && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-blue-700 text-sm">{t("ups.directorate.selectTime")}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabbed View for Branch Sections */}
      {isTimeSelected && !error && (
        <Tabs defaultValue="ibrahimia" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ibrahimia">{t("ups.branches.ibrahimia")}</TabsTrigger>
            <TabsTrigger value="bahr-youssef">{t("ups.branches.bahrYoussef")}</TabsTrigger>
          </TabsList>
          
          {orderedBranches.map((branch) => {
            // Map branch names to tab values
            const tabValue = branch.name === "Ibrahimiya" ? "ibrahimia" : "bahr-youssef";
            const isBahrYoussef = branch.name === "Bahr Youssef";
            
            return (
              <TabsContent key={branch.name} value={tabValue} className="space-y-6 mt-6">
                {renderBranchSection(branch.name, branch.sites, !isBahrYoussef)}
                
                {/* Pump Monthly Average Tables - Only for Bahr Youssef */}
                {isBahrYoussef && (
                  <>
                    {/* Pump Operating Times Table */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            {t("ups.directorate.monthlyPumpTimes") || "Pump Operating Times Avg (Hours)"}
                          </CardTitle>
                          <ExportDropdown
                            onExportCSV={() => {
                              const pumpSites = getPumpSitesForTable();
                              const columns = [
                                { key: 'siteName', header: t("ups.directorate.siteName") || "Site Name" },
                                { key: 'pump1', header: `${t("ups.directorate.pump") || "Pump"} 1 (${t("common.hours") || "hrs"})` },
                                { key: 'pump2', header: `${t("ups.directorate.pump") || "Pump"} 2 (${t("common.hours") || "hrs"})` },
                                { key: 'pump3', header: `${t("ups.directorate.pump") || "Pump"} 3 (${t("common.hours") || "hrs"})` },
                                { key: 'pump4', header: `${t("ups.directorate.pump") || "Pump"} 4 (${t("common.hours") || "hrs"})` },
                                { key: 'pump5', header: `${t("ups.directorate.pump") || "Pump"} 5 (${t("common.hours") || "hrs"})` },
                                { key: 'pump6', header: `${t("ups.directorate.pump") || "Pump"} 6 (${t("common.hours") || "hrs"})` },
                                { key: 'totalFlow', header: t("ups.directorate.totalFlow") || "Total Flow (m³/s)" }
                              ];
                              const exportData = pumpSites.map(site => {
                                const numPumps = site.siteConfiguration?.numPumps || 0;
                                const pumpTimes = site.pumpData?.operatingTimes || [];
                                return {
                                  siteName: t('_rtl') === 'rtl' ? (site.siteArabicName || site.siteName) : site.siteName,
                                  pump1: numPumps >= 1 && pumpTimes[0] != null ? (pumpTimes[0] as number).toFixed(0) : (t('_rtl') === 'rtl' ? 'غير متاح' : 'N/A'),
                                  pump2: numPumps >= 2 && pumpTimes[1] != null ? (pumpTimes[1] as number).toFixed(0) : (t('_rtl') === 'rtl' ? 'غير متاح' : 'N/A'),
                                  pump3: numPumps >= 3 && pumpTimes[2] != null ? (pumpTimes[2] as number).toFixed(0) : (t('_rtl') === 'rtl' ? 'غير متاح' : 'N/A'),
                                  pump4: numPumps >= 4 && pumpTimes[3] != null ? (pumpTimes[3] as number).toFixed(0) : (t('_rtl') === 'rtl' ? 'غير متاح' : 'N/A'),
                                  pump5: numPumps >= 5 && pumpTimes[4] != null ? (pumpTimes[4] as number).toFixed(0) : (t('_rtl') === 'rtl' ? 'غير متاح' : 'N/A'),
                                  pump6: numPumps >= 6 && pumpTimes[5] != null ? (pumpTimes[5] as number).toFixed(0) : (t('_rtl') === 'rtl' ? 'غير متاح' : 'N/A'),
                                  totalFlow: site.pumpData?.totalFlow != null ? (site.pumpData.totalFlow as number).toFixed(2) : "-"
                                };
                              });
                              exportTableToCSV(exportData, columns, "pump-operating-times");
                            }}
                            onExportExcel={() => {
                              const pumpSites = getPumpSitesForTable();
                              const columns = [
                                { key: 'siteName', header: t("ups.directorate.siteName") || "Site Name" },
                                { key: 'pump1', header: `${t("ups.directorate.pump") || "Pump"} 1 (${t("common.hours") || "hrs"})` },
                                { key: 'pump2', header: `${t("ups.directorate.pump") || "Pump"} 2 (${t("common.hours") || "hrs"})` },
                                { key: 'pump3', header: `${t("ups.directorate.pump") || "Pump"} 3 (${t("common.hours") || "hrs"})` },
                                { key: 'pump4', header: `${t("ups.directorate.pump") || "Pump"} 4 (${t("common.hours") || "hrs"})` },
                                { key: 'pump5', header: `${t("ups.directorate.pump") || "Pump"} 5 (${t("common.hours") || "hrs"})` },
                                { key: 'pump6', header: `${t("ups.directorate.pump") || "Pump"} 6 (${t("common.hours") || "hrs"})` },
                                { key: 'totalFlow', header: t("ups.directorate.totalFlow") || "Total Flow (m³/s)" }
                              ];
                              const exportData = pumpSites.map(site => {
                                const numPumps = site.siteConfiguration?.numPumps || 0;
                                const pumpTimes = site.pumpData?.operatingTimes || [];
                                return {
                                  siteName: t('_rtl') === 'rtl' ? (site.siteArabicName || site.siteName) : site.siteName,
                                  pump1: numPumps >= 1 && pumpTimes[0] != null ? (pumpTimes[0] as number).toFixed(0) : (t('_rtl') === 'rtl' ? 'غير متاح' : 'N/A'),
                                  pump2: numPumps >= 2 && pumpTimes[1] != null ? (pumpTimes[1] as number).toFixed(0) : (t('_rtl') === 'rtl' ? 'غير متاح' : 'N/A'),
                                  pump3: numPumps >= 3 && pumpTimes[2] != null ? (pumpTimes[2] as number).toFixed(0) : (t('_rtl') === 'rtl' ? 'غير متاح' : 'N/A'),
                                  pump4: numPumps >= 4 && pumpTimes[3] != null ? (pumpTimes[3] as number).toFixed(0) : (t('_rtl') === 'rtl' ? 'غير متاح' : 'N/A'),
                                  pump5: numPumps >= 5 && pumpTimes[4] != null ? (pumpTimes[4] as number).toFixed(0) : (t('_rtl') === 'rtl' ? 'غير متاح' : 'N/A'),
                                  pump6: numPumps >= 6 && pumpTimes[5] != null ? (pumpTimes[5] as number).toFixed(0) : (t('_rtl') === 'rtl' ? 'غير متاح' : 'N/A'),
                                  totalFlow: site.pumpData?.totalFlow != null ? (site.pumpData.totalFlow as number).toFixed(2) : "-"
                                };
                              });
                              exportTableToExcel(exportData, columns, "pump-operating-times");
                            }}
                            size="sm"
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className={`flex items-center gap-3 ${t('_rtl') === 'rtl' ? 'flex-row-reverse' : ''}`}>
                          <DatePicker
                            placeholder={t("ups.filters.selectDate") || "Select date"}
                            value={pumpDate}
                            onChange={setPumpDate}
                          />
                          {pumpDate && (
                            <button
                              onClick={() => setPumpDate(undefined)}
                              className="text-xs text-gray-400 hover:text-gray-600 underline"
                            >
                              {t("common.clearDate") || "Clear"}
                            </button>
                          )}
                        </div>
                        <div className="overflow-x-auto">
                          {pumpSummaryLoading ? (
                            <div className="py-8 text-center text-gray-400 text-sm">{t("common.loading") || "Loading..."}</div>
                          ) : (
                          <Table dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-center font-semibold">
                                  {t("ups.directorate.siteName") || "Site Name"}
                                </TableHead>
                                {[1, 2, 3, 4, 5, 6].map(pumpNum => (
                                  <TableHead key={pumpNum} className="text-center font-semibold min-w-[100px]">
                                    {t("ups.directorate.pump")} {pumpNum} ({t("common.hours") || "hrs"})
                                  </TableHead>
                                ))}
                                <TableHead className="text-center font-semibold min-w-[110px]">
                                  {t("ups.directorate.totalFlow") || "Total Flow (m³/s)"}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getPumpSitesForTable().length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={8} className="text-center text-gray-500 py-6">
                                    {t("common.noData")}
                                  </TableCell>
                                </TableRow>
                              ) : getPumpSitesForTable().map((site) => {
                                const numPumps = site.siteConfiguration?.numPumps || 0;
                                const pumpTimes = site.pumpData?.operatingTimes || [];
                                return (
                                  <TableRow key={site.siteId}>
                                    <TableCell className="font-medium text-center">
                                      {t('_rtl') === 'rtl'
                                        ? (site.siteArabicName || site.siteName)
                                        : site.siteName
                                      }
                                    </TableCell>
                                    {[1, 2, 3, 4, 5, 6].map(pumpNum => {
                                      const pumpExists = pumpNum <= numPumps;
                                      const timeValue = pumpTimes[pumpNum - 1];
                                      const hasData = timeValue !== undefined && timeValue !== null;

                                      return (
                                        <TableCell key={pumpNum} className="text-center">
                                          {!pumpExists ? (
                                            <span className="text-gray-400">
                                              {t('_rtl') === 'rtl' ? 'غير متاح' : 'N/A'}
                                            </span>
                                          ) : hasData ? (
                                            <span className="text-blue-600 font-medium">
                                              {(timeValue as number).toFixed(0)}
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">-</span>
                                          )}
                                        </TableCell>
                                      );
                                    })}
                                    <TableCell className="text-center">
                                      {site.pumpData?.totalFlow != null ? (
                                        <span className="text-green-600 font-semibold">
                                          {(site.pumpData.totalFlow as number).toFixed(2)}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <PumpOperatingTimesChart sites={getPumpSitesForTable()} />

                    {/* Recent Alerts - Bahr Youssef (paginated) */}
                    {(() => {
                      const allAlarms = alarmsByCanal[1] ?? [];
                      const totalPages = Math.max(1, Math.ceil(allAlarms.length / ALARMS_PAGE_SIZE));
                      const safePage = Math.min(bahrYoussefAlarmsPage, totalPages);
                      const paginatedAlarms = allAlarms.slice((safePage - 1) * ALARMS_PAGE_SIZE, safePage * ALARMS_PAGE_SIZE);
                      return (
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                                {t("ups.landing.recentAlerts")}
                              </CardTitle>
                              {allAlarms.length > 0 && (
                                <span className="text-sm text-gray-500">
                                  {allAlarms.length} {t("alarms.total") || "total"}
                                </span>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 space-y-4">
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
                            ) : allAlarms.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">{t("alarms.noEventsYet")}</p>
                              </div>
                            ) : (
                              <>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                  {paginatedAlarms.map((alarm) => (
                                    <div
                                      key={alarm.id}
                                      className={`flex items-start space-x-3 p-3 rounded-lg border ${
                                        alarm.severity === 'critical'
                                          ? 'bg-red-50 border-red-200'
                                          : alarm.severity === 'high'
                                          ? 'bg-orange-50 border-orange-200'
                                          : 'bg-blue-50 border-blue-200'
                                      }`}
                                    >
                                      <div className={`p-1 rounded ${
                                        alarm.severity === 'critical' ? 'bg-red-100' : alarm.severity === 'high' ? 'bg-orange-100' : 'bg-blue-100'
                                      }`}>
                                        <AlertTriangle className={`w-4 h-4 ${
                                          alarm.severity === 'critical' ? 'text-red-600' : alarm.severity === 'high' ? 'text-orange-600' : 'text-blue-600'
                                        }`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{alarm.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">{getTimeAgo(alarm.timestamp)}</p>
                                        <p className={`text-xs font-medium mt-1 ${
                                          alarm.severity === 'critical' ? 'text-red-600' : alarm.severity === 'high' ? 'text-orange-600' : 'text-blue-600'
                                        }`}>
                                          {t(`alarms.severity.${alarm.severity}`)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {totalPages > 1 && (
                                  <div className="flex items-center justify-center gap-2 pt-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setBahrYoussefAlarmsPage(p => Math.max(1, p - 1))}
                                      disabled={safePage <= 1}
                                    >
                                      {t('_rtl') === 'rtl' ? '›' : '‹'}
                                    </Button>
                                    <span className="text-sm text-gray-600">
                                      {safePage} / {totalPages}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setBahrYoussefAlarmsPage(p => Math.min(totalPages, p + 1))}
                                      disabled={safePage >= totalPages}
                                    >
                                      {t('_rtl') === 'rtl' ? '‹' : '›'}
                                    </Button>
                                  </div>
                                )}
                              </>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })()}

                    {/* Pump Flow Rates Table
                    <Card>
                      <CardHeader>
                        <CardTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                          {t("ups.directorate.monthlyPumpFlows") || "Pump Flows Avg (m³/s)"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <Table dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-center font-semibold">
                                  {t("ups.directorate.siteName") || "Site Name"}
                                </TableHead>
                                {[1, 2, 3, 4, 5, 6].map(pumpNum => (
                                  <TableHead key={pumpNum} className="text-center font-semibold min-w-[100px]">
                                    {t("ups.directorate.pump")} {pumpNum}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getPumpSites().map((site: SiteSummary) => {
                                const numPumps = (site as any).siteConfiguration?.numPumps || 0;
                                const pumpFlows = (site as any).pumpData?.flows || [];
                                return (
                                  <TableRow key={site.siteId}>
                                    <TableCell className="font-medium text-center">
                                      {t('_rtl') === 'rtl' 
                                        ? (site.siteArabicName || site.siteName)
                                        : site.siteName
                                      }
                                    </TableCell>
                                    {[1, 2, 3, 4, 5, 6].map(pumpNum => {
                                      const pumpExists = pumpNum <= numPumps;
                                      const flowValue = pumpFlows[pumpNum - 1];
                                      const hasData = flowValue !== undefined && flowValue !== null;
                                      
                                      return (
                                        <TableCell key={pumpNum} className="text-center">
                                          {!pumpExists ? (
                                            <span className="text-gray-400">
                                              {t('_rtl') === 'rtl' ? 'غير متاح' : 'N/A'}
                                            </span>
                                          ) : hasData ? (
                                            <span className="text-blue-600 font-medium">
                                              {flowValue.toFixed(2)}
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">-</span>
                                          )}
                                        </TableCell>
                                      );
                                    })}
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card> */}
                  </>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {/* Details Dialog */}
      <Dialog open={selectedPumpStation !== null} onOpenChange={(open) => {
        if (!open) setSelectedPumpStation(null);
      }}>
        <DialogContent className="max-w-2xl" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
              {selectedPumpStation && (t('_rtl') === 'rtl' 
                ? (selectedPumpStation.siteArabicName || selectedPumpStation.siteName)
                : selectedPumpStation.siteName
              )} - {t("common.details")}
            </DialogTitle>
          </DialogHeader>
          {selectedPumpStation && (
            <div className="space-y-4">
              {(selectedPumpStation as any).pumpData ? (
                <>
                  <div className={`text-sm ${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}`}>
                    <span className="text-gray-500">{t("ups.directorate.readingTime")}:</span>
                    <p className="font-medium mt-1">
                      {(() => {
                        const readingTime = (selectedPumpStation as any).pumpData.readingTime;
                        if (!readingTime) return "-";
                        const date = new Date(readingTime);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        return `${year}-${month}-${day} ${hours}:${minutes}`;
                      })()}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className={`font-semibold mb-3 ${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}`}>
                      {t("ups.directorate.pumpFlows")}
                    </h4>
                    <div className="space-y-2">
                      {(selectedPumpStation as any).pumpData.flows.slice(0, 6).map((flow: number, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-gray-600">{t("ups.directorate.pump")} {index + 1}:</span>
                          <span className="font-semibold text-blue-600">{flow.toFixed(2)} m³/s</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-gray-700 font-medium">{t("ups.directorate.totalFlow")}:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {((selectedPumpStation as any).pumpData.totalFlow != null 
                          ? (selectedPumpStation as any).pumpData.totalFlow.toFixed(2)
                          : (selectedPumpStation as any).pumpData.flows.reduce((sum: number, f: number) => sum + f, 0).toFixed(2)
                        )} m³/s
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-center py-4">{t("ups.directorate.noPumpData")}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
