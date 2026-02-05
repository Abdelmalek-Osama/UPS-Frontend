import React from 'react';
import type { TimeSeriesData } from '../../types';

/**
 * Flow rate chart component for displaying flow rate data
 * Will be implemented with Recharts in later tasks
 */
interface FlowRateChartProps {
  data: TimeSeriesData[];
  title?: string;
  height?: number;
}

export const FlowRateChart: React.FC<FlowRateChartProps> = ({
  data,
  title = 'Flow Rate',
  height = 300,
}) => {
  return (
    <div className="flow-rate-chart" style={{ height }}>
      <h3>{title}</h3>
      <div className="chart-placeholder">
        <p>Flow Rate Chart</p>
        <p>Data points: {data.length}</p>
        <p>Shows flow rate over time</p>
      </div>
    </div>
  );
};