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
import { SensorStatusForm, Site, AddSensorStatusAlarmDialogProps, SiteConfiguration } from '../../types';

import { validateAlarmName } from '../../utils/validation';
import { INITIAL_SENSOR_STATUS_FORM } from '../../utils/alarmConstants';

// Extend props to include sites and configuration
interface ExtendedAddSensorStatusAlarmDialogProps extends AddSensorStatusAlarmDialogProps {
    sites: Site[];
    sitesLoading?: boolean;
    siteError?: string | null;
}

export const AddSensorStatusAlarmDialog = React.forwardRef<HTMLDivElement, ExtendedAddSensorStatusAlarmDialogProps>(({
    form,
    setForm,
    onSubmit,
    isSubmitting,
    setEmails,
    setPhones,
    setSite,
    submissionError,
    sites,
    sitesLoading = false,
    siteError = null,
}: ExtendedAddSensorStatusAlarmDialogProps, ref) => {
    const { t } = useTranslation();
    const [alarmNameError, setAlarmNameError] = useState<string | undefined>(undefined);

    const handleSiteChange = (value: string) => {
        const selected = sites.find(site => site.name === value);
        if (selected) {
            setSite(selected.name);
            setForm(prev => ({ ...prev, siteId: selected.id, site: selected.name, IdvPump: '' }));
        }
    };

    

    return (
        <>
            <DialogContent ref={ref} className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <DialogHeader>
                    <DialogTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.addSensorStatusAlarm')}</DialogTitle>
                    <DialogDescription className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                        {t('alarms.SensorStatusAlarms')}
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

                    

                    <RecipientInput
                        type="email"
                        forAlarmType="sensorStatus"
                        recipients={form.emails}
                        setRecipients={setEmails}
                        setHasChanges={() => { }}
                    />

                    <RecipientInput
                        type="phone"
                        forAlarmType="sensorStatus"
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
                                disabled={isSubmitting || (form.emails.length === 0 && form.phones.length === 0) || !form.site }
                                loadingText={t('alarms.addingAlarm')}
                                isLoading={isSubmitting}
                            >
                                {t('alarms.addSensorStatusAlarm')}
                            </Button>
                            <Button variant="outline" onClick={() => {
                                // Reset form when canceling
                                setForm({ ...INITIAL_SENSOR_STATUS_FORM });
                                setAlarmNameError(undefined);
                            }}>
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
