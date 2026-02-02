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
import { SensorStatusResponse } from '../../types';
import { mapNumberToField, mapNumberToOperator } from '../../utils/alarmMappers';

interface SensorStatusResponseTableProps {
    alarms: SensorStatusResponse[];
    onEdit: (alarm: any) => void;
    error?: boolean;
}

export function SensorStatusTable({ alarms, onEdit, error }: SensorStatusResponseTableProps) {
    const { t } = useTranslation();
    const isRTL = t('_rtl') === 'rtl';
    // Arabic/RTL should align right, English/LTR should align left
    const textAlignClass = isRTL ? 'text-right' : 'text-left';

   // Define columns in logical order (English/LTR)
    const columns = [
        {
            key: 'actions',
            header: t('common.actions'),
            render: (alarm: SensorStatusResponse) => (
                <div className={textAlignClass}>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(alarm)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                </div>
            )
        },
        {
            key: 'emailRecipients',
            header: t('alarms.emailRecipients'),
            render: (alarm: SensorStatusResponse) => (
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
            key: 'message',
            header: t('alarms.message'),
            render: (alarm: SensorStatusResponse) => (
                <div className={textAlignClass} style={{ fontWeight: 'normal' }}>
                    {alarm.message}
                </div>
            )
        },
        {
            key: 'readingValue',
            header: t('alarms.readingValue'),
            render: (alarm: SensorStatusResponse) => (
                <div className={textAlignClass} style={{ fontWeight: 'normal' }}>
                    {alarm.readingValue}
                </div>
            )
        },
        {
            key: 'threshold',
            header: t('alarms.threshold'),
            render: (alarm: SensorStatusResponse) => (
                <div className={textAlignClass} style={{ fontWeight: 'normal' }}>
                    {alarm.threshold}
                </div>
            )
        },
        {
            key: 'field',
            header: t('alarms.field'),
            render: (alarm: SensorStatusResponse) => (
                <div className={textAlignClass} style={{ fontWeight: 'normal' }}>
                    {alarm.field}
                </div>
            )
        },
        {
            key: 'site',
            header: t('alarms.site'),
            render: (alarm: SensorStatusResponse) => (
                <div className={textAlignClass} style={{ fontWeight: 'normal' }}>
                    {alarm.site}
                </div>
            )
        },
        {
            key: 'alarmName',
            header: t('alarms.alarmName'),
            render: (alarm: SensorStatusResponse) => (
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
                    <TableRow key={alarm.alarmId}>
                        {displayColumns.map((column) => (
                            <TableCell key={`${alarm.alarmId}-${column.key}`}>
                                {column.render(alarm)}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}