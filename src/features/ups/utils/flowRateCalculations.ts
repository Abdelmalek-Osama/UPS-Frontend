import type { WaterLevelReading } from "../api/upsApi";

export interface FlowRateCalculationResult {
  totalFlowRate: number;
  readingsCount: number;
  timeWindowStart: Date;
  timeWindowEnd: Date;
}

/**
 * Calculate total flow rate from water level readings for yesterday only.
 * 
 * Formula: totalFlowRate = SUM(calculatedFlow) * 3600
 * 
 * @param readings - Array of water level readings
 * @returns Calculation result with total flow rate and metadata
 */
export function calculateTotalFlowRate(
  readings: WaterLevelReading[]
): FlowRateCalculationResult {
  const now = new Date();
  
  // Calculate yesterday's date range (00:00 to 23:59)
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(23, 59, 59, 999);

  // Filter readings to yesterday only
  const filteredReadings = readings.filter(reading => {
    const readingTime = new Date(reading.timestamp);
    return readingTime >= yesterday && readingTime <= yesterdayEnd;
  });

  // Calculate sum of calculatedFlow values
  const sumFlow = filteredReadings.reduce(
    (sum, reading) => sum + reading.calculatedFlow,
    0
  );

  // Apply formula: SUM(calculatedFlow) * 3600
  const totalFlowRate = sumFlow * 3600;

  return {
    totalFlowRate,
    readingsCount: filteredReadings.length,
    timeWindowStart: yesterday,
    timeWindowEnd: yesterdayEnd,
  };
}
