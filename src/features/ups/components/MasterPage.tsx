import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { TimeFilterBar } from "./TimeFilterBar";
import { useMasterOverview } from "../hooks/useMasterOverview";
import { exportReport } from "../api/upsApi";
import type { DateRange, TimeFilter } from "../types";
import type { CalculationOptions } from "./TimeFilterBar";

export function MasterPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TimeFilter>("latest");
  const [range, setRange] = useState<DateRange>({});
  const [calculations, setCalculations] = useState<CalculationOptions>({
    levels: "average",
    battery: "average",
    flow: "sum"
  });
  const { data } = useMasterOverview(filter, range);

  // Handle export functionality
  const handleExport = async (format: "pdf" | "excel") => {
    try {
      await exportReport("master", format, filter, range);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const sortedSites = useMemo(
    () => [...data.sites].sort((a, b) => a.position - b.position),
    [data.sites],
  );

  const handleSiteClick = (siteId: string) => {
    navigate(`/sites/${siteId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-0';
      case 'alarm':
        return 'bg-red-100 text-red-700 border-0';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-700 border-0';
      default:
        return 'bg-gray-100 text-gray-600 border-0';
    }
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
        <span className="font-medium text-gray-900">Master View</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Full System Master View</h1>
        <p className="text-gray-500 mt-1">
          Complete overview of all {sortedSites.length} monitoring sites (Aswan → Fayoum)
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
        showCalculations={filter !== "latest"}
      />

      {/* System-Wide Hydraulic Profile Chart */}
      <Card>
        <CardHeader>
          <CardTitle>System-Wide Hydraulic Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] bg-gray-50 border rounded p-4">
            <div className="flex items-end justify-between h-[280px] border-b border-l border-gray-300 overflow-x-auto">
              <div className="flex items-end space-x-1 min-w-max">
                {sortedSites.map((site) => {
                  const upstreamHeight = (site.upstream / 16) * 220; // Scale to chart height
                  const downstreamHeight = (site.downstream / 16) * 220;
                  const flowHeight = (site.flowRate / 60) * 220; // Scale flow rate
                  
                  return (
                    <div key={site.siteId} className="flex flex-col items-center space-y-1">
                      <div className="flex space-x-0.5">
                        <div 
                          className="w-3 bg-blue-500 rounded-t"
                          style={{ height: `${upstreamHeight}px` }}
                          title={`${site.siteName}: Upstream ${site.upstream}m`}
                        ></div>
                        <div 
                          className="w-3 bg-red-500 rounded-t"
                          style={{ height: `${downstreamHeight}px` }}
                          title={`${site.siteName}: Downstream ${site.downstream}m`}
                        ></div>
                        <div 
                          className="w-3 bg-cyan-400 rounded-t opacity-70"
                          style={{ height: `${flowHeight}px` }}
                          title={`${site.siteName}: Flow Rate ${site.flowRate} m³/s`}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 text-center max-w-12 truncate transform -rotate-45 origin-center">
                        {site.siteName.split(' ')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-center mt-4 space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Upstream Level</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Downstream Level</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-cyan-400 rounded opacity-70"></div>
                <span>Flow Rate</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Telemetry Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Telemetry Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Governorate</TableHead>
                  <TableHead>Site Name</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Upstream</TableHead>
                  <TableHead className="text-right">Downstream</TableHead>
                  <TableHead className="text-right">Flow</TableHead>
                  <TableHead className="text-right">Battery</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSites.map((site) => (
                  <TableRow 
                    key={site.siteId} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSiteClick(site.siteId)}
                  >
                    <TableCell className="font-medium text-gray-600">
                      {site.governorate}
                    </TableCell>
                    <TableCell className="font-medium">
                      {site.siteName}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {site.branch}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(site.status)}>
                        {site.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {site.upstream.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {site.downstream.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-blue-600 font-medium">
                      {site.flowRate.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {site.batteryVoltage.toFixed(1)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSiteClick(site.siteId);
                        }}
                      >
                        →
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
