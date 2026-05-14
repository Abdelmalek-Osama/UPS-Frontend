import React, { useRef, useMemo } from 'react';
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
import { Textarea } from '../../../../components/ui/textarea';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '../../../../components/ui/select';
import { RecipientInput } from '../RecipientInput';
import { SensorStatusForm, Site } from '../../types';
import { useAuth } from '../../../../shared/contexts/AuthContext';

interface EditSensorStatusAlarmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: SensorStatusForm;
    setForm: React.Dispatch<React.SetStateAction<SensorStatusForm>>;
    currentAlarm: SensorStatusForm | null;
    sites: Site[];
    sitesLoading: boolean;
    sitesError: string | null;
    configLoading?: boolean;
    siteError?: string | null;
    onSubmit: () => void;
    isSubmitting: boolean;
    hasChanges: boolean;
    setHasChanges: (hasChanges: boolean) => void;
    setEmails: (emails: string[]) => void;
    setPhones: (phones: string[]) => void;
    submissionError: string | null;
    availableFields?: string[];
}

export function EditSensorStatusAlarmDialog({
    open,
    onOpenChange,
    form,
    setForm,
    currentAlarm,
    sites,
    sitesLoading,
    sitesError,
    configLoading = false,
    siteError = null,
    onSubmit,
    isSubmitting,
    hasChanges,
    setHasChanges,
    setEmails,
    setPhones,
    submissionError,
    availableFields = []
}: EditSensorStatusAlarmDialogProps) {
    const { t } = useTranslation();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { currentUser } = useAuth();
    const isOperator = currentUser?.role === 'Operator';

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

    const handleSiteChange = (value: string) => {
        const selected = sites.find(site => site.id.toString() === value);
        if (selected) {
            setForm(prev => ({ 
                ...prev, 
                siteId: selected.id, 
                site: selected.name 
            }));
            setHasChanges(true);
        }
    };

    const translateFieldName = (fieldName: string): string => {
        const fieldTranslations: { [key: string]: string } = {
            'USWL': t('alarms.USWL') || 'USWL',
            'DSWL1': t('alarms.DSWL1') || 'DSWL1',
            'DSWL2': t('alarms.DSWL2') || 'DSWL2',
            'Calculated_flow': t('readings.calculatedFlow') || 'Calculated Flow',
            'Battery': t('readings.battery') || 'Battery',
            'Total_flow': t('readings.totalFlow') || 'Total Flow',
            'Total_uptime': t('readings.totalUptime') || 'Total Uptime',
            'P1_Time': t('readings.p1Time') || 'P1 Time',
            'P1_Flow': t('readings.p1Flow') || 'P1 Flow',
            'P2_Time': t('readings.p2Time') || 'P2 Time',
            'P2_Flow': t('readings.p2Flow') || 'P2 Flow',
            'P3_Time': t('readings.p3Time') || 'P3 Time',
            'P3_Flow': t('readings.p3Flow') || 'P3 Flow',
            'P4_Time': t('readings.p4Time') || 'P4 Time',
            'P4_Flow': t('readings.p4Flow') || 'P4 Flow',
            'P5_Time': t('readings.p5Time') || 'P5 Time',
            'P5_Flow': t('readings.p5Flow') || 'P5 Flow',
            'P6_Time': t('readings.p6Time') || 'P6 Time',
            'P6_Flow': t('readings.p6Flow') || 'P6 Flow',
            'P7_Time': t('readings.p7Time') || 'P7 Time',
            'P7_Flow': t('readings.p7Flow') || 'P7 Flow',
            'P8_Time': t('readings.p8Time') || 'P8 Time',
            'P8_Flow': t('readings.p8Flow') || 'P8 Flow',
            'P9_Time': t('readings.p9Time') || 'P9 Time',
            'P9_Flow': t('readings.p9Flow') || 'P9 Flow',
            'P10_Time': t('readings.p10Time') || 'P10 Time',
            'P10_Flow': t('readings.p10Flow') || 'P10 Flow'
        };
        return fieldTranslations[fieldName] || fieldName;
    };

    // Ensure current field value is included in available fields to prevent Select warnings
    const fieldsToDisplay = useMemo(() => {
        if (!form.field || !form.siteId) {
            return availableFields;
        }
        // Include the current field value even if it's not in availableFields yet
        const fieldsSet = new Set(availableFields);
        if (form.field) {
            fieldsSet.add(form.field);
        }
        return Array.from(fieldsSet);
    }, [form.field, form.siteId, availableFields]);

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            onOpenChange(newOpen);
        }}>
            <DialogContent 
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
                            {t('alarms.editSensorStatusAlarm')}
                        </DialogTitle>
                        <DialogDescription className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            {t('alarms.SensorStatusAlarms')}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div ref={scrollContainerRef} style={scrollContainerStyle}>
                    <div style={contentWrapperStyle}>
                        <div style={fieldContainerStyle}>
                            <Label>{t('alarms.alarmName')}</Label>
                            <Input
                                disabled={isOperator}
                                type="text"
                                value={form.alarmName}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, alarmName: e.target.value }));
                                    setHasChanges(true);
                                }}
                                placeholder={t('alarms.alarmName')}
                            />
                        </div>

                        <div style={fieldContainerStyle}>
                            <Label>{t('alarms.site')}</Label>
                            {currentAlarm ? (
                                <Input type="text" value={form.site} disabled />
                            ) : (
                                <Select
                                    onValueChange={handleSiteChange}
                                    disabled={isOperator}
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
                            {siteError && (
                                <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{t(siteError)}</p>
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
                                disabled={isOperator || !form.siteId}
                                dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                            >
                                <SelectTrigger className="rtl:flex-row-reverse">
                                    <SelectValue placeholder={!form.siteId ? t('alarms.selectSiteFirst') : t('alarms.field')} />
                                </SelectTrigger>
                                <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                                    {fieldsToDisplay.length > 0 ? (
                                        fieldsToDisplay.map(field => (
                                            <SelectItem key={field} value={field}>{translateFieldName(field)}</SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="0" disabled>{t('alarms.selectSiteFirst')}</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div style={fieldContainerStyle}>
                            <Label>{t('alarms.threshold')}</Label>
                            <Select
                                onValueChange={(value) => {
                                    setForm(prev => ({ ...prev, threshold: parseFloat(value) }));
                                    setHasChanges(true);
                                }}
                                value={form.threshold.toString()}
                                dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                            >
                                <SelectTrigger className="rtl:flex-row-reverse">
                                    <SelectValue placeholder={t('alarms.threshold')} />
                                </SelectTrigger>
                                <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                                    <SelectItem value="777">777</SelectItem>
                                    <SelectItem value="888">888</SelectItem>
                                    <SelectItem value="999">999</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div style={fieldContainerStyle}>
                            <Label>{t('alarms.message')}</Label>
                            <Textarea
                                className="resize-none"
                                value={form.message}
                                rows={4}
                                onChange={(e) => {
                                    setForm(prev => ({ ...prev, message: e.target.value }));
                                    setHasChanges(true);
                                }}
                                placeholder={t('alarms.message')}
                                disabled={isOperator}
                            />
                        </div>

                        <RecipientInput
                            type="email"
                            forAlarmType="sensorStatus"
                            recipients={form.emails}
                            setRecipients={setEmails}
                            setHasChanges={setHasChanges}
                            disabled={isOperator}
                        />

                        <RecipientInput
                            type="phone"
                            forAlarmType="sensorStatus"
                            recipients={form.phones}
                            setRecipients={setPhones}
                            setHasChanges={setHasChanges}
                            disabled={isOperator}
                        />
                    </div>
                </div>

                <div style={footerContainerStyle}>
                    <DialogFooter style={footerStyle}>
                        {submissionError && (
                            <p style={submissionErrorStyle}>{t(`errors.${submissionError}`, submissionError)}</p>
                        )}
                        {form.emails.length === 0 && form.phones.length === 0 && (
                            <p style={submissionErrorStyle}>{t('alarms.atLeastOneRecipient')}</p>
                        )}
                        <div style={footerButtonsContainerStyle}>
                            <Button
                                onClick={() => {
                                    onSubmit();
                                }}
                                disabled={isSubmitting || !hasChanges || !form.siteId || (form.emails.length === 0 && form.phones.length === 0)}
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
