import React, { useEffect } from 'react';
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
import { PumpStatusPSAlarmForm, Site } from '../../types';

interface EditPumpStatusPSAlarmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: PumpStatusPSAlarmForm;
    setForm: React.Dispatch<React.SetStateAction<PumpStatusPSAlarmForm>>;
    currentAlarm: PumpStatusPSAlarmForm | null;
    sites: Site[];
    sitesLoading: boolean;
    sitesError: string | null;
    configLoading?: boolean;
    siteError?: string | null;
    onSubmit: () => void;
    isSubmitting: boolean;
    hasChanges: boolean;
    setHasChanges: (hasChanges: boolean) => void;
    setEmails: (emails: string[]) => void;
    setPhones: (phones: string[]) => void;
    submissionError: string | null;
}

export function EditPumpStatusPSAlarmDialog({
    open,
    onOpenChange,
    form,
    setForm,
    currentAlarm,
    sites,
    sitesLoading,
    sitesError,
    configLoading = false,
    siteError = null,
    onSubmit,
    isSubmitting,
    hasChanges,
    setHasChanges,
    setEmails,
    setPhones,
    submissionError
}: EditPumpStatusPSAlarmDialogProps) {
    const { t } = useTranslation();

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
        WebkitOverflowScrolling: 'touch'
    };

    const footerContainerStyle: React.CSSProperties = {
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        paddingTop: '1rem',
        paddingBottom: '1.5rem',
        flexShrink: 0,
        borderTop: '1px solid hsl(var(--border))'
    };

    const handleSiteChange = (siteName: string) => {
        const selected = sites.find(site => site.name === siteName);
        if (selected) {
            setForm(prev => ({ 
                ...prev, 
                siteId: selected.id, 
                site: selected.name 
            }));
            setHasChanges(true);
        }
    };



    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            if (!newOpen) {
                onOpenChange(newOpen);
            } else {
                onOpenChange(newOpen);
            }
        }}>
            <DialogContent 
                className="w-[95vw] max-w-[600px] sm:max-w-lg flex flex-col p-0"
                style={{
                    height: '95vh',
                    maxHeight: '95vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
                dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
            >
                {/* Fixed Header */}
                <div style={headerContainerStyle}>
                    <DialogHeader>
                        <DialogTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            {t('alarms.editPumpStatusPSAlarm')}
                        </DialogTitle>
                        <DialogDescription className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            {t('alarms.PumpStatusPSAlarms')}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Scrollable Content */}
                <div style={scrollContainerStyle}>
                    <div className="space-y-6">
                        {/* Site Selection */}
                        <div className="space-y-2">
                            <Label>{t('alarms.site')}</Label>
                            {currentAlarm ? (
                                <Input type="text" value={currentAlarm.site} disabled />
                            ) : (
                                <Select
                                    onValueChange={handleSiteChange}
                                    value={form.site || ""}
                                    dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                                >
                                    <SelectTrigger className="rtl:flex-row-reverse">
                                        <SelectValue placeholder={t('readings.selectSite')} />
                                    </SelectTrigger>
                                    <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                                        {sitesLoading ? (
                                            <SelectItem value="0">{t('common.loading')}</SelectItem>
                                        ) : sitesError ? (
                                            <SelectItem value="0" disabled>{sitesError}</SelectItem>
                                        ) : (
                                            sites.map(site => (
                                                <SelectItem key={site.id} value={site.name}>{site.name}</SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
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
                                    setForm(prev => ({ ...prev, alarmName: e.target.value }));
                                    setHasChanges(true);
                                }}
                                placeholder={t('alarms.enterAlarmName')}
                                dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                                className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}
                            />
                        </div>

                        {/* Monitoring Hours Field */}
                        <div className="space-y-2">
                            <Label htmlFor="monitoring-hours">{t('alarms.monitoringHours')}</Label>
                            <Input
                                id="monitoring-hours"
                                type="number"
                                min="0"
                                value={form.monitoringHours || 0}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, monitoringHours: parseInt(e.target.value) || 0 }));
                                    setHasChanges(true);
                                }}
                                placeholder={t('alarms.enterMonitoringHours')}
                                dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                                className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}
                            />
                        </div>

                        {/* Email Recipients */}
                        <RecipientInput
                            type="email"
                            forAlarmType="pumpStatusPS"
                            recipients={form.emails}
                            setRecipients={setEmails}
                            setHasChanges={setHasChanges}
                        />

                        {/* Phone Recipients */}
                        <RecipientInput
                            type="phone"
                            forAlarmType="pumpStatusPS"
                            recipients={form.phones}
                            setRecipients={setPhones}
                            setHasChanges={setHasChanges}
                        />
                    </div>
                </div>

                {/* Fixed Footer */}
                <div className="px-6 py-4 flex-shrink-0 border-t border-border">
                    <DialogFooter>
                        {submissionError && (
                            <p className="text-red-600 text-sm text-center w-full mb-4">{t(`errors.${submissionError}`, submissionError)}</p>
                        )}
                        <div className={`w-full flex gap-2 ${t('_rtl') === 'rtl' ? 'flex-row-reverse justify-end' : 'flex-row justify-start'}`}>
                            <Button
                                onClick={() => {
                                    onSubmit();
                                }}
                                disabled={isSubmitting || !hasChanges || !form.siteId || (form.emails.length === 0 && form.phones.length === 0) || !form.alarmName || !form.monitoringHours}
                                loadingText={t('alarms.updatingAlarm')}
                                isLoading={isSubmitting}
                            >
                                {t('readings.saveChanges')}
                            </Button>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                {t('common.cancel')}
                            </Button>
                        </div>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
