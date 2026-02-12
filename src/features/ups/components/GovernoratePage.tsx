import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { TimeFilterBar } from "./TimeFilterBar";
import { useGovernorateOverview } from "../hooks/useGovernorateOverview";
import { exportReport } from "../api/upsApi";
import type { DateRange, TimeFilter, SiteSummary } from "../types";
import type { CalculationOptions } from "./TimeFilterBar";

export function GovernoratePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const governorateId = params.governorateId || "minia";
  const [filter, setFilter] = useState<TimeFilter>("latest");
  const [range, setRange] = useState<DateRange>({});
  const [calculations, setCalculations] = useState<CalculationOptions>({
    levels: "average",
    battery: "average",
    flow: "sum"
  });
  const { data, governorateName } = useGovernorateOverview(governorateId, filter, range);

  // Handle export functionality
  const handleExport = async (format: "pdf" | "excel") => {
    try {
      await exportReport("governorate", format, filter, range, undefined, governorateId);
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

  // Get all sites sorted south to north for the regional chart
  const allSites = useMemo(() => {
    return data.branches.flatMap(branch => branch.sites)
      .sort((a, b) => a.position - b.position);
  }, [data.branches]);

  const handleSiteClick = (siteId: string) => {
    navigate(`/sites/${siteId}`);
  };

  const renderBranchTable = (sites: SiteSummary[], branchName: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{branchName} Branch</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Upstream (m)</TableHead>
              <TableHead>Downstream (m)</TableHead>
              <TableHead>Flow (m³/s)</TableHead>
              <TableHead>Battery (V)</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  {t("common.noData")}
                </TableCell>
              </TableRow>
            ) : (
              sites.map((site) => (
                <TableRow key={site.siteId} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium">{site.siteName}</TableCell>
                  <TableCell>
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
                  <TableCell>{site.upstream.toFixed(2)}</TableCell>
                  <TableCell>{site.downstream.toFixed(2)}</TableCell>
                  <TableCell className="text-blue-600 font-medium">{site.flowRate.toFixed(1)}</TableCell>
                  <TableCell>{site.batteryVoltage.toFixed(1)}</TableCell>
                  <TableCell>
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
  );

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
        <span className="font-medium text-gray-900">Governorate View</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{governorateName} Governorate</h1>
        <p className="text-gray-500 mt-1">
          {allSites.length} monitoring points across {orderedBranches.map(b => b.name).join(' & ')}
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

      {/* Regional Flow Profile Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-600">Regional Flow Profile (South to North)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-gray-50 border rounded p-4">
            <div className="flex items-end justify-between h-[250px] border-b border-l border-gray-300">
              {allSites.map((site) => {
                const upstreamHeight = (site.upstream / 16) * 200; // Scale to chart height
                const downstreamHeight = (site.downstream / 16) * 200;
                const flowHeight = (site.flowRate / 60) * 200; // Scale flow rate
                
                return (
                  <div key={site.siteId} className="flex flex-col items-center space-y-1 flex-1">
                    <div className="flex space-x-1">
                      <div 
                        className="w-4 bg-blue-500 rounded-t"
                        style={{ height: `${upstreamHeight}px` }}
                        title={`Upstream: ${site.upstream}m`}
                      ></div>
                      <div 
                        className="w-4 bg-red-500 rounded-t"
                        style={{ height: `${downstreamHeight}px` }}
                        title={`Downstream: ${site.downstream}m`}
                      ></div>
                      <div 
                        className="w-4 bg-cyan-400 rounded-t opacity-70"
                        style={{ height: `${flowHeight}px` }}
                        title={`Flow Rate: ${site.flowRate} m³/s`}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 text-center max-w-16 truncate">
                      {site.siteName.split(' ')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center mt-4 space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Upstream Level (m)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Downstream Level (m)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-cyan-400 rounded opacity-70"></div>
                <span>Flow Rate (m³/s)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branch Tables */}
      <div className="space-y-6">
        {orderedBranches.map((branch) => 
          renderBranchTable(branch.sites.sort((a, b) => a.position - b.position), branch.name)
        )}
      </div>
    </div>
  );
}
