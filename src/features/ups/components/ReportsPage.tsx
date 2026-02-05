import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Trash2, Edit, Play, Pause } from "lucide-react";
import { TimeFilterBar } from "./TimeFilterBar";
import { useLandingOverview } from "../hooks/useLandingOverview";
import { useReports } from "../hooks/useReports";
import { exportFullData } from "../api/upsApi";
import type { DateRange, TimeFilter } from "../types";
import type { CalculationOptions } from "./TimeFilterBar";

export function ReportsPage() {
  const { t } = useTranslation();
  const { data: landingData } = useLandingOverview();
  const { reports, createReport } = useReports();

  const siteOptions = useMemo(() => landingData.sites, [landingData.sites]);

  // Scheduled report form state
  const [name, setName] = useState("");
  const [siteIds, setSiteIds] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [recipients, setRecipients] = useState("");
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");

  // Full data export state
  const [exportFilter, setExportFilter] = useState<TimeFilter>("24h");
  const [exportRange, setExportRange] = useState<DateRange>({});
  const [exportCalculations, setExportCalculations] = useState<CalculationOptions>({
    levels: "average",
    battery: "average",
    flow: "sum"
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleCreateReport = async () => {
    const parsedSiteIds = siteIds
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    const parsedRecipients = recipients
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (!name.trim()) return;

    await createReport({
      name: name.trim(),
      sites: parsedSiteIds.length ? parsedSiteIds : siteOptions.map((site) => site.siteId),
      timeRange: { type: exportFilter, startDate: exportRange.start, endDate: exportRange.end },
      frequency,
      recipients: parsedRecipients.length ? parsedRecipients : ["viewer@ups.local"],
      format,
      isActive: true,
    });

    // Reset form
    setName("");
    setSiteIds("");
    setRecipients("");
  };

  const handleFullDataExport = async (exportFormat: "pdf" | "excel") => {
    setIsExporting(true);
    try {
      const selectedSiteIds = siteIds
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0);

      await exportFullData(
        exportFormat,
        exportFilter,
        exportRange,
        selectedSiteIds.length > 0 ? selectedSiteIds : undefined
      );
    } catch (error) {
      console.error("Full data export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? t("common.active") : "Paused"}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">{t("ups.reports.title")}</h2>
        <p className="text-gray-500 mt-1">{t("ups.reports.subtitle")}</p>
      </div>

      {/* Full Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Full Data Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TimeFilterBar
            value={exportFilter}
            onChange={setExportFilter}
            range={exportRange}
            onRangeChange={setExportRange}
            calculations={exportCalculations}
            onCalculationsChange={setExportCalculations}
            showExport={false}
            showCalculations={exportFilter !== "latest"}
          />
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => handleFullDataExport("pdf")}
              disabled={isExporting}
              variant="outline"
            >
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>
            <Button 
              onClick={() => handleFullDataExport("excel")}
              disabled={isExporting}
              variant="outline"
            >
              {isExporting ? "Exporting..." : "Export Excel"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>{t("ups.reports.scheduleTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="report-name">{t("ups.reports.name")}</Label>
            <Input
              id="report-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("ups.reports.namePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sites">{t("ups.reports.sites")}</Label>
            <Input
              id="sites"
              value={siteIds}
              onChange={(event) => setSiteIds(event.target.value)}
              placeholder={t("ups.reports.sitesPlaceholder")}
            />
            <p className="text-xs text-gray-500">{t("ups.reports.sitesHint")}</p>
          </div>

          <div className="space-y-2">
            <Label>{t("ups.reports.frequency")}</Label>
            <Select value={frequency} onValueChange={(value) => setFrequency(value as "daily" | "weekly" | "monthly")}>
              <SelectTrigger>
                <SelectValue placeholder={t("ups.reports.frequency")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{t("ups.reports.daily")}</SelectItem>
                <SelectItem value="weekly">{t("ups.reports.weekly")}</SelectItem>
                <SelectItem value="monthly">{t("ups.reports.monthly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipients">{t("ups.reports.recipients")}</Label>
            <Input
              id="recipients"
              value={recipients}
              onChange={(event) => setRecipients(event.target.value)}
              placeholder={t("ups.reports.recipientsPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("ups.reports.format")}</Label>
            <Select value={format} onValueChange={(value) => setFormat(value as "pdf" | "excel")}>
              <SelectTrigger>
                <SelectValue placeholder={t("ups.reports.format")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">{t("ups.reports.pdf")}</SelectItem>
                <SelectItem value="excel">{t("ups.reports.excel")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={handleCreateReport}>{t("ups.reports.create")}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("ups.reports.scheduledList")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("ups.reports.name")}</TableHead>
                <TableHead>{t("ups.reports.sites")}</TableHead>
                <TableHead>{t("ups.reports.frequency")}</TableHead>
                <TableHead>{t("ups.reports.recipients")}</TableHead>
                <TableHead>{t("ups.reports.nextRun")}</TableHead>
                <TableHead>{t("ups.reports.format")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    {t("common.noData")}
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{report.sites.join(", ")}</TableCell>
                    <TableCell>{t(`ups.reports.${report.frequency}`)}</TableCell>
                    <TableCell>{report.recipients.join(", ")}</TableCell>
                    <TableCell>{new Date(report.nextRun).toLocaleString()}</TableCell>
                    <TableCell>{report.format.toUpperCase()}</TableCell>
                    <TableCell>{getStatusBadge(report.isActive)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          {report.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
