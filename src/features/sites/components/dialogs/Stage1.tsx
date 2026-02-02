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
  onValidationChange?: (isValid: boolean) => void;
}

// Validation functions
const isArabicOnly = (text: string): boolean => {
  return /^[\u0600-\u06FF\s]*$/.test(text);
};

const isEnglishOnly = (text: string): boolean => {
  return /^[a-zA-Z0-9\s]*$/.test(text);
};

// Arabic name validation - accepts Arabic chars and special characters
const isValidArabicName = (text: string): boolean => {
  // Pattern: Arabic characters (U+0600 to U+06FF) or common special characters/punctuation
  // Allows: Arabic letters, diacritics, numbers, spaces, and special chars like -, (, ), etc.
  return /^[\u0600-\u06FF\u0660-\u0669\s\-().,;:\/]*$/.test(text);
};

// English name validation - accepts English chars and special characters
// Only rejects Arabic characters
const isValidEnglishName = (text: string): boolean => {
  // Reject if contains Arabic characters
  return !/[\u0600-\u06FF]/.test(text);
};

const getArabicNameErrors = (value: string, t: any): string[] => {
  const errors: string[] = [];
  
  // Check if required
  if (!value || value.trim().length === 0) {
    errors.push(t('sites.stage1.arabicNameRequired'));
    return errors;
  }
  
  // Check for leading/trailing spaces
  if (value !== value.trim()) {
    errors.push(t('sites.stage1.arabicNameLeadingTrailingSpaces'));
  }
  
  // Check minimum length (after trimming)
  if (value.trim().length < 2) {
    errors.push(t('sites.stage1.arabicNameMinLength'));
  }
  
  // Check if starts with a number
  if (/^[0-9]/.test(value.trim())) {
    errors.push(t('sites.stage1.arabicNameCannotStartWithNumber'));
  }
  
  // Check valid characters
  if (!isValidArabicName(value)) {
    errors.push(t('sites.stage1.arabicNameInvalidCharacters'));
  }
  
  return errors;
};

const getEnglishNameErrors = (value: string, t: any): string[] => {
  const errors: string[] = [];
  
  // Check if required
  if (!value || value.trim().length === 0) {
    errors.push(t('sites.stage1.englishNameRequired'));
    return errors;
  }
  
  // Check for leading/trailing spaces
  if (value !== value.trim()) {
    errors.push(t('sites.stage1.englishNameLeadingTrailingSpaces'));
  }
  
  // Check minimum length (after trimming)
  if (value.trim().length < 2) {
    errors.push(t('sites.stage1.englishNameMinLength'));
  }
  
  // Check if starts with a number
  if (/^[0-9]/.test(value.trim())) {
    errors.push(t('sites.stage1.englishNameCannotStartWithNumber'));
  }
  
  // Check valid characters
  if (!isValidEnglishName(value)) {
    errors.push(t('sites.stage1.englishNameInvalidCharacters'));
  }
  
  return errors;
};

const getSiteCodeErrors = (value: string, t: any): string[] => {
  const errors: string[] = [];
  
  // Check if required
  if (!value || value.trim().length === 0) {
    errors.push(t('sites.stage1.siteCodeRequired'));
    return errors;
  }
  
  // Check for leading/trailing spaces
  if (value !== value.trim()) {
    errors.push(t('sites.stage1.siteCodeLeadingTrailingSpaces'));
  }
  
  // Check if contains only numbers
  if (!/^\d+$/.test(value.trim())) {
    errors.push(t('sites.stage1.siteCodeOnlyNumbers'));
  }
  
  return errors;
};

const getSIMIdErrors = (value: string, t: any): string[] => {
  const errors: string[] = [];
  
  // Check if required
  if (!value || value.trim().length === 0) {
    errors.push(t('sites.stage1.simIdRequired'));
    return errors;
  }
  
  // Check for leading/trailing spaces
  if (value !== value.trim()) {
    errors.push(t('sites.stage1.simIdLeadingTrailingSpaces'));
  }
  
  return errors;
};

const getCanalErrors = (value: string, t: any): string[] => {
  const errors: string[] = [];
  
  // Check if required
  if (!value || value.trim().length === 0) {
    errors.push(t('sites.stage1.canalRequired'));
  }
  
  return errors;
};

const getDirectorateErrors = (value: string, t: any): string[] => {
  const errors: string[] = [];
  
  // Check if required
  if (!value || value.trim().length === 0) {
    errors.push(t('sites.stage1.directorateRequired'));
  }
  
  return errors;
};

