/**
 * Create Alarm Report Form Dialog
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Loader } from 'lucide-react';
import { EmailRecipientInput } from './EmailRecipientInput';
import { FieldSelector } from './FieldSelector';
import type { CreateAlarmReportPayload } from '../types';
import { DAYS_OF_WEEK } from '../types';
import { useSitesData } from '../../sites/hooks/useSitesData';

interface CreateAlarmReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateAlarmReportPayload) => Promise<void>;
  isLoading?: boolean;
}

export function CreateAlarmReportDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateAlarmReportDialogProps) {
  const { t } = useTranslation();
  const { sites, loading: sitesLoading } = useSitesData();

  // Form state
  const [name, setName] = useState('');
  const [siteId, setSiteId] = useState<number | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Hourly'>('Daily');
  const [scheduledTime, setScheduledTime] = useState('06:00');
  const [dayOfWeek, setDayOfWeek] = useState<number>(0);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t('validation.required');
    }

    if (recipients.length === 0) {
      newErrors.recipients = t('alarmReports.atLeastOneRecipientRequired');
    }

    if (selectedFields.length === 0) {
      newErrors.selectedFields = t('alarmReports.atLeastOneFieldRequired');
    }

    setErrors(newErrors);
return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
  toast.error(t('alarmReports.pleaseFixErrors'));
      return;
    }

    const payload: CreateAlarmReportPayload = {
      name: name.trim(),
      isEnabled,
  frequency,
      scheduledTime,
      dayOfWeek: frequency === 'Weekly' ? dayOfWeek : undefined,
recipients,
   selectedFields,
      siteId: siteId,
  filters: {
        siteId: siteId || undefined
      }
    };

    try {
   await onSubmit(payload);
      handleClose();
    } catch (err) {
    // Error is handled by the hook, just don't close dialog
    }
  };

  const handleClose = () => {
 setName('');
    setSiteId(null);
    setIsEnabled(true);
    setFrequency('Daily');
    setScheduledTime('06:00');
    setDayOfWeek(0);
    setRecipients([]);
    setSelectedFields([]);
    setErrors({});
    onOpenChange(false);
  };

  // Dialog styling to match pump station modal
  const dialogContentStyle: React.CSSProperties = {
    width: '95vw',
    maxWidth: '500px',
    height: '85vh',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
  overflow: 'hidden',
    direction: t('_rtl') === 'rtl' ? 'rtl' : 'ltr'
  };

  const headerContainerStyle: React.CSSProperties = {
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
    paddingTop: '1.5rem',
    paddingBottom: '1rem',
 flexShrink: 0,
    borderBottom: '1px solid hsl(var(--border))'
  };

  const scrollContainerStyle: React.CSSProperties = {
    flex: 1,
  overflowY: 'auto',
    overflowX: 'hidden',
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
    paddingTop: '1rem',
    paddingBottom: '1rem',
    minHeight: 0,
    WebkitOverflowScrolling: 'touch',
    height: 0
  };

  const contentWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  };

  const footerContainerStyle: React.CSSProperties = {
    paddingLeft: '1.5rem',
  paddingRight: '1.5rem',
    paddingTop: '1rem',
    paddingBottom: '1.5rem',
    flexShrink: 0,
    borderTop: '1px solid hsl(var(--border))'
  };

  const footerStyle: React.CSSProperties = {
    marginTop: 0
  };

  const footerButtonsContainerStyle: React.CSSProperties = {
    width: '100%',
 display: 'flex',
    justifyContent: 'flex-start',
    gap: '0.5rem'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={dialogContentStyle}>
      <div style={headerContainerStyle}>
   <DialogHeader>
     <DialogTitle dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'} className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
  {t('alarmReports.createNewConfiguration')}
            </DialogTitle>
            <DialogDescription dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'} className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
  {t('alarmReports.createConfigurationDescription')}
     </DialogDescription>
          </DialogHeader>
        </div>

  <div style={scrollContainerStyle}>
    <div style={contentWrapperStyle}>
     {/* Name */}
        <div className="space-y-2">
              <Label htmlFor="name" className="font-medium">
         {t('alarmReports.configurationName')} <span className="text-red-500">*</span>
</Label>
           <Input
  id="name"
