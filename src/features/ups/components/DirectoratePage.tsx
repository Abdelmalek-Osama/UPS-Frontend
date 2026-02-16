import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { ArrowLeft, Search, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { TimeFilterBar } from "./TimeFilterBar";
import { DirectorateWLChart } from "./DirectorateWLChart";
import { DirectorateFlowChart } from "./DirectorateFlowChart";
import { useGovernorateOverview } from "../hooks/useGovernorateOverview";
import { useDirectoratesList } from "../hooks/useDirectoratesList";
import { exportReport } from "../api/upsApi";
import type { DateRange, TimeFilter, SiteSummary } from "../types";
import type { CalculationOptions } from "./TimeFilterBar";

// Main regulators for each canal (in display order)
const MAIN_REGULATORS = {
  "Ibrahimiya": ["13", "12", "11", "32", "10", "9", "8", "1"],
  "Bahr Youssef": ["7", "6", "20", "5", "19", "4", "3", "2"]
};

export function DirectoratePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [directorateId, setDirectorateId] = useState<string>("");
  const [filter, setFilter] = useState<TimeFilter>("week");
  const [range, setRange] = useState<DateRange>({});
  const [calculations, setCalculations] = useState<CalculationOptions>({
    levels: "average",
    flow: "sum"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPumpStation, setSelectedPumpStation] = useState<SiteSummary | null>(null);

  const { directorates, loading: directoratesLoading } = useDirectoratesList();
  const { data, error } = useGovernorateOverview(directorateId, filter, range);

  // Handle export functionality
  const handleExport = async (format: "pdf" | "excel") => {
    try {
      await exportReport("governorate", format, filter, range, undefined, directorateId);
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
    if (filter === "custom") return !!range.startTime && !!range.endTime;
    return true; // latest, week, month don't require time selection
  }, [filter, range.startTime, range.endTime]);

  const handleSiteClick = (siteId: string) => {
    navigate(`/sites/${siteId}`);
  };

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
    // Filter sites by directorate if a directorate is selected
    let filteredByDirectorate = sites;
    if (directorateId && directorateId !== "" && directorateId !== "all") {
      const selectedDirId = parseInt(directorateId);
      filteredByDirectorate = sites.filter(site => site.directorateId === selectedDirId);
    }
    
    const sortedSites = filteredByDirectorate.sort((a, b) => a.position - b.position);
    const filteredSites = filterSites(sortedSites);
    
    // Get site name based on language
    const getSiteName = (site: SiteSummary) => 
      t('_rtl') === 'rtl' ? (site.siteArabicName || site.siteName) : site.siteName;
    
    // Transform site data for water level chart (USWL vs DSWL)
    const profileChartData = sortedSites.map(site => ({
      id: site.siteId,
      name: getSiteName(site),
      uswl: site.upstream,
      dswl: site.downstream
    }));

    // Get main regulator IDs for this branch
    const mainRegulatorIds = MAIN_REGULATORS[branchName as keyof typeof MAIN_REGULATORS] || [];
    
    // Filter and sort flow data to only include main regulators in specified order
    const calculatedFlowData = mainRegulatorIds
      .map(id => sites.find(site => site.siteId === id))
      .filter((site): site is SiteSummary => site !== undefined)
      .map(site => ({
        id: site.siteId,
        name: getSiteName(site),
        calculatedFlow: site.flowRate
      }));
    
    // If no main regulators found, show all sites in position order as fallback
    const finalFlowData = calculatedFlowData.length > 0 
      ? calculatedFlowData 
      : sortedSites.map(site => ({
          id: site.siteId,
          name: getSiteName(site),
          calculatedFlow: site.flowRate
        }));

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
                  <TableHead className="text-center"></TableHead>
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
                      <TableCell className="text-center">{site.upstream > 0 ? site.upstream.toFixed(2) : "-"}</TableCell>
                      <TableCell className="text-center">{site.downstream > 0 ? site.downstream.toFixed(2) : "-"}</TableCell>
                      <TableCell className="text-blue-600 font-medium text-center">
                        {(() => {
                          const numPumps = (site as any).siteConfiguration?.numPumps || 0;
                          if (numPumps > 0 && (site as any).pumpData?.flows) {
                            const totalFlow = (site as any).pumpData.flows.reduce((sum: number, flow: number) => sum + flow, 0);
                            return totalFlow > 0 ? totalFlow.toFixed(1) : "-";
                          }
                          return site.flowRate > 0 ? site.flowRate.toFixed(1) : "-";
                        })()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 text-center">
                        {new Date(site.lastReading).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 text-center">
                        {new Date(site.lastReading).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </TableCell>
                      {isPumpBranch && (
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPumpStation(site)}
                            className="h-8 w-8 p-0"
                            disabled={(site as any).siteConfiguration?.numPumps === 0}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSiteClick(site.siteId)}
                        >
                          →
                        </Button>
                      </TableCell>
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
          <div className="w-64">
            <label htmlFor="directorate-select" className="block text-sm font-medium text-gray-700 mb-2">
              {t("common.selectDirectorate") || "Filter by Directorate"}
            </label>
            <Select 
              defaultValue="all"
              value={directorateId === "" ? "all" : directorateId}
              onValueChange={(value) => {
                if (value === "all") {
                  setDirectorateId("");
                } else {
                  setDirectorateId(value);
                }
              }}
              disabled={directoratesLoading}
            >
              <SelectTrigger id="directorate-select">
                <SelectValue placeholder={t("ups.directorate.allDirectorates")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("ups.directorate.allDirectorates")}</SelectItem>
                {directorates.map((directorate) => (
                  <SelectItem key={directorate.id} value={String(directorate.id)}>
                    {directorate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            return (
              <TabsContent key={branch.name} value={tabValue} className="space-y-6 mt-6">
                {renderBranchSection(branch.name, branch.sites)}
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {/* Details Dialog */}
      <Dialog open={selectedPumpStation !== null} onOpenChange={(open) => {
        if (!open) setSelectedPumpStation(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPumpStation?.siteName} - {t("common.details")}</DialogTitle>
          </DialogHeader>
          {selectedPumpStation && (
            <div className="space-y-4">
              {(selectedPumpStation as any).pumpData ? (
                <>
                  <div className="text-sm">
                    <span className="text-gray-500">{t("ups.directorate.readingTime")}:</span>
                    <p className="font-medium mt-1">
                      {new Date((selectedPumpStation as any).pumpData.readingTime).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-semibold mb-3">{t("ups.directorate.pumpFlows")}</h4>
                    <div className="space-y-2">
                      {(selectedPumpStation as any).pumpData.flows.map((flow: number, index: number) => (
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
                        {(selectedPumpStation as any).pumpData.flows.reduce((sum: number, f: number) => sum + f, 0).toFixed(2)} m³/s
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
