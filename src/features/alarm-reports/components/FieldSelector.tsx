/**
 * Field Selector Component
 * Multi-select checklist for alarm event fields
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { Button } from '../../../components/ui/button';
import type { AvailableField } from '../types';
import { AVAILABLE_FIELDS } from '../types';

interface FieldSelectorProps {
  selectedFields: string[];
  setSelectedFields: (fields: string[]) => void;
}

export function FieldSelector({
  selectedFields,
  setSelectedFields,
}: FieldSelectorProps) {
  const { t } = useTranslation();

  const handleToggleField = (field: AvailableField) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  const handleSelectAll = () => {
    if (selectedFields.length === AVAILABLE_FIELDS.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields([...AVAILABLE_FIELDS]);
    }
  };

  const fieldLabels: Record<AvailableField, string> = {
    'Id': t('alarmReports.fieldId'),
    'AlarmId': t('alarmReports.fieldAlarmId'),
    'AlarmName': t('alarmReports.fieldAlarmName'),
    'SiteId': t('alarmReports.fieldSiteId'),
    'SiteName': t('alarmReports.fieldSiteName'),
    'WaterLevelReadingId': t('alarmReports.fieldWaterLevelReadingId'),
    'PumpStationReadingId': t('alarmReports.fieldPumpStationReadingId'),
    'FieldName': t('alarmReports.fieldName'),
    'ActualValue': t('alarmReports.fieldActualValue'),
    'ThresholdValue': t('alarmReports.fieldThresholdValue'),
    'TriggeredAt': t('alarmReports.fieldTriggeredAt'),
    'Severity': t('alarmReports.fieldSeverity'),
    'ColorCode': t('alarmReports.fieldColorCode'),
    'Message': t('alarmReports.fieldMessage'),
    'IsResolved': t('alarmReports.fieldIsResolved')
  };

  return (
    <div className="space-y-4">
  <div>
        <Label className="font-medium">{t('alarmReports.selectedFields')}</Label>
        <p className="text-xs text-gray-500 mt-1">{t('alarmReports.selectedFieldsDescription')}</p>
      </div>

      {/* Select All / Clear All */}
      <div className="flex gap-2">
        <Button
          type="button"
  variant="outline"
          size="sm"
  onClick={handleSelectAll}
          className="text-xs"
        >
          {selectedFields.length === AVAILABLE_FIELDS.length
    ? t('alarmReports.clearAll')
   : t('alarmReports.selectAll')}
 </Button>
    <span className="text-xs text-gray-500 self-center">
          {selectedFields.length}/{AVAILABLE_FIELDS.length}
</span>
      </div>

      {/* Field Checkboxes Grid */}
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
        {AVAILABLE_FIELDS.map((field) => (
          <label
         key={field}
  className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
    >
     <Checkbox
    checked={selectedFields.includes(field)}
       onCheckedChange={() => handleToggleField(field)}
   id={`field-${field}`}
          />
       <span className="text-sm text-gray-700 truncate">{fieldLabels[field]}</span>
          </label>
        ))}
      </div>

      {selectedFields.length === 0 && (
        <p className="text-sm text-red-500 text-center py-2">
  {t('alarmReports.atLeastOneFieldRequired')}
        </p>
      )}

      {/* Selected Fields Summary */}
      {selectedFields.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-xs text-gray-600 mb-2">{t('alarmReports.selectedFieldsSummary')}:</p>
    <div className="flex flex-wrap gap-1">
            {selectedFields.map((field) => (
       <span
key={field}
        className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
            >
         {fieldLabels[field as AvailableField]}
     </span>
      ))}
          </div>
      </div>
      )}
    </div>
  );
}
