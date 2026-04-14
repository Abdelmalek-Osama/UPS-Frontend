import React, { useEffect, useState } from 'react';
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
import { AlarmSiteSelector } from '../AlarmSiteSelector';
import { PumpStatusIdvAlarmForm, Site, AddPumpStatusIdvAlarmDialogProps, SiteConfiguration } from '../../types';

import { validateAlarmName } from '../../utils/validation';
import { INITIAL_PumpStatusIdv_FORM } from '../../utils/alarmConstants';

// Extend props to include sites and configuration
interface ExtendedAddPumpStatusIdvAlarmDialogProps extends AddPumpStatusIdvAlarmDialogProps {
    sites: Site[];
    sitesLoading?: boolean;
    siteConfiguration?: SiteConfiguration;
    configLoading?: boolean;
    siteError?: string | null;
}

export const AddPumpStatusIdvAlarmDialog = React.forwardRef<HTMLDivElement, ExtendedAddPumpStatusIdvAlarmDialogProps>(({
    open,
    onOpenChange,
    form,
    setForm,
    onSubmit,
    isSubmitting,
    setEmails,
    setPhones,
    setSite,
    setIdvPump,
    submissionError,
    sites,
    sitesLoading = false,
    siteConfiguration,
    configLoading = false,
    siteError = null,
}: ExtendedAddPumpStatusIdvAlarmDialogProps, ref) => {
    const { t } = useTranslation();
    const [alarmNameError, setAlarmNameError] = useState<string | undefined>(undefined);

    const handleSiteChange = (value: string) => {
        const selected = sites.find(site => site.id.toString() === value);
        if (selected) {
            setSite(selected.name);
            setForm(prev => ({ ...prev, siteId: selected.id, site: selected.name, pumpNumber: 1 }));
        }
    };

    const handlePumpNumberChange = (value: string) => {
        const pumpNum = parseInt(value) || 1;
        setIdvPump(value);
        setForm(prev => ({ 
            ...prev, 
            pumpNumber: pumpNum,
            monitoringHours: prev.monitoringHours || 24
        }));
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            if (!newOpen) {
                // Reset all form state and errors when dialog closes
                setForm({ 
                    ...INITIAL_PumpStatusIdv_FORM,
                    pumpNumber: 1,
                    monitoringHours: 24,
                });
                setAlarmNameError(undefined);
            }
            onOpenChange(newOpen);
        }}>
            <DialogContent ref={ref} className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto" style={{ minWidth: '500px' }} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <DialogHeader>
                    <DialogTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.addPumpStatusIdvAlarm')}</DialogTitle>
                    <DialogDescription className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                        {t('alarms.PumpStatusIdvAlarms')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Alarm Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="alarm-name">{t('alarms.alarmName')}</Label>
                        <Input
                            id="alarm-name"
                            type="text"
                            value={form.alarmName || ''}
                            onChange={(e) => setForm(prev => ({ ...prev, alarmName: e.target.value }))}
                            placeholder={t('alarms.enterAlarmName')}
                            dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                            className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}
                        />
                        {alarmNameError && (
                            <p className="text-red-600 text-sm">{alarmNameError}</p>
                        )}
                    </div>

                    {/* Site Selection */}
                    <AlarmSiteSelector
                        sites={sites}
                        sitesLoading={sitesLoading}
                        selectedSiteId={form.siteId}
                        onSiteSelect={(siteId) => {
                            const selected = sites.find(site => site.id === Number(siteId));
                            if (selected) {
                                setSite(selected.name);
                                setForm(prev => ({ ...prev, siteId: Number(siteId), site: selected.name, pumpNumber: 1 }));
                            }
                        }}
                        placeholder={t('readings.selectSite')}
                        allowClear={false}
                    />
                    {siteError && (
                        <p className="text-red-600 text-sm">{t(siteError)}</p>
                    )}

                    {/* Pump Number Input */}
                    <div className="space-y-2">
                        <Label htmlFor="pump-number">{t('alarms.idvPump')}</Label>
                        <Select value={String(form.pumpNumber || 1)} onValueChange={handlePumpNumberChange} disabled={!siteConfiguration?.numPumps || configLoading}>
                            <SelectTrigger dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'} className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                                <SelectValue placeholder={configLoading ? t('common.loading') : t('alarms.selectPump')} />
                            </SelectTrigger>
                            <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                                {siteConfiguration?.numPumps ? (
                                    Array.from({ length: siteConfiguration.numPumps }, (_, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1)}>
                                            {t('alarms.pump')} {i + 1}
                                        </SelectItem>
                                    ))
                                ) : null}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Monitoring Hours Field */}
                    <div className="space-y-2">
                        <Label htmlFor="monitoring-hours">{t('alarms.monitoringHours')}</Label>
                        <Input
                            id="monitoring-hours"
                            type="number"
                            min="1"
                            max="168"
                            value={form.monitoringHours ?? 24}
                            onChange={(e) => setForm(prev => ({ 
                                ...prev, 
                                monitoringHours: parseInt(e.target.value) || 24,
                                pumpNumber: prev.pumpNumber || 1
                            }))}
                            placeholder={t('alarms.enterMonitoringHours')}
                            dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                            className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}
                        />
                    </div>

                    <RecipientInput
                        type="email"
                        forAlarmType="pumpStatusIdv"
                        recipients={form.emails}
                        setRecipients={setEmails}
                        setHasChanges={() => { }}
                    />

                    <RecipientInput
                        type="phone"
                        forAlarmType="pumpStatusIdv"
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
                                disabled={isSubmitting || (form.emails.length === 0 && form.phones.length === 0) || !form.site || !form.alarmName || form.pumpNumber < 1 || form.pumpNumber > 10 || form.monitoringHours < 1 || form.monitoringHours > 168}
                                loadingText={t('alarms.addingAlarm')}
                                isLoading={isSubmitting}
                            >
                                {t('alarms.addPumpStatusIdvAlarm')}
                            </Button>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                {t('common.cancel')}
                            </Button>
                        </div>
                        {submissionError && (
                            <p className={`text-red-600 text-sm flex-1 break-words ${t('_rtl') === 'rtl' ? 'text-left' : 'text-right'}`}>{t(`errors.${submissionError}`, submissionError)}</p>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});
