import React from 'react';
import type { TimeSeriesData } from '../../types';

/**
 * Battery chart component for displaying battery charge/discharge patterns
 * Will be implemented with Recharts in later tasks
 */
interface BatteryChartProps {
  data: TimeSeriesData[];
  title?: string;
  height?: number;
}

export const BatteryChart: React.FC<BatteryChartProps> = ({
  data,
  title = 'Battery Voltage',
  height = 300,
}) => {
  return (
    <div className="battery-chart" style={{ height }}>
      <h3>{title}</h3>
      <div className="chart-placeholder">
        <p>Battery Chart</p>
        <p>Data points: {data.length}</p>
        <p>Shows charge/discharge patterns over time</p>
      </div>
    </div>
  );
};