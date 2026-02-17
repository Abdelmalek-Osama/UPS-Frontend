import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { DatePicker } from "../../../components/ui/datepicker";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type { DateRange, TimeFilter } from "../types";

export type CalculationType = "average" | "sum" | "max" | "min";

export interface CalculationOptions {
  levels: CalculationType; // For upstream/downstream
  flow: CalculationType; // For flow rate
}

interface TimeFilterBarProps {
  value: TimeFilter;
  onChange: (value: TimeFilter) => void;
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
  calculations?: CalculationOptions;
  onCalculationsChange?: (calculations: CalculationOptions) => void;
  onExport?: (format: "pdf" | "excel") => void;
  showExport?: boolean;
  showCalculations?: boolean;
  showLatestOption?: boolean;
}

export function TimeFilterBar({
  value,
  onChange,
  range,
  onRangeChange,
  calculations,
  onCalculationsChange,
  onExport,
  showExport = true,
  showCalculations = false,
  showLatestOption = false,
}: TimeFilterBarProps) {
  const { t } = useTranslation();
  const [format, setFormat] = React.useState<"pdf" | "excel">("pdf");

  // Default calculation options
  const getDefaultCalculations = (): CalculationOptions => {
    // All filters now use aggregated data
    return { levels: "average", flow: "sum" };
  };

  const currentCalculations = calculations || getDefaultCalculations();
  const showPeriodCalculations = showCalculations;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={value} onValueChange={(nextValue) => onChange(nextValue as TimeFilter)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("ups.filters.selectTime")} />
            </SelectTrigger>
            <SelectContent>
              {showLatestOption && <SelectItem value="latest">{t("ups.filters.latest")}</SelectItem>}
              <SelectItem value="24h">{t("ups.filters.last24h")}</SelectItem>
              <SelectItem value="specific">{t("ups.filters.specific")}</SelectItem>
              <SelectItem value="week">{t("ups.filters.week")}</SelectItem>
              <SelectItem value="month">{t("ups.filters.month")}</SelectItem>
              <SelectItem value="custom">{t("ups.filters.custom")}</SelectItem>
            </SelectContent>
          </Select>

          {value === "specific" && (
            <div className="flex flex-wrap items-center gap-2">
              <DatePicker
                placeholder={t("ups.filters.selectDate")}
                value={range.targetDate}
                onChange={(date) => onRangeChange({ ...range, targetDate: date })}
              />
              <Input
                type="time"
                value={range.targetTime || ""}
                onChange={(e) => onRangeChange({ ...range, targetTime: e.target.value })}
                className="w-32"
                required
              />
            </div>
          )}

          {value === "custom" && (
            <div className="flex flex-wrap items-center gap-2">
              <DatePicker
                placeholder={t("ups.filters.startDate")}
                value={range.start}
                onChange={(date) => onRangeChange({ ...range, start: date })}
              />
              <Input
                type="time"
                value={range.startTime || ""}
                onChange={(e) => onRangeChange({ ...range, startTime: e.target.value })}
                className="w-32"
                required
              />
              <span className="text-gray-500">to</span>
              <DatePicker
                placeholder={t("ups.filters.endDate")}
                value={range.end}
                minDate={range.start}
                onChange={(date) => onRangeChange({ ...range, end: date })}
              />
              <Input
                type="time"
                value={range.endTime || ""}
                onChange={(e) => onRangeChange({ ...range, endTime: e.target.value })}
                className="w-32"
                required
              />
            </div>
          )}

          {/* Time period description */}
          {value !== "custom" && value !== "specific" && (
            <Badge variant="secondary" className="text-xs">
              {value === "latest" && t("ups.filters.latestReading")}
              {value === "24h" && t("ups.filters.last24h")}
              {value === "week" && t("ups.filters.last7Days")}
              {value === "month" && t("ups.filters.last30Days")}
            </Badge>
          )}
        </div>

        {showExport && (
          <div className="flex items-center gap-2">
            <Select value={format} onValueChange={(nextValue) => setFormat(nextValue as "pdf" | "excel")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("ups.reports.format")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">{t("ups.reports.pdf")}</SelectItem>
                <SelectItem value="excel">{t("ups.reports.excel")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => onExport?.(format)}>
              {t("common.export")}
            </Button>
          </div>
        )}
      </div>

      {/* Calculation Options for periods > 24h */}
      {showPeriodCalculations && onCalculationsChange && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium mb-3">{t("ups.calculations.title")}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">
                {t("ups.calculations.levels")}
              </label>
              <Select
                value={currentCalculations.levels}
                onValueChange={(calc) =>
                  onCalculationsChange({ ...currentCalculations, levels: calc as CalculationType })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="average">{t("ups.calculations.average")}</SelectItem>
                  <SelectItem value="max">{t("ups.calculations.max")}</SelectItem>
                  <SelectItem value="min">{t("ups.calculations.min")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">
                {t("ups.calculations.flow")}
              </label>
              <Select
                value={currentCalculations.flow}
                onValueChange={(calc) =>
                  onCalculationsChange({ ...currentCalculations, flow: calc as CalculationType })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">{t("ups.calculations.sum")}</SelectItem>
                  <SelectItem value="average">{t("ups.calculations.average")}</SelectItem>
                  <SelectItem value="max">{t("ups.calculations.max")}</SelectItem>
                  <SelectItem value="min">{t("ups.calculations.min")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t("ups.calculations.description")}
          </p>
        </div>
      )}
    </div>
  );
}
