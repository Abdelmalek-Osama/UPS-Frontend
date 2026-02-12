import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { TimeFilterBar } from "./TimeFilterBar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
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

  
  const { data, governorateName } = useGovernorateOverview(directorateId, filter, range);

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

  const renderBranchSection = (branchName: string, sites: SiteSummary[]) => {
    const sortedSites = sites.sort((a, b) => a.position - b.position);
    const filteredSites = filterSites(sortedSites);
    
    // Separate main regulators and all sites for charts
    const mainRegulators = sortedSites.filter(site => 
      !site.siteName.toLowerCase().includes("branch") && 
      !site.siteName.toLowerCase().includes("pump")
    );
    
    // Prepare chart data for upstream/downstream profile (main regulators only)
    const profileChartData = mainRegulators.map(site => ({
      name: site.siteName.split(' ').slice(0, 2).join(' '),
      upstream: site.upstream || 0,
      downstream: site.downstream || 0,
      hasData: site.upstream > 0 || site.downstream > 0
    }));

    // Prepare chart data for flow rate (all sites)
    const flowChartData = sortedSites.map(site => ({
      name: site.siteName.split(' ').slice(0, 2).join(' '),
      flowRate: site.flowRate || 0,
      type: site.siteName.toLowerCase().includes("branch") ? "Branch" : 
            site.siteName.toLowerCase().includes("pump") ? "Pump" : "Main"
    }));

    // Check if this is Bahr Youssef (has pump stations)
    const isPumpBranch = branchName === "Bahr Youssef";
    const pumpStations = sortedSites.filter(site => 
      site.siteName.toLowerCase().includes("pump")
    );

    return (
      <div key={branchName} className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{branchName} Section</h2>

        {/* Sites Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{branchName} Sites</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search sites..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
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
                  <TableHead className="text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSites.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500">
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

        {/* Upstream/Downstream Profile Chart (Main Regulators Only) */}
        <Card>
          <CardHeader>
            <CardTitle>Upstream/Downstream Profile (South to North - Main Regulators)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profileChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis label={{ value: 'Water Level (m)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="upstream" fill="#3b82f6" name="Upstream" />
                  <Bar dataKey="downstream" fill="#ef4444" name="Downstream" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Flow Rate Chart (All Sites) */}
        <Card>
          <CardHeader>
            <CardTitle>Total Flow (All Sites - Main & Branch Canals)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flowChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis label={{ value: 'Flow Rate (m³/s)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="flowRate" fill="#06b6d4" name="Flow Rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pump Stations Table (Bahr Youssef only) */}
        {isPumpBranch && pumpStations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pump Stations Status</CardTitle>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pumpStations.map((station) => {
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
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
          Overview
        </Button>
        <span className="text-gray-400">/</span>
        <span className="font-medium text-gray-900">Directorate View</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{governorateName} Directorate</h1>
        <p className="text-gray-500 mt-1">
          Monitoring points across {orderedBranches.map(b => b.name).join(' & ')}
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
        showCalculations={true}
      />

      {/* Branch Sections */}
      <div className="space-y-12">
        {orderedBranches.map((branch) => 
          renderBranchSection(branch.name, branch.sites)
        )}
      </div>
    </div>
  );
}
