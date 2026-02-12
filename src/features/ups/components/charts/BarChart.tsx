import React from 'react';
import type { BarChartProps } from '../../types';

/**
 * Bar chart component for displaying comparative data
 * Will be implemented with Recharts in later tasks
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  xAxisKey,
  dataKeys,
  colors,
  title,
  height = 300,
  sortOrder = 'asc',
}) => {
  return (
    <div className="bar-chart" style={{ height }}>
      <h3>{title}</h3>
      <div className="chart-placeholder">
        <p>Bar Chart</p>
        <p>Data points: {data.length}</p>
        <p>X-axis: {xAxisKey}</p>
        <p>Series: {dataKeys.join(', ')}</p>
        <p>Sort: {sortOrder}</p>
      </div>
    </div>
  );
};