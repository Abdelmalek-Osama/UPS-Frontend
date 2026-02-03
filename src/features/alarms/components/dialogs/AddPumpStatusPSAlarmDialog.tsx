import React, {useEffect, useState} from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '../../../../components/ui/select';
import { RecipientInput } from '../RecipientInput';
import { PumpStatusPSAlarmForm, Site, AddPumpStatusPSAlarmDialogProps, SiteConfiguration } from '../../types';

import { validateAlarmName } from '../../utils/validation';
import { INITIAL_PumpStatusPS_FORM } from '../../utils/alarmConstants';

// Extend props to include sites and configuration
interface ExtendedAddPumpStatusPSAlarmDialogProps extends AddPumpStatusPSAlarmDialogProps {
    sites: Site[];
    sitesLoading?: boolean;
    siteConfiguration?: SiteConfiguration;
    configLoading?: boolean;
    siteError?: string | null;
}

export const AddPumpStatusPSAlarmDialog = React.forwardRef<HTMLDivElement, ExtendedAddPumpStatusPSAlarmDialogProps>(({
    form,
    setForm,
    onSubmit,
    isSubmitting,
    setEmails,
    setPhones,
    setSite,
    submissionError,
    onOpenChange,
    sites,
    sitesLoading = false,
    siteConfiguration,
    configLoading = false,
    siteError = null,
}: ExtendedAddPumpStatusPSAlarmDialogProps, ref) => {
    const { t } = useTranslation();
    const [alarmNameError, setAlarmNameError] = useState<string | undefined>(undefined);

    const handleSiteChange = (value: string) => {
        const selected = sites.find(site => site.id.toString() === value);
        if (selected) {
            setSite(selected.name);
            setForm(prev => ({ ...prev, siteId: selected.id, site: selected.name }));
        }
    };

    

    return (
        <>
            <DialogContent ref={ref} className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <DialogHeader>
                    <DialogTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.addPumpStatusPSAlarm')}</DialogTitle>
                    <DialogDescription className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                        {t('alarms.PumpStatusPSAlarms')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Site Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="site-select">{t('alarms.site')}</Label>
                        <Select value={form.siteId?.toString() || ''} onValueChange={handleSiteChange} disabled={sitesLoading}>
                            <SelectTrigger dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'} className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                                <SelectValue placeholder={sitesLoading ? t('common.loading') : t('alarms.selectSite')} />
                            </SelectTrigger>
                            <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                                {sites.map(site => (
                                    <SelectItem key={site.id} value={site.id.toString()}>
                                        {t('_rtl') === 'rtl' ? site.arabicName : site.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {siteError && (
                            <p className="text-red-600 text-sm">{t(siteError)}</p>
                        )}
                    </div>

                    {/* Alarm Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="alarm-name">{t('alarms.alarmName')}</Label>
                        <Input
                            id="alarm-name"
                            type="text"
                            value={form.alarmName || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                const error = validateAlarmName(value);
                                setAlarmNameError(error);
                                setForm(prev => ({ ...prev, alarmName: value }));
                            }}
                            placeholder={t('alarms.enterAlarmName')}
                            dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                            className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}
                        />
                        {alarmNameError && <p className="text-red-600 text-sm">{alarmNameError}</p>}
                    </div>

                    {/* Monitoring Hours Field */}
                    <div className="space-y-2">
                        <Label htmlFor="monitoring-hours">{t('alarms.monitoringHours')}</Label>
                        <Input
                            id="monitoring-hours"
                            type="number"
                            min="0"
                            value={form.monitoringHours || 0}
                            onChange={(e) => setForm(prev => ({ ...prev, monitoringHours: parseInt(e.target.value) || 0 }))}
                            placeholder={t('alarms.enterMonitoringHours')}
                            dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                            className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}
                        />
                    </div>

                    <RecipientInput
                        type="email"
                        forAlarmType="pumpStatusPS"
                        recipients={form.emails}
                        setRecipients={setEmails}
                        setHasChanges={() => { }}
                    />

                    <RecipientInput
                        type="phone"
                        forAlarmType="pumpStatusPS"
                        recipients={form.phones}
                        setRecipients={setPhones}
                        setHasChanges={() => { }}
                    />
                </div>

                <DialogFooter>
                    <div className={`w-full flex items-center gap-4 ${t('_rtl') === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`flex gap-2 ${t('_rtl') === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Button
                                onClick={() => {
                                    onSubmit();
                                }}
                                disabled={isSubmitting || (form.emails.length === 0 && form.phones.length === 0) || !form.site || !form.alarmName || !form.monitoringHours }
                                loadingText={t('alarms.addingAlarm')}
                                isLoading={isSubmitting}
                            >
                                {t('alarms.addPumpStatusPSAlarm')}
                            </Button>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                {t('common.cancel')}
                            </Button>
                        </div>
                        {submissionError && (
                            <p className={`text-red-600 text-sm flex-1 ${t('_rtl') === 'rtl' ? 'text-left' : 'text-right'}`}>{t(`errors.${submissionError}`, submissionError)}</p>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </>
    );
});
