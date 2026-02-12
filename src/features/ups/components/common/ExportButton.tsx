import React from 'react';
import type { ExportParams } from '../../types';

/**
 * Export button component
 * Will be implemented in later tasks
 */
interface ExportButtonProps {
  onExport: (params: ExportParams) => void;
  disabled?: boolean;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ 
  onExport, 
  disabled = false, 
  className = '' 
}) => {
  const handleExport = () => {
    // Default export parameters - will be configurable in later tasks
    const params: ExportParams = {
      type: 'pdf',
      scope: 'current-view',
      timeRange: { type: 'latest' },
    };
    onExport(params);
  };

  return (
    <button 
      className={`export-button ${className}`}
      onClick={handleExport}
      disabled={disabled}
    >
      Export Data
    </button>
  );
};