import { useMemo, useState } from "react";
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
import { ArrowLeft, Search, Info, ChevronDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { TimeFilterBar } from "./TimeFilterBar";
import { DirectorateWLChart } from "./DirectorateWLChart";
import { DirectorateFlowChart } from "./DirectorateFlowChart";
import { useGovernorateOverview } from "../hooks/useGovernorateOverview";
import { useDirectoratesList } from "../hooks/useDirectoratesList";
import { useSitesList } from "../hooks/useSitesList";
import { exportReport } from "../api/upsApi";
import type { DateRange, TimeFilter, SiteSummary } from "../types";
import type { CalculationOptions } from "./TimeFilterBar";

// Main regulators for each canal (which sites to show in USWL/DSWL chart)
// Order is now determined by canalOrder from backend, not by array position
const MAIN_REGULATORS = {
  "Ibrahimiya": ["13", "12", "11", "32", "10", "9", "8", "1", "58"],
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPumpStation, setSelectedPumpStation] = useState<SiteSummary | null>(null);

  const { directorates, loading: directoratesLoading } = useDirectoratesList();
  const { sites, loading: sitesLoading } = useSitesList();
  // Use first selected directorate for API call, or empty string if none selected
  const apiDirectorateId = selectedDirectorateIds.length > 0 ? selectedDirectorateIds[0] : "";
  const { data, error } = useGovernorateOverview(apiDirectorateId, filter, range);

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



  const renderBranchSection = (branchName: string, sites: SiteSummary[]) => {
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

    return (
      <div key={branchName} className="space-y-6">
        <h2 className={`text-2xl font-bold text-gray-900 ${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}`}>{localizedBranchName}</h2>

        {/* Sites Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              {t('_rtl') === 'rtl' ? (
                <>
                  {/* Arabic: Search on left, Title on right */}
                  <div className="flex items-center gap-3">
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
                  {/* English: Title on left, Search on right */}
                  <CardTitle className="text-left">{t("ups.directorate.branchSites", { branch: localizedBranchName })}</CardTitle>
                  <div className="flex items-center gap-3">
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

        
      </div>
    );
  };

  // Get all pump sites for the summary tables
  // NOTE: This includes ALL sites with pumps from both branches, not just MAIN_REGULATORS
  // The MAIN_REGULATORS constant is only used for the USWL/DSWL chart, not these tables
  const getPumpSites = () => {
    let allSites: SiteSummary[] = [];
    
    // Collect ALL sites from all branches (not limited to MAIN_REGULATORS)
    orderedBranches.forEach(branch => {
      allSites = allSites.concat(branch.sites);
    });

    // Filter by directorate if selected
    if (selectedDirectorateIds.length > 0) {
      const selectedDirIds = selectedDirectorateIds.map(id => parseInt(id));
      allSites = allSites.filter(site => site.directorateId !== undefined && selectedDirIds.includes(site.directorateId));
    }

    // Filter by selected sites if sites are selected
    if (selectedSiteIds.length > 0) {
      allSites = allSites.filter(site => selectedSiteIds.includes(site.siteId));
    }

    // Only include sites with pumps (this gets ALL pump sites, not just the main ones)
    return allSites.filter(site => (site as any).siteConfiguration?.numPumps > 0);
  };

  return (
    <div className="space-y-6">
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
      </div>      {/* Time Filter and Export Controls */}
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
        showExport={false}
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
                {renderBranchSection(branch.name, branch.sites)}
                
                {/* Pump Monthly Average Tables - Only for Bahr Youssef */}
                {isBahrYoussef && (
                  <>
                    {/* Pump Operating Times Table */}
                    <Card>
                      <CardHeader>
                        <CardTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                          {t("ups.directorate.monthlyPumpTimes") || "Pump Operating Times Avg (Hours)"}
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
                                const pumpTimes = (site as any).pumpData?.operatingTimes || [];
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
                                              {timeValue.toFixed(0)} {t("common.hours") || "hrs"}
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
                    </Card>

                    {/* Pump Flow Rates Table */}
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
                    </Card>
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
