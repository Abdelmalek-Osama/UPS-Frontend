import React, { useEffect, useRef } from 'react';
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
import { OPERATORS, INITIAL_THRESHOLD_FORM, getOperatorLabels } from '../../utils/alarmConstants';
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

interface AddThresholdAlarmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: ThresholdAlarmForm;
    setForm: React.Dispatch<React.SetStateAction<ThresholdAlarmForm>>;
    sites: Site[];
    sitesLoading: boolean;
    sitesError: string | null;
    availableFields: string[];
    onSubmit: () => void;
    isSubmitting: boolean;
    setEmails: (emails: string[]) => void;
    setPhones: (phones: string[]) => void;
    submissionError: string | null;
}

export const AddThresholdAlarmDialog = React.forwardRef<HTMLDivElement, AddThresholdAlarmDialogProps>((
    {open,
    onOpenChange,
    form,
    setForm,
    sites,
    sitesLoading,
    sitesError,
    availableFields,
    onSubmit,
    isSubmitting,
    setEmails,
    setPhones,
    submissionError
}: AddThresholdAlarmDialogProps, ref) => {
    const { t } = useTranslation();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [alarmNameError, setAlarmNameError] = React.useState<string | undefined>(undefined);

    // Auto-scroll to bottom when emails or phones are added
    useEffect(() => {
        if (scrollContainerRef.current && (form.emails.length > 0 || form.phones.length > 0)) {
            const scrollContainer = scrollContainerRef.current;
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [form.emails.length, form.phones.length]);

    // Style objects
    const dialogContentStyle: React.CSSProperties = {
        width: '95vw',
        maxWidth: '600px',
        height: '80vh',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        
    };

    const headerContainerStyle: React.CSSProperties = {
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        paddingTop: '1.5rem',
        paddingBottom: '1rem',
        flexShrink: 0,
        borderBottom: '1px solid hsl(var(--border))'
    };

    // const titleStyle: React.CSSProperties = {
    //     textAlign: 'right'
    // };

    // const descriptionStyle: React.CSSProperties = {
    //     textAlign: 'right'
    // };

    const scrollContainerStyle: React.CSSProperties = {
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        minHeight: 0,
        WebkitOverflowScrolling: 'touch',
        height: 0
    };

    const contentWrapperStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    };

    const fieldContainerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    };

    const gridContainerStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '1rem'
    };

    const colorInputContainerStyle: React.CSSProperties = {
        display: 'flex',
        gap: '0.5rem'
    };

    const colorPickerStyle: React.CSSProperties = {
        width: '5rem'
    };

    const colorInputStyle: React.CSSProperties = {
        flex: 1
    };

    const errorTextStyle: React.CSSProperties = {
        color: '#dc2626',
        fontSize: '0.875rem'
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

    const submissionErrorStyle: React.CSSProperties = {
        color: '#dc2626',
        fontSize: '0.875rem',
        textAlign: 'center',
        width: '100%',
        marginBottom: '1rem'
    };

    const footerButtonsContainerStyle: React.CSSProperties = {
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.5rem',
        flexDirection: 'row'
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            if (!newOpen) {
                setForm({ ...INITIAL_THRESHOLD_FORM });
                setAlarmNameError(undefined);
            }
            onOpenChange(newOpen);
        }}>
            <DialogContent 
    ref={ref} 
    className="w-[95vw] max-w-[600px] h-[80vh] max-h-[80vh] flex flex-col p-0 overflow-hidden sm:max-w-lg"
    style={{
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden'
    }}
    dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
>
                <div style={headerContainerStyle}>
                    <DialogHeader>
                        <DialogTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            {t('alarms.addThresholdAlarm')}
                        </DialogTitle>
                        <DialogDescription className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            {t('alarms.thresholdAlarmFormula')}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div ref={scrollContainerRef} style={scrollContainerStyle}>
                    <div style={contentWrapperStyle}>
                        <div style={fieldContainerStyle}>
                            <Label>{t('alarms.site')}</Label>
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
                        </div>

                        <div style={fieldContainerStyle}>
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
                                }}
                            />
                            {alarmNameError && (
                                <p style={errorTextStyle}>{alarmNameError}</p>
                            )}
                        </div>

                        <div style={fieldContainerStyle}>
                            <Label>{t('alarms.field')}</Label>
                            <Select
                                onValueChange={(value) => setForm(prev => ({
                                    ...prev,
                                    field: value
                                }))}
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

                        <div style={gridContainerStyle}>
                            <div style={fieldContainerStyle}>
                                <Label>{t('alarms.operator')}</Label>
                                <Select
                                    onValueChange={(value) => setForm(prev => ({
                                        ...prev,
                                        operator: value
                                    }))}
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

                            <div style={fieldContainerStyle}>
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
                                    }}
                                />
                                {form.thresholdError && (
                                    <p style={errorTextStyle}>{form.thresholdError}</p>
                                )}
                            </div>
                        </div>

                        <div style={fieldContainerStyle}>
                            <Label>{t('alarms.severity')}</Label>
                            <Select
                                onValueChange={(value: 'Warning' | 'Critical') => setForm(prev => ({
                                    ...prev,
                                    severity: value
                                }))}
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

                        <div style={fieldContainerStyle}>
                            <Label>{t('alarms.color')}</Label>
                            <div style={colorInputContainerStyle}>
                                <Input
                                    type="color"
                                    style={colorPickerStyle}
                                    value={form.color}
                                    onChange={(e) => setForm(prev => ({
                                        ...prev,
                                        color: e.target.value,
                                        colorError: undefined // Clear error when using color picker
                                    }))}
                                />
                                <Input
                                    type="text"
                                    style={colorInputStyle}
                                    placeholder="e.g. #FF0000 OR rgb(255,0,0) OR red"
                                    value={form.color}
                                    onChange={(e) => {
                                        const inputValue = e.target.value;
                                        setForm(prev => ({
                                            ...prev,
                                            color: inputValue,
                                            colorError: isValidColor(inputValue) ? undefined : t('alarms.invalidColorFormat')
                                        }));
                                    }}
                                />
                            </div>
                            {form.colorError && (
                                <p style={errorTextStyle}>{form.colorError}</p>
                            )}
                        </div>

                        <RecipientInput
                            type="email"
                            forAlarmType="threshold"
                            recipients={form.emails}
                            setRecipients={setEmails}
                            setHasChanges={() => { }}
                        />

                        <RecipientInput
                            type="phone"
                            forAlarmType="threshold"
                            recipients={form.phones}
                            setRecipients={setPhones}
                            setHasChanges={() => { }}
                        />
                    </div>
                </div>

                <div style={footerContainerStyle}>
                    <DialogFooter style={footerStyle}>
                        {submissionError && (
                            <p style={submissionErrorStyle}>{t(`errors.${submissionError}`, submissionError)}</p>
                        )}
                        <div style={footerButtonsContainerStyle}>
                            <Button
                                onClick={() => {
                                    if (!form.thresholdError && !form.colorError && !alarmNameError) {
                                        onSubmit();
                                    }
                                }}
                                disabled={isSubmitting || !form.siteId || !form.alarmName || !form.field || !form.operator || !!form.thresholdError || !!form.colorError || !!alarmNameError || (form.emails.length === 0 && form.phones.length === 0)}
                                loadingText={t('alarms.addingAlarm')}
                                isLoading={isSubmitting}
                            >
                                {t('alarms.addThresholdAlarm')}
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
});
