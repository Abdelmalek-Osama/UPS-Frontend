import { useState, useEffect } from 'react';
import { Site, DataLoggerType } from '../../types';
import { useTranslation } from 'react-i18next';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import {
  getCanalOptions,
  getDataLoggerTypeOptions,
} from '../../constants';
import { useDirectorates } from '../../hooks/useDirectorates';

interface TabProps {
  data: Partial<Site>;
  onChange: (field: string, value: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Validation functions
const isArabicOnly = (text: string): boolean => {
  return /^[\u0600-\u06FF\s]*$/.test(text);
};

const isEnglishOnly = (text: string): boolean => {
  return /^[a-zA-Z0-9\s]*$/.test(text);
};

export default function Stage1({ data, onChange, isOpen }: TabProps) {
  const { t } = useTranslation();
  const dir = t('_rtl') === 'rtl' ? 'rtl' : 'ltr';

  const canalOptions = getCanalOptions();
  const dataLoggerTypeOptions = getDataLoggerTypeOptions();
  const { directorates, isLoading: isLoadingDirectorates } = useDirectorates();

  const handleArabicNameChange = (value: string) => {
    onChange('arabicName', value);
  };

  const handleEnglishNameChange = (value: string) => {
    onChange('nameEn', value);
  };

  return (
    <div className="space-y-3">
      {/* Site Name Fields - Arabic and English side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nameAr">{t('sites.stage1.arabicNameLabel')}</Label>
          <Input
            id="nameAr"
            placeholder={t('sites.stage1.arabicNamePlaceholder')}
            value={data.arabicName || ''}
            onChange={(e) => handleArabicNameChange(e.target.value)}
            className={dir === 'rtl' ? 'text-right' : 'text-left'}
            dir="rtl"
          />
          {data.arabicName && !isArabicOnly(data.arabicName) && (
            <p className="text-sm text-red-600">{t('sites.stage1.arabicOnlyError')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nameEn">{t('sites.stage1.englishNameLabel')}</Label>
          <Input
            id="nameEn"
            placeholder={t('sites.stage1.englishNamePlaceholder')}
            value={data.name || ''}
            onChange={(e) => handleEnglishNameChange(e.target.value)}
            className={dir === 'rtl' ? 'text-right' : 'text-left'}
            dir="ltr"
          />
          {data.name && !isEnglishOnly(data.name) && (
            <p className="text-sm text-red-600">{t('sites.stage1.englishOnlyError')}</p>
          )}
        </div>
      </div>

      {/* Code Field */}
      <div className="space-y-2">
        <Label htmlFor="code">{t('sites.stage1.codeLabel')}</Label>
        <Input
          id="code"
          placeholder={t('sites.stage1.codePlaceholder')}
          value={data.code || ''}
          onChange={(e) => onChange('code', e.target.value)}
          className={dir === 'rtl' ? 'text-right' : 'text-left'}
        />
      </div>

      {/* Location Field */}
      <div className="space-y-2">
        <Label htmlFor="location">{t('sites.stage1.locationLabel')}</Label>
        <Input
          id="location"
          placeholder={t('sites.stage1.locationPlaceholder')}
          value={data.location || ''}
          onChange={(e) => onChange('location', e.target.value)}
          className={dir === 'rtl' ? 'text-right' : 'text-left'}
        />
      </div>

      {/* Canal Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="canal">{t('sites.stage1.canalLabel')}</Label>
        <Select
          value={data.canal || ''}
          onValueChange={(value) => onChange('canal', value)}
          dir={dir}
        >
          <SelectTrigger
            id="canal"
            className={dir === 'rtl' ? 'rtl:flex-row-reverse text-right' : 'text-left'}
          >
            <SelectValue placeholder={t('sites.stage1.canalPlaceholder')} />
          </SelectTrigger>
          <SelectContent dir={dir}>
            {canalOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Directorate Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="directorateId">
          {t('sites.stage1.directorateNameLabel')}
        </Label>
        <Select
          value={data.directorateId?.toString() || ''}
          onValueChange={(value) => onChange('directorateId', parseInt(value))}
          dir={dir}
          disabled={isLoadingDirectorates}
        >
          <SelectTrigger
            id="directorateId"
            className={dir === 'rtl' ? 'rtl:flex-row-reverse text-right' : 'text-left'}
          >
            <SelectValue
              placeholder={
                isLoadingDirectorates
                  ? t('common.loading')
                  : t('sites.stage1.directorateNamePlaceholder')
              }
            />
          </SelectTrigger>
          <SelectContent dir={dir}>
            {directorates.map((directorate) => (
              <SelectItem key={directorate.id} value={directorate.id.toString()}>
                {dir === 'rtl' ? directorate.arabicName : directorate.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Data Logger Type Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="dataLoggerType">
          {t('sites.stage1.dataLoggerTypeLabel')}
        </Label>
        <Select
          value={data.dataLoggerType || ''}
          onValueChange={(value) => onChange('dataLoggerType', value as DataLoggerType)}
          dir={dir}
        >
          <SelectTrigger
            id="dataLoggerType"
            className={dir === 'rtl' ? 'rtl:flex-row-reverse text-right' : 'text-left'}
          >
            <SelectValue
              placeholder={t('sites.stage1.dataLoggerTypePlaceholder')}
            />
          </SelectTrigger>
          <SelectContent dir={dir}>
            {dataLoggerTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SIM ID Field */}
      <div className="space-y-2">
        <Label htmlFor="simId">{t('sites.stage1.simIdLabel')}</Label>
        <Input
          id="simId"
          placeholder={t('sites.stage1.simIdPlaceholder')}
          value={data.simId || ''}
          onChange={(e) => onChange('simId', e.target.value)}
          className={dir === 'rtl' ? 'text-right' : 'text-left'}
        />
      </div>
    </div>
  );
}
