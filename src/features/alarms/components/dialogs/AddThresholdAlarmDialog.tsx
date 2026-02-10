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
import { AlarmSiteSelector } from '../AlarmSiteSelector';
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

    // Helper function to translate field names
    const translateFieldName = (fieldName: string): string => {
        const translations: { [key: string]: string } = {
            'USWL': t('readings.uswl'),
            'DSWL1': t('readings.dswL1'),
            'DSWL2': t('readings.dswL2'),
            'Battery': t('readings.battery'),
            'P1_Time': t('readings.p1Time'),
            'P1_Flow': t('readings.p1Flow'),
            'P2_Time': t('readings.p2Time'),
            'P2_Flow': t('readings.p2Flow'),
            'P3_Time': t('readings.p3Time'),
            'P3_Flow': t('readings.p3Flow'),
            'P4_Time': t('readings.p4Time'),
            'P4_Flow': t('readings.p4Flow'),
            'P5_Time': t('readings.p5Time'),
            'P5_Flow': t('readings.p5Flow'),
            'P6_Time': t('readings.p6Time'),
            'P6_Flow': t('readings.p6Flow'),
            'P7_Time': t('readings.p7Time'),
            'P7_Flow': t('readings.p7Flow'),
            'P8_Time': t('readings.p8Time'),
            'P8_Flow': t('readings.p8Flow'),
            'P9_Time': t('readings.p9Time'),
            'P9_Flow': t('readings.p9Flow'),
            'P10_Time': t('readings.p10Time'),
            'P10_Flow': t('readings.p10Flow'),
            'Calculated_flow': t('readings.calculatedFlow'),
            'Total_uptime': t('readings.totalUptime'),
            'Total_flow': t('readings.totalFlow'),
        };
        return translations[fieldName] || fieldName;
    };

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
        marginBottom: '1rem',
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
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
        minWidth: '500px',
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
                        
                    </DialogHeader>
                </div>

                <div ref={scrollContainerRef} style={scrollContainerStyle}>
                    <div style={contentWrapperStyle}>
                        
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
    <Label>{t('alarms.site')}</Label>
    <AlarmSiteSelector
     sites={sites}
   sitesLoading={sitesLoading}
             selectedSiteId={form.siteId}
           onSiteSelect={(siteId) => setForm(prev => ({
             ...prev,
           siteId: siteId ? Number(siteId) : 0
       }))}
         placeholder={t('readings.selectSite')}
  />
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
                                        <SelectItem key={field} value={field}>{translateFieldName(field)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Critical Threshold Section */}
                        <div style={{...fieldContainerStyle, backgroundColor: 'hsl(var(--muted))', padding: '0.75rem', borderRadius: '0.375rem'}}>
                            <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#dc2626' }}>
                                {t('alarms.critical')}
                            </h3>
                            
                            <div style={gridContainerStyle}>
                                <div style={fieldContainerStyle}>
                                    <Label>{t('alarms.operator')}</Label>
                                    <Select
                                        onValueChange={(value) => setForm(prev => ({
                                            ...prev,
                                            criticalOperator: value
                                        }))}
                                        value={form.criticalOperator}
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
                                        placeholder="e.g. 5"
                                        value={form.criticalThresholdValue}
                                        onChange={(e) => {
                                            const inputValue = e.target.value;
                                            const parsedValue = parseFloat(inputValue);

                                            if (inputValue === '') {
                                                setForm(prev => ({
                                                    ...prev,
                                                    criticalThresholdValue: 0,
                                                    criticalThresholdError: undefined
                                                }));
                                            } else if (isNaN(parsedValue) || parsedValue < 0) {
                                                setForm(prev => ({
                                                    ...prev,
                                                    criticalThresholdValue: Math.max(0, parsedValue),
                                                    criticalThresholdError: t('validation.invalidNumber')
                                                }));
                                            } else {
                                                setForm(prev => ({
                                                    ...prev,
                                                    criticalThresholdValue: parsedValue,
                                                    criticalThresholdError: undefined
                                                }));
                                            }
                                        }}
                                    />
                                    {form.criticalThresholdError && (
                                        <p style={errorTextStyle}>{form.criticalThresholdError}</p>
                                    )}
                                </div>
                            </div>

                            <div style={fieldContainerStyle}>
                                <Label>{t('alarms.color')}</Label>
                                <div style={colorInputContainerStyle}>
                                    <Input
                                        type="color"
                                        style={colorPickerStyle}
                                        value={form.criticalColorCode}
                                        onChange={(e) => setForm(prev => ({
                                            ...prev,
                                            criticalColorCode: e.target.value,
                                            criticalColorError: undefined
                                        }))}
                                    />
                                    <Input
                                        type="text"
                                        style={colorInputStyle}
                                        placeholder="e.g. #FF0000 OR rgb(255,0,0)"
                                        value={form.criticalColorCode}
                                        onChange={(e) => {
                                            const inputValue = e.target.value;
                                            setForm(prev => ({
                                                ...prev,
                                                criticalColorCode: inputValue,
                                                criticalColorError: isValidColor(inputValue) ? undefined : t('alarms.invalidColorFormat')
                                            }));
                                        }}
                                    />
                                </div>
                                {form.criticalColorError && (
                                    <p style={errorTextStyle}>{form.criticalColorError}</p>
                                )}
                            </div>
                        </div>

                        {/* Crisis Threshold Section */}
                        <div style={{...fieldContainerStyle, backgroundColor: 'hsl(var(--muted))', padding: '0.75rem', borderRadius: '0.375rem'}}>
                            <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#991b1b' }}>
                                {t('alarms.crisis')}
                            </h3>
                            
                            <div style={gridContainerStyle}>
                                <div style={fieldContainerStyle}>
                                    <Label>{t('alarms.operator')}</Label>
                                    <Select
                                        onValueChange={(value) => setForm(prev => ({
                                            ...prev,
                                            crisisOperator: value
                                        }))}
                                        value={form.crisisOperator}
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
                                        placeholder="e.g. 3"
                                        value={form.crisisThresholdValue}
                                        onChange={(e) => {
                                            const inputValue = e.target.value;
                                            const parsedValue = parseFloat(inputValue);

                                            if (inputValue === '') {
                                                setForm(prev => ({
                                                    ...prev,
                                                    crisisThresholdValue: 0,
                                                    crisisThresholdError: undefined
                                                }));
                                            } else if (isNaN(parsedValue) || parsedValue < 0) {
                                                setForm(prev => ({
                                                    ...prev,
                                                    crisisThresholdValue: Math.max(0, parsedValue),
                                                    crisisThresholdError: t('validation.invalidNumber')
                                                }));
                                            } else {
                                                setForm(prev => ({
                                                    ...prev,
                                                    crisisThresholdValue: parsedValue,
                                                    crisisThresholdError: undefined
                                                }));
                                            }
                                        }}
                                    />
                                    {form.crisisThresholdError && (
                                        <p style={errorTextStyle}>{form.crisisThresholdError}</p>
                                    )}
                                </div>
                            </div>

                            <div style={fieldContainerStyle}>
                                <Label>{t('alarms.color')}</Label>
                                <div style={colorInputContainerStyle}>
                                    <Input
                                        type="color"
                                        style={colorPickerStyle}
                                        value={form.crisisColorCode}
                                        onChange={(e) => setForm(prev => ({
                                            ...prev,
                                            crisisColorCode: e.target.value,
                                            crisisColorError: undefined
                                        }))}
                                    />
                                    <Input
                                        type="text"
                                        style={colorInputStyle}
                                        placeholder="e.g. #F2DCD8 OR rgb(242,220,216)"
                                        value={form.crisisColorCode}
                                        onChange={(e) => {
                                            const inputValue = e.target.value;
                                            setForm(prev => ({
                                                ...prev,
                                                crisisColorCode: inputValue,
                                                crisisColorError: isValidColor(inputValue) ? undefined : t('alarms.invalidColorFormat')
                                            }));
                                        }}
                                    />
                                </div>
                                {form.crisisColorError && (
                                    <p style={errorTextStyle}>{form.crisisColorError}</p>
                                )}
                            </div>
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
                                    if (!form.criticalThresholdError && !form.criticalColorError && !form.crisisThresholdError && !form.crisisColorError && !alarmNameError) {
                                        onSubmit();
                                    }
                                }}
                                disabled={isSubmitting || !form.siteId || !form.alarmName || !form.field || !form.criticalOperator || !form.crisisOperator || !!form.criticalThresholdError || !!form.criticalColorError || !!form.crisisThresholdError || !!form.crisisColorError || !!alarmNameError || (form.emails.length === 0 && form.phones.length === 0)}
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