const getDataLoggerTypeErrors = (value: string, t: any): string[] => {
  const errors: string[] = [];
  
  // Check if required
  if (!value || value.trim().length === 0) {
    errors.push(t('sites.stage1.dataLoggerTypeRequired'));
  }
  
  return errors;
};

export default function Stage1({ data, onChange, isOpen, onValidationChange }: TabProps) {
  const { t } = useTranslation();
  const dir = t('_rtl') === 'rtl' ? 'rtl' : 'ltr';
  const [arabicNameTouched, setArabicNameTouched] = useState(false);
  const [englishNameTouched, setEnglishNameTouched] = useState(false);
  const [siteCodeTouched, setSiteCodeTouched] = useState(false);
  const [simIdTouched, setSimIdTouched] = useState(false);
  const [canalTouched, setCanalTouched] = useState(false);
  const [directorateTouched, setDirectorateTouched] = useState(false);
  const [dataLoggerTypeTouched, setDataLoggerTypeTouched] = useState(false);

  const canalOptions = getCanalOptions();
  const dataLoggerTypeOptions = getDataLoggerTypeOptions();
  const { directorates, isLoading: isLoadingDirectorates } = useDirectorates();

  // Notify parent of validation status whenever data changes
  useEffect(() => {
    if (onValidationChange) {
      const isStage1ValidStatus = isStage1Valid();
      onValidationChange(isStage1ValidStatus);
    }
  }, [data, onValidationChange, t]);

  const handleArabicNameChange = (value: string) => {
    onChange('arabicName', value);
  };

  const handleArabicNameBlur = () => {
    setArabicNameTouched(true);
  };

  const getArabicNameErrorsList = (): string[] => {
    if (!arabicNameTouched) return [];
    return getArabicNameErrors(data.arabicName || '', t);
  };

  const handleEnglishNameChange = (value: string) => {
    onChange('name', value);
  };

  const handleEnglishNameBlur = () => {
    setEnglishNameTouched(true);
  };

  const getEnglishNameErrorsList = (): string[] => {
    if (!englishNameTouched) return [];
    return getEnglishNameErrors(data.name || '', t);
  };

  const handleSiteCodeChange = (value: string) => {
    onChange('code', value);
  };

  const handleSiteCodeBlur = () => {
    setSiteCodeTouched(true);
  };

  const getSiteCodeErrorsList = (): string[] => {
    if (!siteCodeTouched) return [];
    return getSiteCodeErrors(data.code || '', t);
  };

  const handleSIMIdChange = (value: string) => {
    onChange('simId', value);
  };

  const handleSIMIdBlur = () => {
    setSimIdTouched(true);
  };

  const getSIMIdErrorsList = (): string[] => {
    if (!simIdTouched) return [];
    return getSIMIdErrors(data.simId || '', t);
  };

  const handleCanalChange = (value: string) => {
    onChange('canal', value);
  };

  const handleCanalBlur = () => {
    setCanalTouched(true);
  };

  const getCanalErrorsList = (): string[] => {
    if (!canalTouched) return [];
    return getCanalErrors(data.canal || '', t);
  };

  const handleDirectorateBlur = () => {
    setDirectorateTouched(true);
  };

  const getDirectorateErrorsList = (): string[] => {
    if (!directorateTouched) return [];
    return getDirectorateErrors(data.directorateId?.toString() || '', t);
  };

  const handleDataLoggerTypeBlur = () => {
    setDataLoggerTypeTouched(true);
  };

  const getDataLoggerTypeErrorsList = (): string[] => {
    if (!dataLoggerTypeTouched) return [];
    return getDataLoggerTypeErrors(data.dataLoggerType || '', t);
  };

  // Check if all required fields are valid
  const isStage1Valid = (): boolean => {
    // Check all required fields have values
    const hasArabicName = data.arabicName && data.arabicName.trim().length > 0;
    const hasEnglishName = data.name && data.name.trim().length > 0;
    const hasCode = data.code && data.code.trim().length > 0;
    const hasSimId = data.simId && data.simId.trim().length > 0;
    const hasCanal = data.canal && data.canal.trim().length > 0;
    const hasDirectorate = data.directorateId && data.directorateId.toString().length > 0;
    const hasDataLoggerType = data.dataLoggerType && data.dataLoggerType.trim().length > 0;

    if (!hasArabicName || !hasEnglishName || !hasCode || !hasSimId || !hasCanal || !hasDirectorate || !hasDataLoggerType) {
      return false;
    }

    // Check if any required field has validation errors
    const arabicNameErrors = getArabicNameErrors(data.arabicName || '', t);
    const englishNameErrors = getEnglishNameErrors(data.name || '', t);
    const codeErrors = getSiteCodeErrors(data.code || '', t);
    const simIdErrors = getSIMIdErrors(data.simId || '', t);
    const canalErrors = getCanalErrors(data.canal || '', t);
    const directorateErrors = getDirectorateErrors(data.directorateId?.toString() || '', t);
    const dataLoggerTypeErrors = getDataLoggerTypeErrors(data.dataLoggerType || '', t);

    return (
      arabicNameErrors.length === 0 &&
      englishNameErrors.length === 0 &&
      codeErrors.length === 0 &&
      simIdErrors.length === 0 &&
      canalErrors.length === 0 &&
      directorateErrors.length === 0 &&
      dataLoggerTypeErrors.length === 0
    );
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
            onBlur={handleArabicNameBlur}
            className={dir === 'rtl' ? 'text-right' : 'text-left'}
            dir="rtl"
          />
          {getArabicNameErrorsList().map((error, index) => (
            <p key={index} className="text-sm text-red-600">{error}</p>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nameEn">{t('sites.stage1.englishNameLabel')}</Label>
          <Input
            id="nameEn"
            placeholder={t('sites.stage1.englishNamePlaceholder')}
            value={data.name || ''}
            onChange={(e) => handleEnglishNameChange(e.target.value)}
            onBlur={handleEnglishNameBlur}
            className={dir === 'rtl' ? 'text-right' : 'text-left'}
            dir="ltr"
          />
          {getEnglishNameErrorsList().map((error, index) => (
            <p key={index} className="text-sm text-red-600">{error}</p>
          ))}
        </div>
      </div>

      {/* Code Field */}
      <div className="space-y-2">
        <Label htmlFor="code">{t('sites.stage1.codeLabel')}</Label>
        <Input
          id="code"
          placeholder={t('sites.stage1.codePlaceholder')}
          value={data.code || ''}
          onChange={(e) => handleSiteCodeChange(e.target.value)}
          onBlur={handleSiteCodeBlur}
          className={dir === 'rtl' ? 'text-right' : 'text-left'}
        />
        {getSiteCodeErrorsList().map((error, index) => (
          <p key={index} className="text-sm text-red-600">{error}</p>
        ))}
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
          onValueChange={(value) => handleCanalChange(value)}
          dir={dir}
        >
          <SelectTrigger
            id="canal"
            className={dir === 'rtl' ? 'rtl:flex-row-reverse text-right' : 'text-left'}
            onBlur={handleCanalBlur}
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
        {getCanalErrorsList().map((error, index) => (
          <p key={index} className="text-sm text-red-600">{error}</p>
        ))}
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
            onBlur={handleDirectorateBlur}
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
        {getDirectorateErrorsList().map((error, index) => (
          <p key={index} className="text-sm text-red-600">{error}</p>
        ))}
      </div>

      {/* Data Logger Type Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="dataLoggerType">
          {t('sites.stage1.dataLoggerTypeLabel')}
        </Label>
        <Select
          value={data.dataLoggerType || ''}
          onValueChange={(value) => {
            onChange('dataLoggerType', value as DataLoggerType);
            setDataLoggerTypeTouched(true);
          }}
          onOpenChange={(open) => {
            if (!open) {
              handleDataLoggerTypeBlur();
            }
          }}
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
        {getDataLoggerTypeErrorsList().map((error, index) => (
          <p key={index} className="text-sm text-red-600">{error}</p>
        ))}
      </div>

      {/* SIM ID Field */}
      <div className="space-y-2">
        <Label htmlFor="simId">{t('sites.stage1.simIdLabel')}</Label>
        <Input
          id="simId"
          placeholder={t('sites.stage1.simIdPlaceholder')}
          value={data.simId || ''}
          onChange={(e) => handleSIMIdChange(e.target.value)}
          onBlur={handleSIMIdBlur}
          className={dir === 'rtl' ? 'text-right' : 'text-left'}
        />
        {getSIMIdErrorsList().map((error, index) => (
          <p key={index} className="text-sm text-red-600">{error}</p>
        ))}
      </div>
    </div>
  );
}
