/**
 * Create Alarm Report Form Dialog
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuth } from '../../../shared/contexts/AuthContext';
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
import { Loader } from 'lucide-react';
import { EmailRecipientInput } from './EmailRecipientInput';
import { FieldSelector } from './FieldSelector';
import type { AlarmReportConfiguration, CreateAlarmReportPayload } from '../types';
import { DAYS_OF_WEEK } from '../types';
import { useSitesData } from '../../sites/hooks/useSitesData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

interface CreateAlarmReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateAlarmReportPayload) => Promise<void>;
  isLoading?: boolean;
  editingConfig?: AlarmReportConfiguration | null;
}

export function CreateAlarmReportDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  editingConfig = null,
}: CreateAlarmReportDialogProps) {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { sites, loading: sitesLoading } = useSitesData();
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [siteIds, setSiteIds] = useState<number[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly'>('Daily');
  const [scheduledTime, setScheduledTime] = useState('06:00');
  const [dayOfWeek, setDayOfWeek] = useState<number>(0);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with editing config data when dialog opens
  React.useEffect(() => {
    if (open && editingConfig) {
      setName(editingConfig.name);
      setSiteIds(editingConfig.filters?.siteIds || []);
      setIsEnabled(editingConfig.isEnabled);
      setFrequency(editingConfig.frequency);
      setScheduledTime(editingConfig.scheduledTime || '06:00');
      setDayOfWeek(editingConfig.dayOfWeek || 0);
      setRecipients(editingConfig.recipients);
      setSelectedFields(editingConfig.selectedFields);
    } else if (open && !editingConfig) {
      // Reset form for create mode
      setName('');
      setSiteIds([]);
      setIsEnabled(true);
      setFrequency('Daily');
      setScheduledTime('06:00');
      setDayOfWeek(0);
      setRecipients([]);
      setSelectedFields([]);
    }
    setErrors({});
  }, [open, editingConfig]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t('alarmReports.configurationNameRequired') || 'Configuration name is required';
    }

    if (siteIds.length === 0) {
      newErrors.siteIds = t('alarmReports.atLeastOneSiteRequired') || 'At least one site must be selected';
    }

    if (recipients.length === 0) {
      newErrors.recipients = t('alarmReports.atLeastOneRecipientRequired') || 'At least one recipient is required';
    }

    if (selectedFields.length === 0) {
      newErrors.selectedFields = t('alarmReports.atLeastOneFieldRequired') || 'At least one field must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Only admins can create/edit alarm reports
    if (currentUser?.role !== 'Admin') {
      toast.error(t('alarmReports.adminOnlyAction') || 'Only administrators can create alarm reports');
      return;
    }

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
      siteIds: siteIds.length > 0 ? siteIds : undefined,
      filters: {
        siteIds: siteIds.length > 0 ? siteIds : undefined,
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
    setSiteIds([]);
    setIsEnabled(true);
    setFrequency('Daily');
    setScheduledTime('06:00');
    setDayOfWeek(0);
    setRecipients([]);
    setSelectedFields([]);
    setErrors({});
    onOpenChange(false);
  };

  const handleSiteToggle = (siteIdToToggle: number) => {
    setSiteIds((prevSelected) =>
      prevSelected.includes(siteIdToToggle)
        ? prevSelected.filter((id) => id !== siteIdToToggle)
        : [...prevSelected, siteIdToToggle]
    );
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
    marginTop: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%'
  };

  const footerButtonsContainerStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    gap: '0.5rem'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'} style={dialogContentStyle}>
        <div style={headerContainerStyle}>
          <DialogHeader>
            <DialogTitle dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'} className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
              {editingConfig ? t('alarmReports.editConfiguration') : t('alarmReports.createNewConfiguration')}
            </DialogTitle>
            <DialogDescription dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'} className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
              {editingConfig ? t('alarmReports.editConfigurationDescription') : t('alarmReports.createConfigurationDescription')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div ref={modalScrollRef} style={scrollContainerStyle}>
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
                {t('sites.title')} {siteIds.length === 0 && <span className="text-red-500">*</span>}
              </Label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSiteIds(sites?.map(s => s.id) || [])}
                  style={{
                    width: '100%',
                    fontSize: '0.875rem',
                    padding: '0.625rem 1rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    fontWeight: '600',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    cursor: sitesLoading || !sites || sites.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: sitesLoading || !sites || sites.length === 0 ? 0.5 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!(sitesLoading || !sites || sites.length === 0)) {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                  }}
                  disabled={sitesLoading || !sites || sites.length === 0}
                >
                  {t('alarmReports.selectAll') || 'Select All'}
                </button>
                <button
                  type="button"
                  onClick={() => setSiteIds([])}
                  style={{
                    width: '100%',
                    fontSize: '0.875rem',
                    padding: '0.625rem 1rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    fontWeight: '600',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: 'none',
                    cursor: sitesLoading || siteIds.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: sitesLoading || siteIds.length === 0 ? 0.5 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!(sitesLoading || siteIds.length === 0)) {
                      e.currentTarget.style.backgroundColor = '#4b5563';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#6b7280';
                  }}
                  disabled={sitesLoading || siteIds.length === 0}
                >
                  {t('alarmReports.clearAll') || 'Clear All'}
                </button>
              </div>
              <Select>
                <SelectTrigger
                  id="site"
                  className={`w-full ${errors.siteIds ? 'border-red-500' : ''}`}
                >
                  <SelectValue placeholder={t('sites.selectSite')} />
                </SelectTrigger>
                <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'} className="max-h-48 overflow-y-auto">
                  {sitesLoading ? (
                    <div className="p-2 text-sm text-gray-500">{t('common.loadingData')}</div>
                  ) : sites && sites.length > 0 ? (
                    sites.map((site) => (
                      <div key={site.id} className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm" onClick={(e) => {
                        e.preventDefault();
                        handleSiteToggle(site.id);
                      }}>
                        <Checkbox
                          checked={siteIds.includes(site.id)}
                          onCheckedChange={() => handleSiteToggle(site.id)}
                        />
                        <span>{t('_rtl') === 'rtl' ? site.arabicName || site.name : site.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">{t('sites.noSitesToShow')}</div>
                  )}
                </SelectContent>
              </Select>
              {siteIds.length > 0 && (
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto p-1 bg-blue-50 rounded border border-blue-200">
                  {siteIds.map((id) => {
                    const site = sites?.find(s => s.id === id);
                    return site ? (
                      <div key={id} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs flex items-center gap-1 whitespace-nowrap">
                        <span>{t('_rtl') === 'rtl' ? site.arabicName || site.name : site.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
              {errors.siteIds && <p className="text-xs text-red-500">{errors.siteIds}</p>}
            </div>

            {/* Enabled Toggle */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Checkbox
                id="isEnabled"
                checked={isEnabled}
                onCheckedChange={(checked: boolean) => setIsEnabled(checked)}
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
                <Select value={frequency} onValueChange={(value) => setFrequency(value as 'Daily' | 'Weekly')} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                    <SelectItem value="Daily">{t('alarmReports.frequencyDaily')}</SelectItem>
                    <SelectItem value="Weekly">{t('alarmReports.frequencyWeekly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Scheduled Time */}
              {(frequency === 'Daily' || frequency === 'Weekly') && (
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
              {errors.recipients && <p className="text-xs text-red-600">{errors.recipients}</p>}
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
            {/* Validation Error Messages Card */}
            {Object.keys(errors).length > 0 && (
              <div className="w-full p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-red-700 mb-2">{t('alarmReports.pleaseFixErrors')}</p>
                <ul className="space-y-1">
                  {Object.entries(errors).map(([key, message]) => (
                    <li key={key} className="text-xs text-red-600 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={footerButtonsContainerStyle}>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
                {isLoading && <Loader className="h-4 w-4 animate-spin" />}
                {isLoading ? t('common.saving') : (editingConfig ? t('common.update') : t('common.save'))}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
