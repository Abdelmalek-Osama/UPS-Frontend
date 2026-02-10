import React from 'react';
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
import { RecipientInput } from '../RecipientInput';
import { AlarmSiteSelector } from '../AlarmSiteSelector';
import { CommunicationAlarmForm, AddCommunicationAlarmDialogProps } from '../../types';
import { validateAlarmName } from '../../utils/validation';
import { INITIAL_COMMUNICATION_FORM } from '../../utils/alarmConstants';

export const AddCommunicationAlarmDialog = React.forwardRef<HTMLDivElement, AddCommunicationAlarmDialogProps>((
    {open,
    onOpenChange,
    form,
    setForm,
    sites,
    sitesLoading,
    sitesError,
    onSubmit,
    isSubmitting,
    setEmails,
    setPhones,
    submissionError
}: AddCommunicationAlarmDialogProps, ref) => {
    const { t } = useTranslation();
    const [alarmNameError, setAlarmNameError] = React.useState<string | undefined>(undefined);

    const handleAlarmNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setForm(prev => ({
            ...prev,
            alarmName: newName
        }));
        const error = validateAlarmName(newName);
        setAlarmNameError(error);
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            if (!newOpen && submissionError) {
                // Prevent closing if there's a submission error
                return;
            }
            if (!newOpen) {
                setForm({ ...INITIAL_COMMUNICATION_FORM });
                setAlarmNameError(undefined);
            }
            onOpenChange(newOpen);
        }}>
            <DialogContent ref={ref} className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto" style={{ minWidth: '500px' }} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <DialogHeader>
                    <DialogTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.addCommunicationAlarm')}</DialogTitle>
                    <DialogDescription className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                        {t('alarms.communicationAlarms')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>{t('alarms.alarmName')}</Label>
                        <Input
                            type="text"
                            placeholder={t('alarms.alarmName')}
                            value={form.alarmName}
                            onChange={handleAlarmNameChange}
                        />
                        {alarmNameError && (
                            <p className="text-red-600 text-sm">{alarmNameError}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('alarms.site')}</Label>
                        <AlarmSiteSelector
                            sites={sites}
                            sitesLoading={sitesLoading}
                            selectedSiteId={form.siteId}
                            onSiteSelect={(siteId) => setForm(prev => ({
                                ...prev,
                                siteId: siteId || 0
                            }))}
                            placeholder={t('alarms.selectSite')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('alarms.hours')}</Label>
                        <Input
                            type="number"
                            placeholder="2"
                            min="0"
                            value={form.hours}
                            onChange={(e) => {
                                const inputValue = e.target.value;
                                const parsedValue = parseInt(inputValue);

                                if (inputValue === '') {
                                    setForm(prev => ({
                                        ...prev,
                                        hours: 0,
                                        hoursError: undefined
                                    }));
                                } else if (isNaN(parsedValue) || parsedValue < 0) {
                                    setForm(prev => ({
                                        ...prev,
                                        hours: Math.max(0, parsedValue),
                                        hoursError: t('validation.invalidNumber')
                                    }));
                                } else {
                                    setForm(prev => ({
                                        ...prev,
                                        hours: parsedValue,
                                        hoursError: undefined
                                    }));
                                }
                            }}
                        />
                        {form.hoursError && (
                            <p className="text-red-600 text-sm">{form.hoursError}</p>
                        )}
                        <p className="text-xs text-gray-500">
                            {t('alarms.noResponse')}
                        </p>
                    </div>

                    {/* <div className="space-y-2">
                        <Label>مستوى الخطورة</Label>
                        <Select
                            onValueChange={(value: 'Warning' | 'Critical') => setForm(prev => ({
                                ...prev,
                                severity: value
                            }))}
                            value={form.severity}
                            dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                        >
                            <SelectTrigger className="rtl:flex-row-reverse">
                                <SelectValue placeholder="اختر المستوى" />
                            </SelectTrigger>
                            <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                                <SelectItem value="Warning">تحذير</SelectItem>
                                <SelectItem value="Critical">حرج</SelectItem>
                            </SelectContent>
                        </Select>
                    </div> */}

                    <RecipientInput
                        type="email"
                        forAlarmType="communication"
                        recipients={form.emails}
                        setRecipients={setEmails}
                        setHasChanges={() => { }}
                    />

                    <RecipientInput
                        type="phone"
                        forAlarmType="communication"
                        recipients={form.phones}
                        setRecipients={setPhones}
                        setHasChanges={() => { }}
                    />
                </div>

                <DialogFooter>
                    {submissionError && (
                        <p className="text-red-600 text-sm text-center w-full mb-4 break-words">{t(`errors.${submissionError}`, submissionError)}</p>
                    )}
                    <div className={`w-full flex gap-2 ${t('_rtl') === 'rtl' ? 'flex-row-reverse justify-end' : 'flex-row justify-start'}`}>
                        <Button
                            onClick={() => {
                                if (!form.hoursError && !alarmNameError) {
                                    onSubmit();
                                }
                            }}
                            disabled={isSubmitting || !form.siteId || !form.alarmName || !!form.hoursError || !!alarmNameError || (form.emails.length === 0 && form.phones.length === 0)}
                            loadingText={t('alarms.addingAlarm')}
                            isLoading={isSubmitting}
                        >
                            {t('alarms.addCommunicationAlarm')}
                        </Button>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            {t('common.cancel')}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});
