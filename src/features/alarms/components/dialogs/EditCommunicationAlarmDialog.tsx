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
import { CommunicationAlarmForm, Site } from '../../types';

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
    setPhones
}: EditCommunicationAlarmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="text-right">تعديل تنبيه فقدان اتصال</DialogTitle>
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
                        <Label>عدد الساعات</Label>
                        <Input
                            type="number"
                            placeholder="2"
                            value={form.hours}
                            onChange={(e) => {
                                setForm(prev => ({
                                    ...prev,
                                    hours: parseInt(e.target.value) || 0
                                }));
                                setHasChanges(true);
                            }}
                        />
                        <p className="text-xs text-gray-500">
                            سيتم إرسال تنبيه إذا لم تصل بيانات لهذا العدد من الساعات
                        </p>
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
                    <div className="w-full flex justify-start gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            إلغاء
                        </Button>
                        <Button
                            onClick={onSubmit}
                            disabled={isSubmitting || !hasChanges || !form.siteId || !form.alarmName || !form.hours}
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
