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
import { ThresholdAlarmForm, Site } from '../../types';
import { OPERATORS, getOperatorLabels } from '../../utils/alarmConstants';
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
    const { t } = useTranslation();
    const [alarmNameError, setAlarmNameError] = React.useState<string | undefined>(undefined);
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

    const footerStyle: React.CSSProperties = {
        marginTop: 0
    };
    useEffect(() => {
        if (currentAlarm && currentAlarm.threshold < 0) {
            setForm(prev => ({
                ...prev,
                thresholdError: t('validation.invalidNumber')
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
        <DialogContent 
    className="w-[95vw] max-w-[600px] sm:max-w-lg flex flex-col p-0"
    style={{
        height: '80vh',
        maxHeight: '80vh',
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
                        {t('alarms.editThresholdAlarm')}
                    </DialogTitle>
                    <DialogDescription className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                        {t('alarms.editThresholdAlarmDescription')}
                    </DialogDescription>
                </DialogHeader>
            </div>

            {/* Scrollable Content - THIS MUST HAVE flex-1 */}
            <div style={scrollContainerStyle}>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>{t('alarms.site')}</Label>
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
                        <Label>{t('alarms.field')}</Label>
                        <Select
                            onValueChange={(value) => {
                                setForm(prev => ({
                                    ...prev,
                                    field: value
                                }));
                                setHasChanges(true);
                            }}
                            value={form.field}
                            dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                        >
                            <SelectTrigger className="rtl:flex-row-reverse">
                                <SelectValue placeholder={t('alarms.field')} />
                            </SelectTrigger>
                            <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                                {availableFields.map(field => (
                                    <SelectItem key={field} value={field}>{field}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{t('alarms.operator')}</Label>
                            <Select
                                onValueChange={(value) => {
                                    setForm(prev => ({
                                        ...prev,
                                        operator: value
                                    }));
                                    setHasChanges(true);
                                }}
                                value={form.operator}
                                dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                            >
                                <SelectTrigger className="rtl:flex-row-reverse">
                                    <SelectValue placeholder={t('alarms.operator')} />
                                </SelectTrigger>
                                <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                                    {OPERATORS.map(op => (
                                        <SelectItem key={op} value={op}>{getOperatorLabels(t)[op] || op}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t('alarms.threshold')}</Label>
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
                                            thresholdError: t('validation.invalidNumber')
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
                        <Label>{t('alarms.severity')}</Label>
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
                                <SelectItem value="Warning">{t('alarms.warning')}</SelectItem>
                                <SelectItem value="Critical">{t('alarms.critical')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('alarms.color')}</Label>
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
                                        colorError: isValidColor(inputValue) ? undefined : t('alarms.invalidColorFormat')
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
            </div>

            {/* Fixed Footer */}
            <div className="px-6 py-4 flex-shrink-0 border-t border-border">
                <DialogFooter>
                    {submissionError && (
                        <p className="text-red-600 text-sm text-center w-full mb-4">{t(`errors.${submissionError}`, submissionError)}</p>
                    )}
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: t('_rtl') === 'rtl' ? 'flex-end' : 'flex-end',
                        gap: '0.5rem',
                        flexDirection: 'row'
                    }}>
                        <Button
                            onClick={() => {
                                if (!form.thresholdError && !form.colorError && !alarmNameError) {
                                    onSubmit();
                                }
                            }}
                            disabled={isSubmitting || !hasChanges || !form.siteId || !form.alarmName || !form.field || !!form.thresholdError || !!form.colorError || !!alarmNameError || !form.operator || (form.emails.length === 0 && form.phones.length === 0)}
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
