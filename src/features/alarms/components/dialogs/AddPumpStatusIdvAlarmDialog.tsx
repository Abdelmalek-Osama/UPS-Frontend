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
        const selected = sites.find(site => site.name === value);
        if (selected) {
            setSite(selected.name);
            setForm(prev => ({ ...prev, siteId: selected.id, site: selected.name, IdvPump: '' }));
        }
    };

    const handleIdvPumpChange = (value: string) => {
        setIdvPump(value);
        setForm(prev => ({ ...prev, IdvPump: value }));
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            if (!newOpen) {
                // Reset all form state and errors when dialog closes
                setForm({ ...INITIAL_PumpStatusIdv_FORM });
                setAlarmNameError(undefined);
            }
            onOpenChange(newOpen);
        }}>
            <DialogContent ref={ref} className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <DialogHeader>
                    <DialogTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.addPumpStatusIdvAlarm')}</DialogTitle>
                    <DialogDescription className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                        {t('alarms.PumpStatusIdvAlarms')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Site Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="site-select">{t('alarms.site')}</Label>
                        <Select value={form.site || ''} onValueChange={handleSiteChange} disabled={sitesLoading}>
                            <SelectTrigger dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'} className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                                <SelectValue placeholder={sitesLoading ? t('common.loading') : t('alarms.selectSite')} />
                            </SelectTrigger>
                            <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                                {sites.map(site => (
                                    <SelectItem key={site.id} value={site.name}>
                                        {site.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {siteError && (
                            <p className="text-red-600 text-sm">{t(siteError)}</p>
                        )}
                    </div>

                    {/* IDV Pump Input */}
                    <div className="space-y-2">
                        <Label htmlFor="idv-pump">{t('alarms.idvPump')}</Label>
                        <Select value={form.IdvPump || ''} onValueChange={handleIdvPumpChange} disabled={!siteConfiguration?.numPumps || configLoading}>
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
                                disabled={isSubmitting || (form.emails.length === 0 && form.phones.length === 0) || !form.site || !form.IdvPump}
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
                            <p className={`text-red-600 text-sm flex-1 ${t('_rtl') === 'rtl' ? 'text-left' : 'text-right'}`}>{submissionError}</p>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});