placeholder={t('alarmReports.enterConfigurationName')}
      value={name}
       onChange={(e) => {
       setName(e.target.value);
       if (errors.name) setErrors({ ...errors, name: '' });
           }}
 dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
      className={errors.name ? 'border-red-500' : ''}
  />
     {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
</div>

     {/* Site Selection */}
        <div className="space-y-2">
      <Label htmlFor="site" className="font-medium">
     {t('sites.title')}
    </Label>
    <Select 
       value={siteId ? siteId.toString() : ''} 
      onValueChange={(value) => setSiteId(value ? Number(value) : null)}
     dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
       >
  <SelectTrigger id="site">
      <SelectValue placeholder={t('sites.selectSite') || 'Select a site'} />
    </SelectTrigger>
      <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
             {sitesLoading ? (
         <div className="p-2 text-center text-sm text-gray-500">
        {t('common.loading') || 'Loading...'}
       </div>
         ) : sites.length === 0 ? (
    <div className="p-2 text-center text-sm text-gray-500">
      {t('common.noData') || 'No sites available'}
           </div>
      ) : (
      sites.map((site) => (
    <SelectItem key={site.id} value={site.id.toString()}>
          {t('_rtl') === 'rtl' ? (site.nameAr || site.name) : (site.nameEn || site.name)}
   </SelectItem>
 ))
   )}
       </SelectContent>
    </Select>
   </div>

            {/* Enabled Toggle */}
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
   <Checkbox
  id="isEnabled"
   checked={isEnabled}
    onCheckedChange={(checked) => setIsEnabled(checked as boolean)}
         />
<Label htmlFor="isEnabled" className="font-medium mb-0 cursor-pointer">
  {t('alarmReports.enableReport')}
     </Label>
            <span className="text-xs text-gray-500">{isEnabled ? t('common.active') : t('common.inactive')}</span>
       </div>

         {/* Schedule Section */}
   <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
       <h3 className="font-medium text-sm">{t('alarmReports.schedule')}</h3>

       {/* Frequency */}
  <div className="space-y-2">
      <Label htmlFor="frequency">{t('alarmReports.frequency')}</Label>
         <Select value={frequency} onValueChange={(value) => setFrequency(value as 'Daily' | 'Weekly' | 'Hourly')} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
     <SelectTrigger id="frequency">
       <SelectValue />
       </SelectTrigger>
  <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
      <SelectItem value="Hourly">{t('alarmReports.frequencyHourly')}</SelectItem>
  <SelectItem value="Daily">{t('alarmReports.frequencyDaily')}</SelectItem>
       <SelectItem value="Weekly">{t('alarmReports.frequencyWeekly')}</SelectItem>
           </SelectContent>
  </Select>
       </div>

      {/* Scheduled Time */}
       {frequency !== 'Hourly' && (
     <div className="space-y-2">
    <Label htmlFor="scheduledTime">{t('alarmReports.scheduledTime')}</Label>
  <Input
      id="scheduledTime"
             type="time"
  value={scheduledTime}
 onChange={(e) => setScheduledTime(e.target.value)}
  dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
 />
     <p className="text-xs text-gray-500">{t('alarmReports.scheduledTimeDescription')}</p>
         </div>
          )}

      {/* Day of Week (for Weekly) */}
      {frequency === 'Weekly' && (
          <div className="space-y-2">
       <Label htmlFor="dayOfWeek">{t('alarmReports.dayOfWeek')}</Label>
        <Select value={dayOfWeek.toString()} onValueChange={(value) => setDayOfWeek(Number(value))} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
    <SelectTrigger id="dayOfWeek">
   <SelectValue />
    </SelectTrigger>
    <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
         {DAYS_OF_WEEK.map((day) => (
       <SelectItem key={day.value} value={day.value.toString()}>
          {t(`alarmReports.day${day.label}`)}
        </SelectItem>
      ))}
       </SelectContent>
     </Select>
</div>
  )}
        </div>

   {/* Email Recipients */}
  <div className="space-y-2">
       <EmailRecipientInput recipients={recipients} setRecipients={setRecipients} />
      {errors.recipients && <p className="text-xs text-red-500">{errors.recipients}</p>}
   </div>

       {/* Selected Fields */}
         <div className="space-y-2">
     <FieldSelector selectedFields={selectedFields} setSelectedFields={setSelectedFields} />
 {errors.selectedFields && <p className="text-xs text-red-500">{errors.selectedFields}</p>}
</div>
    </div>
 </div>

        <div style={footerContainerStyle}>
      <DialogFooter style={footerStyle}>
            <div style={footerButtonsContainerStyle}>
      <Button variant="outline" onClick={handleClose} disabled={isLoading}>
       {t('common.cancel')}
       </Button>
       <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
       {isLoading && <Loader className="h-4 w-4 animate-spin" />}
      {isLoading ? t('common.saving') : t('common.save')}
              </Button>
 </div>
    </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
