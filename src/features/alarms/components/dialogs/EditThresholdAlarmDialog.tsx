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
import { ThresholdAlarmForm, Site } from '../../types';
import { OPERATORS } from '../../utils/alarmConstants';

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
    setPhones
}: EditThresholdAlarmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="text-right">تعديل تنبيه قيمة حدية</DialogTitle>
                    <DialogDescription className="text-right">
                        تعديل تكوين التنبيه الحالي
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
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
                                setHasChanges(true);
                            }}
                        />
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
                                        <SelectItem key={op} value={op}>{op}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>القيمة الحدية</Label>
                            <Input
                                type="number"
                                step="0.1"
                                placeholder="12.5"
                                value={form.threshold}
                                onChange={(e) => {
                                    setForm(prev => ({
                                        ...prev,
                                        threshold: parseFloat(e.target.value) || 0
                                    }));
                                    setHasChanges(true);
                                }}
                            />
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
                                        color: e.target.value
                                    }));
                                    setHasChanges(true);
                                }}
                            />
                            <Input
                                type="text"
                                className="flex-1"
                                value={form.color}
                                onChange={(e) => {
                                    setForm(prev => ({
                                        ...prev,
                                        color: e.target.value
                                    }));
                                    setHasChanges(true);
                                }}
                            />
                        </div>
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
                    <div className="w-full flex justify-start gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            إلغاء
                        </Button>
                        <Button
                            onClick={onSubmit}
                            disabled={isSubmitting || !hasChanges || !form.siteId || !form.alarmName || !form.field || !form.operator}
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
