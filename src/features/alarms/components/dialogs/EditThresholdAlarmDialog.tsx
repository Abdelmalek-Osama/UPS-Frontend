import React, { useEffect } from 'react';
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
import { ThresholdAlarmForm, Site } from '../../types';
import { OPERATORS, OPERATOR_LABELS } from '../../utils/alarmConstants';
import { validateAlarmName } from '../../utils/validation';

// Utility function to validate color input
const isValidColor = (color: string): boolean => {
    // Regex for Hex color codes (e.g., #RRGGBB or #RGB)
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    // Regex for RGB color codes (e.g., rgb(0, 0, 0))
    const rgbRegex = /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/;
    // Regex for RGBA color codes (e.g., rgba(0, 0, 0, 0.5))
    const rgbaRegex = /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0(\.\d+)?|1(\.0+)?)\s*\)$/;

    // Basic check for common named colors (you might want a more comprehensive list)
    const namedColors = ['red', 'blue', 'green', 'black', 'white', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray'];

    return hexRegex.test(color) || rgbRegex.test(color) || rgbaRegex.test(color) || namedColors.includes(color.toLowerCase());
};

interface EditThresholdAlarmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: ThresholdAlarmForm;
    setForm: React.Dispatch<React.SetStateAction<ThresholdAlarmForm>>;
    currentAlarm: ThresholdAlarmForm | null;
    sites: Site[];
    sitesLoading: boolean;
    sitesError: string | null;
    availableFields: string[];
    onSubmit: () => void;
    isSubmitting: boolean;
    hasChanges: boolean;
    setHasChanges: (hasChanges: boolean) => void;
    setEmails: (emails: string[]) => void;
    setPhones: (phones: string[]) => void;
    submissionError: string | null;
}

export function EditThresholdAlarmDialog({
    open,
    onOpenChange,
    form,
    setForm,
    currentAlarm,
    sites,
    sitesLoading,
    sitesError,
    availableFields,
    onSubmit,
    isSubmitting,
    hasChanges,
    setHasChanges,
    setEmails,
    setPhones,
    submissionError
}: EditThresholdAlarmDialogProps) {
    const [alarmNameError, setAlarmNameError] = React.useState<string | undefined>(undefined);

    useEffect(() => {
        if (currentAlarm && currentAlarm.threshold < 0) {
            setForm(prev => ({
                ...prev,
                thresholdError: "لا يمكن أن تكون قيمة الحقل أقل من 0"
            }));
        } else if (currentAlarm && currentAlarm.threshold >= 0) {
            setForm(prev => ({
                ...prev,
                thresholdError: undefined
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
            <DialogContent className="w-[95vw] max-w-[600px] overflow-y-auto" style={{ maxHeight: '100vh', overflowY: 'auto' }} dir="rtl">
                <DialogHeader>
                    <DialogTitle className="text-right">تعديل تنبيه قيمة حدية</DialogTitle>
                    <DialogDescription className="text-right">
                        تعديل تكوين التنبيه الحالي
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>الموقع</Label>
                        {currentAlarm ? (
                            <Input type="text" value={currentAlarm.site} disabled />
                        ) : (
                            <Select
                                onValueChange={(value) => {
                                    setForm(prev => ({
                                        ...prev,
                                        siteId: parseInt(value)
                                    }));
                                    setHasChanges(true);
                                }}
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
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>اسم التنبيه</Label>
                        <Input
                            type="text"
                            placeholder="اسم التنبيه"
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
                        <Label>الحقل</Label>
                        <Select
                            onValueChange={(value) => {
                                setForm(prev => ({
                                    ...prev,
                                    field: value
                                }));
                                setHasChanges(true);
                            }}
                            value={form.field}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="اختر الحقل" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableFields.map(field => (
                                    <SelectItem key={field} value={field}>{field}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>المعامل</Label>
                            <Select
                                onValueChange={(value) => {
                                    setForm(prev => ({
                                        ...prev,
                                        operator: value
                                    }));
                                    setHasChanges(true);
                                }}
                                value={form.operator}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر المعامل" />
                                </SelectTrigger>
                                <SelectContent>
                                    {OPERATORS.map(op => (
                                        <SelectItem key={op} value={op}>{OPERATOR_LABELS[op] || op}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>القيمة الحدية</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="12.5"
                                value={form.threshold}
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    const parsedValue = parseFloat(inputValue);

                                    if (inputValue === '') {
                                        setForm(prev => ({
                                            ...prev,
                                            threshold: 0,
                                            thresholdError: undefined
                                        }));
                                    } else if (isNaN(parsedValue) || parsedValue < 0) {
                                        setForm(prev => ({
                                            ...prev,
                                            threshold: Math.max(0, parsedValue),
                                            thresholdError: "لا يمكن أن تكون قيمة الحقل أقل من 0"
                                        }));
                                    } else {
                                        setForm(prev => ({
                                            ...prev,
                                            threshold: parsedValue,
                                            thresholdError: undefined
                                        }));
                                    }
                                    setHasChanges(true);
                                }}
                            />
                             {form.thresholdError && (
                                <p className="text-red-600 text-sm">{form.thresholdError}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
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
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="اختر المستوى" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Warning">تحذير</SelectItem>
                                <SelectItem value="Critical">حرج</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>اللون</Label>
                        <div className="flex gap-2">
                            <Input
                                type="color"
                                className="w-20"
                                value={form.color}
                                onChange={(e) => {
                                    setForm(prev => ({
                                        ...prev,
                                        color: e.target.value,
                                        colorError: undefined // Clear error when using color picker
                                    }));
                                    setHasChanges(true);
                                }}
                            />
                            <Input
                                type="text"
                                className="flex-1"
                                placeholder="e.g. #FF0000 OR rgb(255,0,0) OR red"
                                value={form.color}
                                onChange={(e) => {
                                    const inputValue = e.target.value;
                                    setForm(prev => ({
                                        ...prev,
                                        color: inputValue,
                                        colorError: isValidColor(inputValue) ? undefined : "صيغة اللون غير صالحة"
                                    }));
                                    setHasChanges(true);
                                }}
                            />
                        </div>
                        {form.colorError && (
                            <p className="text-red-600 text-sm">{form.colorError}</p>
                        )}
                    </div>

                    <RecipientInput
                        type="email"
                        forAlarmType="threshold"
                        recipients={form.emails}
                        setRecipients={setEmails}
                        setHasChanges={setHasChanges}
                    />

                    <RecipientInput
                        type="phone"
                        forAlarmType="threshold"
                        recipients={form.phones}
                        setRecipients={setPhones}
                        setHasChanges={setHasChanges}
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
                                if (!form.thresholdError && !form.colorError && !alarmNameError) {
                                    onSubmit();
                                }
                            }}
                            disabled={isSubmitting || !hasChanges || !form.siteId || !form.alarmName || !form.field || !!form.thresholdError || !!form.colorError || !!alarmNameError || !form.operator || (form.emails.length === 0 && form.phones.length === 0)}
                            loadingText="جاري الحفظ..."
                            isLoading={isSubmitting}
                        >
                            حفظ التغييرات
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
