import React, { useEffect, useMemo } from 'react';
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
import { User } from '../../../auth/types';

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
    currentUser: User | null;
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
    submissionError,
    currentUser
}: EditThresholdAlarmDialogProps) {
    const { t } = useTranslation();
    const [alarmNameError, setAlarmNameError] = React.useState<string | undefined>(undefined);
    
    // Check if user is an operator
    const isOperator = currentUser?.role === 'Operator';
    
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

    // Ensure current field value is included in available fields to prevent Select warnings
    const fieldsToDisplay = useMemo(() => {
        if (!form.field) {
            return availableFields;
        }
        // Include the current field value even if it's not in availableFields yet
        const fieldsSet = new Set(availableFields);
        if (form.field) {
            fieldsSet.add(form.field);
        }
        return Array.from(fieldsSet);
    }, [form.field, availableFields]);
    
    // Style objects - matching AddThresholdAlarmDialog
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

   return (
    <Dialog open={open} onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
    }}>
        <DialogContent 
    className="w-[95vw] max-w-[600px] sm:max-w-lg flex flex-col p-0"
    style={{
        height: '80vh',
        maxHeight: '80vh',
        minWidth: '500px',
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
                                setHasChanges(true);
                            }}
                            disabled={isOperator}
                        />
                        {alarmNameError && (
                            <p style={errorTextStyle}>{alarmNameError}</p>
                        )}
                    </div>
                    <div style={fieldContainerStyle}>
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
                                            <SelectItem key={site.id} value={site.id.toString()}>{t('_rtl') === 'rtl' ? site.arabicName : site.name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>


                    <div style={fieldContainerStyle}>
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
                            disabled={isOperator}
                        >
                            <SelectTrigger className="rtl:flex-row-reverse">
                                <SelectValue placeholder={t('alarms.field')} />
                            </SelectTrigger>
                            <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                                {fieldsToDisplay.map(field => (
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
                                    onValueChange={(value) => {
                                        setForm(prev => ({
                                            ...prev,
                                            criticalOperator: value
                                        }));
                                        setHasChanges(true);
                                    }}
                                    value={form.criticalOperator}
                                    dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                                    disabled={isOperator}
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
                                        setHasChanges(true);
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
                                    onChange={(e) => {
                                        setForm(prev => ({
                                            ...prev,
                                            criticalColorCode: e.target.value,
                                            criticalColorError: undefined
                                        }));
                                        setHasChanges(true);
                                    }}
                                    disabled={isOperator}
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
                                        setHasChanges(true);
                                    }}
                                    disabled={isOperator}
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
                                    onValueChange={(value) => {
                                        setForm(prev => ({
                                            ...prev,
                                            crisisOperator: value
                                        }));
                                        setHasChanges(true);
                                    }}
                                    value={form.crisisOperator}
                                    dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                                    disabled={isOperator}
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
                                        setHasChanges(true);
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
                                    onChange={(e) => {
                                        setForm(prev => ({
                                            ...prev,
                                            crisisColorCode: e.target.value,
                                            crisisColorError: undefined
                                        }));
                                        setHasChanges(true);
                                    }}
                                    disabled={isOperator}
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
                                        setHasChanges(true);
                                    }}
                                    disabled={isOperator}
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
                        setHasChanges={setHasChanges}
                        disabled={isOperator}
                    />

                    <RecipientInput
                        type="phone"
                        forAlarmType="threshold"
                        recipients={form.phones}
                        setRecipients={setPhones}
                        setHasChanges={setHasChanges}
                        disabled={isOperator}
                    />
                </div>
            </div>

            {/* Fixed Footer */}
            <div style={footerContainerStyle}>
                <DialogFooter>
                    {submissionError && (
                        <p style={{...errorTextStyle, textAlign: 'center', width: '100%', marginBottom: '1rem', wordBreak: 'break-word', overflowWrap: 'break-word'}}>{t(`errors.${submissionError}`, submissionError)}</p>
                    )}
                    {form.emails.length === 0 && form.phones.length === 0 && (
                        <p style={{...errorTextStyle, textAlign: 'center', width: '100%', marginBottom: '1rem', wordBreak: 'break-word', overflowWrap: 'break-word'}}>{t('alarms.atLeastOneRecipient')}</p>
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
                                if (!form.criticalThresholdError && !form.criticalColorError && !form.crisisThresholdError && !form.crisisColorError && !alarmNameError) {
                                    onSubmit();
                                }
                            }}
                            disabled={isSubmitting || !hasChanges || !form.siteId || !form.alarmName || !form.field || !!form.criticalThresholdError || !!form.criticalColorError || !!form.crisisThresholdError || !!form.crisisColorError || !!alarmNameError || !form.criticalOperator || !form.crisisOperator || (form.emails.length === 0 && form.phones.length === 0)}
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
