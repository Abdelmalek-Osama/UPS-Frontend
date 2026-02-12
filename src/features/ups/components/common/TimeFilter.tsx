import React from 'react';
import type { TimeFilterProps } from '../../types';

/**
 * Time filter component for selecting data time ranges
 * Will be implemented in later tasks
 */
export const TimeFilter: React.FC<TimeFilterProps> = ({ value, onChange, options }) => {
  return (
    <div className="time-filter">
      <label htmlFor="time-filter-select">Time Range:</label>
      <select 
        id="time-filter-select"
        value={value.type}
        onChange={(e) => onChange({ ...value, type: e.target.value as any })}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};