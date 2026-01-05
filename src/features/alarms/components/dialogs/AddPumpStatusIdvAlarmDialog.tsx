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
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '../../../../components/ui/select';
import { RecipientInput } from '../RecipientInput';
import { PumpStatusIdvAlarmForm, Site, AddPumpStatusIdvAlarmDialogProps } from '../../types';

import { validateAlarmName } from '../../utils/validation';
import { INITIAL_PumpStatusIdv_FORM } from '../../utils/alarmConstants';

export const AddPumpStatusIdvAlarmDialog = React.forwardRef<HTMLDivElement, AddPumpStatusIdvAlarmDialogProps>((
    {open,
    onOpenChange,
    form,
    setForm,
    onSubmit,
    isSubmitting,
    setEmails,
    setPhones,
    setSite,
    setIdvPump,
    submissionError
}: AddPumpStatusIdvAlarmDialogProps, ref) => {
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
                    {submissionError && (
                        <p className="text-red-600 text-sm text-center w-full mb-4">{submissionError}</p>
                    )}
                    <div className="w-full flex justify-start gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={() => {
                                // if (!form.hoursError && !alarmNameError) {
                                //     onSubmit();
                                // }
                                onSubmit();
                            }}
                            disabled={isSubmitting || (form.emails.length === 0 && form.phones.length === 0)}
                            loadingText={t('alarms.addingAlarm')}
                            isLoading={isSubmitting}
                        >
                            {t('alarms.addPumpStatusIdvAlarm')}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});
