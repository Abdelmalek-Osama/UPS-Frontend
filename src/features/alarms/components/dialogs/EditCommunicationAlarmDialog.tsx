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
import { CommunicationAlarmForm, Site } from '../../types';
import { validateAlarmName } from '../../utils/validation';

interface EditCommunicationAlarmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: CommunicationAlarmForm;
    setForm: React.Dispatch<React.SetStateAction<CommunicationAlarmForm>>;
    currentAlarm: CommunicationAlarmForm | null;
    sites: Site[];
    sitesLoading: boolean;
    sitesError: string | null;
    onSubmit: () => void;
    isSubmitting: boolean;
    hasChanges: boolean;
    setHasChanges: (hasChanges: boolean) => void;
    setEmails: (emails: string[]) => void;
    setPhones: (phones: string[]) => void;
    submissionError: string | null;
}

export function EditCommunicationAlarmDialog({
    open,
    onOpenChange,
    form,
    setForm,
    currentAlarm,
    sites,
    sitesLoading,
    sitesError,
    onSubmit,
    isSubmitting,
    hasChanges,
    setHasChanges,
    setEmails,
    setPhones,
    submissionError
}: EditCommunicationAlarmDialogProps) {
    const { t } = useTranslation();
    const [alarmNameError, setAlarmNameError] = React.useState<string | undefined>(undefined);

    useEffect(() => {
        if (currentAlarm && currentAlarm.hours < 0) {
            setForm(prev => ({
                ...prev,
                hoursError: t('validation.invalidNumber')
            }));
        } else if (currentAlarm && currentAlarm.hours >= 0) {
            setForm(prev => ({
                ...prev,
                hoursError: undefined
            }));
        }
    }, [currentAlarm, setForm]);

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            if (!newOpen && submissionError) {
                // Prevent closing if there's a submission error
                return;
            }
            onOpenChange(newOpen);
        }}>
                <DialogContent 
                className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto" 
                dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                    <DialogHeader>
                        <DialogTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.editCommunicationAlarm')}</DialogTitle>
                        <DialogDescription className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            {t('alarms.editCommunicationAlarmDescription')}
                        </DialogDescription>
                    </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>{t('alarms.site')}</Label>
                        {currentAlarm ? (
                            <Input type="text" value={currentAlarm.site} disabled />
                        ) : (
                            <Select
                                onValueChange={(value) => setForm(prev => ({
                                    ...prev,
                                    siteId: parseInt(value)
                                }))}
                                value={form.siteId?.toString() || ""}
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
                                            <SelectItem key={site.id} value={site.id.toString()}>{site.name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>{t('alarms.alarmName')}</Label>
                        <Input
                            type="text"
                            placeholder={t('alarms.alarmName')}
                            value={form.alarmName}
                            onChange={(e) => {
                                setForm(prev => ({
                                    ...prev,
                                    alarmName: e.target.value
                                }));
                                const error = validateAlarmName(e.target.value);
                                setAlarmNameError(error);
                                setHasChanges(true);
                            }}
                        />
                        {alarmNameError && (
                            <p className="text-red-600 text-sm">{alarmNameError}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>{t('alarms.noResponse')}</Label>
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
                                setHasChanges(true);
                            }}
                        />
                        {form.hoursError && (
                            <p className="text-red-600 text-sm">{form.hoursError}</p>
                        )}
                        <p className="text-xs text-gray-500">
                            {t('alarms.communicationAlarmDescription')}
                        </p>
                    </div>

                    {/* <div className="space-y-2">
                        <Label>مستوى الخطورة</Label>
                        <Select
                            onValueChange={(value: 'Warning' | 'Critical') => {
                                setForm(prev => ({
                                    ...prev,
                                    severity: value
                                }));
                                setHasChanges(true);
                            }}
                            value={form.severity}
                            dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                        >
                            <SelectTrigger className="rtl:flex-row-reverse">
                                <SelectValue placeholder={t('alarms.severity')} />
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
                        setHasChanges={setHasChanges}
                    />

                    <RecipientInput
                        type="phone"
                        forAlarmType="communication"
                        recipients={form.phones}
                        setRecipients={setPhones}
                        setHasChanges={setHasChanges}
                    />
                </div>

                <DialogFooter>
                    {submissionError && (
                        <p className="text-red-600 text-sm text-center w-full mb-4">{submissionError}</p>
                    )}
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.5rem',
                        flexDirection: 'row'
                    }}>
                        <Button
                            onClick={() => {
                                if (!form.hoursError && !alarmNameError) {
                                    onSubmit();
                                }
                            }}
                            disabled={isSubmitting || !hasChanges || !form.siteId || !form.alarmName || !!form.hoursError || !!alarmNameError || (form.emails.length === 0 && form.phones.length === 0)}
                            loadingText={t('common.saving')}
                            isLoading={isSubmitting}
                        >
                            {t('readings.saveChanges')}
                        </Button>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            {t('common.cancel')}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
