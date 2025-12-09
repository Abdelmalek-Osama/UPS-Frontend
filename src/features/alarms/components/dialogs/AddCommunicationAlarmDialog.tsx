import React from 'react';
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
import { CommunicationAlarmForm, Site, AddCommunicationAlarmDialogProps } from '../../types';
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
            <DialogContent ref={ref} className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="text-right">إضافة تنبيه فقدان اتصال</DialogTitle>
                    <DialogDescription className="text-right">
                        تكوين تنبيه عند انقطاع البيانات لفترة محددة
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>الموقع</Label>
                        <Select
                            onValueChange={(value) => setForm(prev => ({
                                ...prev,
                                siteId: parseInt(value)
                            }))}
                            value={form.siteId?.toString() || ""}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="اختر الموقع" />
                            </SelectTrigger>
                            <SelectContent>
                                {sitesLoading ? (
                                    <SelectItem value="0">جاري التحميل...</SelectItem>
                                ) : sitesError ? (
                                    <SelectItem value="0" disabled>{sitesError}</SelectItem>
                                ) : (
                                    sites.map(site => (
                                        <SelectItem key={site.id} value={site.id.toString()}>{site.name}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>اسم التنبيه</Label>
                        <Input
                            type="text"
                            placeholder="اسم التنبيه"
                            value={form.alarmName}
                            onChange={handleAlarmNameChange}
                        />
                        {alarmNameError && (
                            <p className="text-red-600 text-sm">{alarmNameError}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>عدد الساعات</Label>
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
                                        hoursError: "لا يمكن أن تكون قيمة الحقل أقل من 0"
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
                            سيتم إرسال تنبيه إذا لم تصل بيانات لهذا العدد من الساعات
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
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="اختر المستوى" />
                            </SelectTrigger>
                            <SelectContent>
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
                        <p className="text-red-600 text-sm text-center w-full mb-4">{submissionError}</p>
                    )}
                    <div className="w-full flex justify-start gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            إلغاء
                        </Button>
                        <Button
                            onClick={() => {
                                if (!form.hoursError && !alarmNameError) {
                                    onSubmit();
                                }
                            }}
                            disabled={isSubmitting || !form.siteId || !form.alarmName || !!form.hoursError || !!alarmNameError || (form.emails.length === 0 && form.phones.length === 0)}
                            loadingText="جاري الإضافة..."
                            isLoading={isSubmitting}
                        >
                            إضافة التنبيه
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});
