/**
 * Alarm Site Selector Component
 * Reusable component for selecting a single site with an integrated dropdown
 * Used across all alarm configuration dialogs
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem
} from '../../../components/ui/select';
import { Site } from '../types';

interface AlarmSiteSelectorProps {
  sites: Site[];
  sitesLoading: boolean;
  selectedSiteId: number | null;
  onSiteSelect: (siteId: number | null) => void;
  placeholder?: string;
  allowClear?: boolean;
}

export const AlarmSiteSelector: React.FC<AlarmSiteSelectorProps> = ({
  sites,
  sitesLoading,
  selectedSiteId,
  onSiteSelect,
placeholder,
  allowClear = true,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label className="font-medium">
        {t('alarms.site')} <span className="text-red-500">*</span>
      </Label>
      <Select
  value={selectedSiteId?.toString() || ''}
        onValueChange={(value) => {
          onSiteSelect(value ? Number(value) : null);
     }}
        dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
   >
        <SelectTrigger className="w-full">
       <SelectValue placeholder={placeholder || t('alarms.selectSite')} />
  </SelectTrigger>
        <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'} className="max-h-48 overflow-y-auto">
    {sitesLoading ? (
       <div className="p-2 text-sm text-gray-500">{t('common.loadingData')}</div>
      ) : sites && sites.length > 0 ? (
            sites.map((site) => (
        <SelectItem key={site.id} value={site.id.toString()}>
     {t('_rtl') === 'rtl' ? site.arabicName || site.name : site.name}
           </SelectItem>
 ))
     ) : (
            <div className="p-2 text-sm text-gray-500">{t('sites.noSitesToShow')}</div>
        )}
   </SelectContent>
      </Select>
    </div>
  );
};

AlarmSiteSelector.displayName = 'AlarmSiteSelector';
