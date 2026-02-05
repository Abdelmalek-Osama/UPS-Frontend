import React from 'react';
import type { TimeSeriesChartProps } from '../../types';

/**
 * Time series chart component for displaying data over time
 * Will be implemented with Recharts in later tasks
 */
export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  dataKeys,
  colors,
  title,
  yAxisLabel,
  height = 300,
}) => {
  return (
    <div className="time-series-chart" style={{ height }}>
      <h3>{title}</h3>
      <div className="chart-placeholder">
        <p>Time Series Chart</p>
        <p>Data points: {data.length}</p>
        <p>Y-axis: {yAxisLabel}</p>
        <p>Series: {dataKeys.join(', ')}</p>
      </div>
    </div>
  );
};