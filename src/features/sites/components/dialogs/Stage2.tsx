import { Site, DataLoggerType } from '../../types';
import { useTranslation } from 'react-i18next';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Checkbox } from '../../../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { useMemo, useEffect } from 'react';
import {
  getCanalOptions,
  getDirectorateOptions,
  getDataLoggerTypeOptions,
} from '../../constants';

interface TabProps {
  data: Partial<Site>;
  onChange: (field: string, value: any) => void;
  isOpen: boolean;
  onClose: () => void;
  onValidationChange?: (isValid: boolean) => void;
}

export default function Stage2({ data, onChange, onValidationChange }: TabProps) {
  const { t } = useTranslation();
  const dir = t('_rtl') === 'rtl' ? 'rtl' : 'ltr';

  const siteType = data.siteType as string | undefined;

  // Calculate validation state and error message
  const { isValid, errorMessage } = useMemo(() => {
    // Site type is required
    if (!siteType) {
      return { isValid: false, errorMessage: null };
    }

    // For Water Level sites
    if (siteType === 'WaterLevel') {
      const hasAtLeastOneOption = data.hasUS || data.hasDS1;
      if (!hasAtLeastOneOption) {
        return { 
          isValid: false, 
          errorMessage: t('sites.stage2.waterLevelNoOptions') 
        };
      }
    }

    // For Pump stations
    if (siteType === 'Pumps') {
      const numPumps = data.numPumps || 0;
      const hasAtLeastOneOption = data.hasUS || data.hasDS1;

      if (numPumps <= 0) {
        return { 
          isValid: false, 
          errorMessage: t('sites.stage2.pumpsMissingPumpsCount') 
        };
      }

      if (!hasAtLeastOneOption) {
        return { 
          isValid: false, 
          errorMessage: t('sites.stage2.pumpsNoOptions') 
        };
      }
    }

    return { isValid: true, errorMessage: null };
  }, [siteType, data.hasUS, data.hasDS1, data.numPumps, t]);

  // Call the validation change callback whenever validation state changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  return (
    <div className="space-y-3 flex flex-col h-full">
      {/* Site Type Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="siteType">{t('sites.stage2.siteTypeLabel')}</Label>
        <Select
          value={siteType || ''}
          onValueChange={(value) => onChange('siteType', value)}
          dir={dir}
        >
          <SelectTrigger
            id="siteType"
            className={dir === 'rtl' ? 'rtl:flex-row-reverse text-right' : 'text-left'}
          >
            <SelectValue placeholder={t('sites.stage2.siteTypePlaceholder')} />
          </SelectTrigger>
          <SelectContent dir={dir}>
            <SelectItem value="WaterLevel">
              {t('sites.stage2.waterLevelOption')}
            </SelectItem>
            <SelectItem value="Pumps">
              {t('sites.stage2.pumpStationOption')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* USWL Checkbox */}
      {siteType && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasUS"
            checked={data.hasUS === true || false}
            onCheckedChange={(checked: boolean) => onChange('hasUS', checked)}
          />
          <Label htmlFor="hasUS" className="font-normal cursor-pointer">
            {t('sites.stage2.usWaterLevelLabel')}
          </Label>
        </div>
      )}

      {/* DSWL Checkbox */}
      {siteType && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasDS1"
            checked={data.hasDS1 === true || false}
            onCheckedChange={(checked: boolean) => onChange('hasDS1', checked)}
          />
          <Label htmlFor="hasDS1" className="font-normal cursor-pointer">
            {t('sites.stage2.downstreamWaterLevelLabel')}
          </Label>
        </div>
      )}

      {/* NumPumps Field - Only for Pump Station */}
      {siteType === 'Pumps' && (
        <div className="space-y-2">
          <Label htmlFor="numPumps">{t('sites.stage2.numPumpsLabel')}</Label>
          <Input
            id="numPumps"
            type="number"
            min="0"
            max="10"
            placeholder={t('sites.stage2.numPumpsPlaceholder')}
            value={data.numPumps || ''}
            onChange={(e) => onChange('numPumps', parseInt(e.target.value) || 0)}
            className={dir === 'rtl' ? 'text-right' : 'text-left'}
          />
        </div>
      )}

      {/* Error Message - Bottom */}
      {errorMessage && (
        <div className="mt-auto p-3 bg-red-50 rounded-md">
          <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
