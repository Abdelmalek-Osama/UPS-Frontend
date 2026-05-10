import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Edit, Mail, Phone, Trash2 } from 'lucide-react';
import { ValueThresholdAlarm } from '../../types';
import { mapNumberToField, mapNumberToOperator } from '../../utils/alarmMappers';

interface ThresholdAlarmTableProps {
    alarms: ValueThresholdAlarm[];
    onEdit: (alarm: any) => void;
    onDelete?: (alarmId: number) => void;
    error?: boolean;
}

export function ThresholdAlarmTable({ alarms, onEdit, onDelete, error }: ThresholdAlarmTableProps) {
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const isRTL = t('_rtl') === 'rtl';
    // Arabic/RTL should align right, English/LTR should align left
    const textAlignClass = isRTL ? 'text-right' : 'text-left';

    const translateFieldName = (fieldName?: unknown) => {
        if (typeof fieldName !== "string" || !fieldName.trim()) return "�";
        const normalized = fieldName.toLowerCase().replace(/_/g, ' ');
        if (normalized === 'communicationloss') {
            return t('alarms.communicationLoss');
        }
        if (normalized === 'battery') {
            return t('alarms.battery');
        }
        if (normalized === 'total flow') {
            return t('alarms.totalFlow');
        }
        if (normalized === 'total uptime') {
            return t('alarms.totalUptime');
        }
        return fieldName;
    };

    const translateSeverity = (severity: string) => {
        if (severity.toLowerCase() === 'warning') {
            return t('alarms.warning');
        }
        if (severity.toLowerCase() === 'critical') {
            return t('alarms.critical');
        }
        return severity;
    };

    // Define columns in logical order (English/LTR)
    const columns = [
        {
            key: 'actions',
            header: t('common.actions'),
            render: (alarm: ValueThresholdAlarm) => (
                <div className="flex gap-2 justify-center">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(alarm)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    {onDelete && currentUser?.role === 'Admin' && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onDelete(alarm.id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )
        },
        {
            key: 'emailRecipients',
            header: t('alarms.recipients'),
            render: (alarm: ValueThresholdAlarm) => (
                <div className={`flex flex-wrap gap-1 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                    {alarm.recipients && Array.isArray(alarm.recipients) && alarm.recipients.map((recipient, idx) => {
                        const isEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(recipient);
                        const isPhone = /^\d{11}$/.test(recipient);
                        return (
                            <Badge key={idx} variant="secondary" className="text-xs flex items-center">
                                {isEmail && <Mail className="ml-1 h-3 w-3" />}
                                {isPhone && <Phone className="ml-1 h-3 w-3" />}
                                {recipient}
                            </Badge>
                        );
                    })}
                </div>
            )
        },
        {
            key: 'field',
            header: t('alarms.field'),
            render: (alarm: ValueThresholdAlarm) => (
                <div className={textAlignClass}>
                    <Badge variant="outline">{translateFieldName(mapNumberToField[alarm.field])}</Badge>
                </div>
            )
        },
        {
            key: 'criticalThreshold',
            header: t('alarms.critical'),
            render: (alarm: ValueThresholdAlarm) => (
                <div className="text-center">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-center gap-1">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                {alarm.criticalOperator !== undefined ? mapNumberToOperator[alarm.criticalOperator] : (alarm.operator !== undefined ? mapNumberToOperator[alarm.operator] : '>')}
                            </code>
                            <span className="text-sm">
                                {alarm.criticalThresholdValue !== undefined ? alarm.criticalThresholdValue : alarm.threshold}
                            </span>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-6 h-6 rounded border" style={{ backgroundColor: alarm.criticalColorCode || alarm.color || '#fbbf24' }} title={alarm.criticalColorCode || alarm.color} />
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'crisisThreshold',
            header: t('alarms.crisis'),
            render: (alarm: ValueThresholdAlarm) => (
                <div className="text-center">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-center gap-1">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                {alarm.crisisOperator !== undefined ? mapNumberToOperator[alarm.crisisOperator] : '-'}
                            </code>
                            <span className="text-sm">
                                {alarm.crisisThresholdValue !== undefined ? alarm.crisisThresholdValue : '-'}
                            </span>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-6 h-6 rounded border" style={{ backgroundColor: alarm.crisisColorCode || '#db0202ff' }} title={alarm.crisisColorCode} />
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'site',
            header: t('alarms.site'),
            render: (alarm: ValueThresholdAlarm) => (
                <div className={textAlignClass} style={{ fontWeight: 'normal' }}>
                    {alarm.site}
                </div>
            )
        },
        {
            key: 'alarmName',
            header: t('alarms.alarmName'),
            render: (alarm: ValueThresholdAlarm) => (
                <div className={textAlignClass} style={{ fontWeight: 'normal' }}>
                    {alarm.alarmName}
                </div>
            )
        }
    ];

    // For RTL (Arabic): keep original order
    // For LTR (English): reverse the columns
    const displayColumns = isRTL ? columns : [...columns].reverse();

    if (error) {
        return (
            <div className="text-red-600 text-center py-8">
                {t('common.serverError')}
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {displayColumns.map((column) => (
                        <TableHead key={column.key} className={textAlignClass}>
                            {column.header}
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {alarms.map((alarm) => (
                    <TableRow key={alarm.id}>
                        {displayColumns.map((column) => (
                            <TableCell key={`${alarm.id}-${column.key}`}>
                                {column.render(alarm)}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}