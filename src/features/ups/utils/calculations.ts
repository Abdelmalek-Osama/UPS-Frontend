import type { SiteReading, TimeSeriesPoint } from "../types";
import type { CalculationType, CalculationOptions } from "../components/TimeFilterBar";

/**
 * Calculation utilities for UPS Dashboard data aggregation
 */

export interface AggregatedReading {
  timestamp: string;
  upstream: number;
  downstream: number;
  batteryVoltage: number;
  flowRate: number;
}

/**
 * Apply calculation method to an array of numbers
 */
export const applyCalculation = (values: number[], method: CalculationType): number => {
  if (values.length === 0) return 0;
  
  switch (method) {
    case "average":
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    case "sum":
      return values.reduce((sum, val) => sum + val, 0);
    case "max":
      return Math.max(...values);
    case "min":
      return Math.min(...values);
    default:
      return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
};

/**
 * Group readings by time period (hour, day, etc.)
 */
export const groupReadingsByPeriod = (
  readings: SiteReading[],
  periodType: "hour" | "day" | "week" | "month"
): Map<string, SiteReading[]> => {
  const groups = new Map<string, SiteReading[]>();
  
  readings.forEach(reading => {
    let key: string;
    const date = new Date(reading.timestamp);
    
    switch (periodType) {
      case "hour":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        break;
      case "day":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        break;
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
        break;
      case "month":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString();
    }
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(reading);
  });
  
  return groups;
};

/**
 * Aggregate readings using specified calculation methods
 */
export const aggregateReadings = (
  readings: SiteReading[],
  calculations: CalculationOptions,
  periodType: "hour" | "day" | "week" | "month" = "day"
): AggregatedReading[] => {
  if (readings.length === 0) return [];
  
  const groups = groupReadingsByPeriod(readings, periodType);
  const aggregated: AggregatedReading[] = [];
  
  // Sort groups by timestamp
  const sortedKeys = Array.from(groups.keys()).sort();
  
  sortedKeys.forEach(key => {
    const groupReadings = groups.get(key)!;
    
    const upstream = applyCalculation(
      groupReadings.map(r => r.upstream),
      calculations.levels
    );
    
    const downstream = applyCalculation(
      groupReadings.map(r => r.downstream),
      calculations.levels
    );
    
    const batteryVoltage = applyCalculation(
      groupReadings.map(r => r.batteryVoltage),
      calculations.battery
    );
    
    const flowRate = applyCalculation(
      groupReadings.map(r => r.flowRate),
      calculations.flow
    );
    
    aggregated.push({
      timestamp: key,
      upstream: Math.round(upstream * 100) / 100,
      downstream: Math.round(downstream * 100) / 100,
      batteryVoltage: Math.round(batteryVoltage * 100) / 100,
      flowRate: Math.round(flowRate * 100) / 100,
    });
  });
  
  return aggregated;
};

/**
 * Convert time series points using calculation methods
 */
export const aggregateTimeSeriesPoints = (
  points: TimeSeriesPoint[],
  calculations: CalculationOptions,
  periodType: "hour" | "day" | "week" | "month" = "day"
): TimeSeriesPoint[] => {
  if (points.length === 0) return [];
  
  // Convert to SiteReading format for processing
  const readings: SiteReading[] = points.map(point => ({
    timestamp: new Date(point.timestamp),
    upstream: point.upstream,
    downstream: point.downstream,
    batteryVoltage: point.batteryVoltage,
    flowRate: point.flowRate,
    status: "normal" as const,
  }));
  
  const aggregated = aggregateReadings(readings, calculations, periodType);
  
  // Convert back to TimeSeriesPoint format
  return aggregated.map(reading => ({
    timestamp: reading.timestamp,
    upstream: reading.upstream,
    downstream: reading.downstream,
    batteryVoltage: reading.batteryVoltage,
    flowRate: reading.flowRate,
  }));
};

/**
 * Get appropriate period type based on time filter
 */
export const getPeriodType = (timeFilter: string): "hour" | "day" | "week" | "month" => {
  switch (timeFilter) {
    case "latest":
      return "hour";
    case "24h":
      return "hour";
    case "week":
      return "day";
    case "month":
      return "day";
    case "custom":
      return "day"; // Default for custom ranges
    default:
      return "day";
  }
};

/**
 * Calculate summary statistics for a set of readings
 */
export const calculateSummaryStats = (readings: SiteReading[]) => {
  if (readings.length === 0) {
    return {
      avgUpstream: 0,
      avgDownstream: 0,
      avgBatteryVoltage: 0,
      totalFlowRate: 0,
      maxUpstream: 0,
      minUpstream: 0,
      maxDownstream: 0,
      minDownstream: 0,
      readingCount: 0,
    };
  }
  
  const upstreamValues = readings.map(r => r.upstream);
  const downstreamValues = readings.map(r => r.downstream);
  const batteryValues = readings.map(r => r.batteryVoltage);
  const flowValues = readings.map(r => r.flowRate);
  
  return {
    avgUpstream: applyCalculation(upstreamValues, "average"),
    avgDownstream: applyCalculation(downstreamValues, "average"),
    avgBatteryVoltage: applyCalculation(batteryValues, "average"),
    totalFlowRate: applyCalculation(flowValues, "sum"),
    maxUpstream: applyCalculation(upstreamValues, "max"),
    minUpstream: applyCalculation(upstreamValues, "min"),
    maxDownstream: applyCalculation(downstreamValues, "max"),
    minDownstream: applyCalculation(downstreamValues, "min"),
    readingCount: readings.length,
  };
};