import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { ArrowLeft, Search, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
import { TimeFilterBar } from "./TimeFilterBar";
import { DirectorateWLChart } from "./DirectorateWLChart";
import { DirectorateFlowChart } from "./DirectorateFlowChart";
import { useGovernorateOverview } from "../hooks/useGovernorateOverview";
import { exportReport } from "../api/upsApi";
import type { DateRange, TimeFilter, SiteSummary } from "../types";
import type { CalculationOptions } from "./TimeFilterBar";

export function DirectoratePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const directorateId = params.governorateId || "minia";
  const [filter, setFilter] = useState<TimeFilter>("week");
  const [range, setRange] = useState<DateRange>({});
  const [calculations, setCalculations] = useState<CalculationOptions>({
    levels: "average",
    flow: "sum"
  });
  const [searchTerm, setSearchTerm] = useState("");

  
  const { data } = useGovernorateOverview(directorateId, filter, range);

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

  const handleSiteClick = (siteId: string) => {
    navigate(`/sites/${siteId}`);
  };

  const filterSites = (sites: SiteSummary[]) => {
    if (!searchTerm) return sites;
    return sites.filter(site =>
      site.siteName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const generatePumpReadings = () => {
    // Generate mock pump readings for up to 6 pumps
    const readings = [];
    for (let i = 1; i <= 6; i++) {
      readings.push({
        pump: i,
        flow: (Math.random() * 100 + 20).toFixed(2),
        time: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          hour12: false 
        })
      });
    }
    return readings;
  };

  const renderBranchSection = (branchName: string, sites: SiteSummary[]) => {
    const sortedSites = sites.sort((a, b) => a.position - b.position);
    const filteredSites = filterSites(sortedSites);
    
    // Always generate sample data for charts to ensure they display
    const profileChartData = sortedSites
      .filter(site => 
        !site.siteName.toLowerCase().includes("branch") && 
        !site.siteName.toLowerCase().includes("pump")
      )
      .map((site, idx) => ({
        id: `uswl-dswl-${idx}`,
        name: site.siteName.split(' ').slice(0, 2).join(' '),
        uswl: site.upstream > 0 ? site.upstream : 15 + Math.random() * 5 + idx * 0.5,
        dswl: site.downstream > 0 ? site.downstream : 14 + Math.random() * 4 + idx * 0.4
      }));

    // Always generate sample data for calculated flow to ensure it displays
    const calculatedFlowData = sortedSites
      .map((site, idx) => {
        const baseFlow = site.siteName.toLowerCase().includes("branch") ? 50 : 
                        site.siteName.toLowerCase().includes("pump") ? 30 : 100;
        return {
          id: `flow-${idx}`,
          name: site.siteName.split(' ').slice(0, 2).join(' '),
          calculatedFlow: site.flowRate > 0 ? site.flowRate : baseFlow + Math.random() * 20 - 10 + idx * 5
        };
      });



    // Check if this is Bahr Youssef (has pump stations)
    const isPumpBranch = branchName === "Bahr Youssef";
    // Use all sites from Bahr Youssef branch as pump stations
    const pumpStations = isPumpBranch ? sortedSites : [];

    return (
      <div key={branchName} className="space-y-6">

        {/* Sites Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{branchName} {t("ups.pages.sites")}</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative w-64 h-10">
                  <Input
                    placeholder="Search sites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-full"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" style={{ top: '40%', transform: 'translateY(-50%)' }} />
                </div>

              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center"></TableHead>
                  <TableHead className="text-center">Site Name</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Upstream (m)</TableHead>
                  <TableHead className="text-center">Downstream (m)</TableHead>
                  <TableHead className="text-center">Flow (m³/s)</TableHead>
                  <TableHead className="text-center">Date</TableHead>
                  <TableHead className="text-center">Hour</TableHead>
                  <TableHead className="text-center">{t("common.details")}</TableHead>
                  <TableHead className="text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSites.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-gray-500">
                      {searchTerm ? "No sites match your search" : t("common.noData")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSites.map((site) => (
                    <TableRow key={site.siteId} className="hover:bg-gray-50">
                      <TableCell className="text-center">
                      </TableCell>
                      <TableCell className="font-medium text-center">{site.siteName}</TableCell>
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
                        {site.flowRate > 0 ? site.flowRate.toFixed(1) : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 text-center">
                        {new Date(site.lastReading).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 text-center">
                        {new Date(site.lastReading).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPumpStation(site)}
                          className="h-8 w-8 p-0"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TableCell>
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
        <DirectorateWLChart branchName={branchName} data={profileChartData} />

        {/* Calculated Flow Chart (Line Graph) */}
        <DirectorateFlowChart branchName={branchName} data={calculatedFlowData} />

        {/* Pump Stations Table (Bahr Youssef only) */}
        <Card>
          <CardHeader>
            <CardTitle>{t("ups.pages.pumpStationsStatus")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Pump Station</TableHead>
                  <TableHead className="text-center">Date</TableHead>
                  <TableHead className="text-center">Hour</TableHead>
                  <TableHead className="text-center">Pump 1</TableHead>
                  <TableHead className="text-center">Pump 2</TableHead>
                  <TableHead className="text-center">Pump 3</TableHead>
                  <TableHead className="text-center">Pump 4</TableHead>
                  <TableHead className="text-center">Pump 5</TableHead>
                  <TableHead className="text-center">Pump 6</TableHead>
                  <TableHead className="text-center">{t("common.details")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pumpStations.length > 0 ? (
                  pumpStations.map((station) => {
                    // Mock pump status - should come from backend
                    const pumpStatuses = [
                      Math.random() > 0.3 ? "ON" : "OFF",
                      Math.random() > 0.3 ? "ON" : "OFF",
                      Math.random() > 0.5 ? "ON" : "OFF",
                      Math.random() > 0.3 ? "ON" : "OFF",
                      Math.random() > 0.6 ? "ON" : "OFF",
                      Math.random() > 0.4 ? "ON" : "OFF",
                    ];

                    return (
                      <TableRow key={station.siteId}>
                        <TableCell className="font-medium text-center">{station.siteName}</TableCell>
                        <TableCell className="text-sm text-gray-500 text-center">
                          {new Date(station.lastReading).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 text-center">
                          {new Date(station.lastReading).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </TableCell>
                        {pumpStatuses.map((status, idx) => (
                          <TableCell key={idx} className="text-center">
                            <Badge
                              className={
                                status === "ON"
                                  ? "bg-green-100 text-green-700 border-0"
                                  : "bg-gray-100 text-gray-600 border-0"
                              }
                            >
                              {status}
                            </Badge>
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPumpStation(station)}
                            className="h-8 w-8 p-0"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-4 text-gray-500">
                      No pump stations available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
        <span className="font-medium text-gray-900">{t("ups.pages.canalView")}</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("ups.pages.canalViewTitle")}</h1>
        <p className="text-gray-500 mt-1">
          {t("ups.pages.canalViewDescription", { branches: orderedBranches.map(b => b.name).join(' & ') })}
        </p>
      </div>

      {/* Time Filter and Export Controls */}
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

      {/* Tabbed View for Branch Sections */}
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
    </div>
  );
}
