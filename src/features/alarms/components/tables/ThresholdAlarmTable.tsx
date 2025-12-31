import React from 'react';
import { useTranslation } from 'react-i18next';
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
import { Edit, Mail, Phone } from 'lucide-react';
import { ValueThresholdAlarm } from '../../types';
import { mapNumberToField, mapNumberToOperator } from '../../utils/alarmMappers';

interface ThresholdAlarmTableProps {
    alarms: ValueThresholdAlarm[];
    onEdit: (alarm: any) => void;
}

export function ThresholdAlarmTable({ alarms, onEdit }: ThresholdAlarmTableProps) {
    const { t } = useTranslation();
    const isRTL = t('_rtl') === 'rtl';
    // Arabic/RTL should align right, English/LTR should align left
    const textAlignClass = isRTL ? 'text-right' : 'text-left';

    const translateFieldName = (fieldName: string) => {
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
                <div className={textAlignClass}>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(alarm)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
        {
            key: 'color',
            header: t('alarms.color'),
            render: (alarm: ValueThresholdAlarm) => (
                <div className={textAlignClass}>
                    <div className="w-6 h-6 rounded border" style={{ backgroundColor: alarm.color }} />
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
            key: 'operator',
            header: t('alarms.operator'),
            render: (alarm: ValueThresholdAlarm) => (
                <div className={textAlignClass}>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {mapNumberToOperator[alarm.operator]} {alarm.threshold}
                    </code>
                </div>
            )
        },
        {
            key: 'emailRecipients',
            header: t('alarms.emailRecipients'),
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
            key: 'severity',
            header: t('alarms.severity'),
            render: (alarm: ValueThresholdAlarm) => (
                <div className={textAlignClass}>
                    <Badge variant="outline">{translateSeverity(alarm.severity)}</Badge>
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