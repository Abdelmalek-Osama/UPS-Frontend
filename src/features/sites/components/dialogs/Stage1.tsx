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
  getDirectorateOptions,
  getDataLoggerTypeOptions,
} from '../../constants';

interface TabProps {
  data: Partial<Site>;
  onChange: (field: string, value: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Stage1({ data, onChange }: TabProps) {
  const { t } = useTranslation();
  const dir = t('_rtl') === 'rtl' ? 'rtl' : 'ltr';

  const canalOptions = getCanalOptions();
  const directorateOptions = getDirectorateOptions();
  const dataLoggerTypeOptions = getDataLoggerTypeOptions();

  return (
    <div className="space-y-3">
      {/* Site Name Field */}
      <div className="space-y-2">
        <Label htmlFor="siteName">{t('sites.stage1.siteNameLabel')}</Label>
        <Input
          id="siteName"
          placeholder={t('sites.stage1.siteNamePlaceholder')}
          value={data.siteName || ''}
          onChange={(e) => onChange('siteName', e.target.value)}
          className={dir === 'rtl' ? 'text-right' : 'text-left'}
        />
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
        <Label htmlFor="directorateName">
          {t('sites.stage1.directorateNameLabel')}
        </Label>
        <Select
          value={data.directorateName || ''}
          onValueChange={(value) => onChange('directorateName', value)}
          dir={dir}
        >
          <SelectTrigger
            id="directorateName"
            className={dir === 'rtl' ? 'rtl:flex-row-reverse text-right' : 'text-left'}
          >
            <SelectValue
              placeholder={t('sites.stage1.directorateNamePlaceholder')}
            />
          </SelectTrigger>
          <SelectContent dir={dir}>
            {directorateOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.label)}
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
