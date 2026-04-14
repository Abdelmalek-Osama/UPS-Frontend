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
import { Edit, Mail, Phone, Trash2 } from 'lucide-react';
import { PumpStatusIdvResponse } from '../../types';
import { mapNumberToField, mapNumberToOperator } from '../../utils/alarmMappers';

interface PumpStatusIdvResponseTableProps {
    alarms: PumpStatusIdvResponse[];
    onEdit: (alarm: any) => void;
    onDelete?: (alarmId: number) => void;
    error?: boolean;
}

export function PumpStatusIdvTable({ alarms, onEdit, onDelete, error }: PumpStatusIdvResponseTableProps) {
    const { t } = useTranslation();
    const isRTL = t('_rtl') === 'rtl';
    // Arabic/RTL should align right, English/LTR should align left
    const textAlignClass = isRTL ? '!text-right' : 'text-left';

    // const translateFieldName = (fieldName: string) => {
    //     const normalized = fieldName.toLowerCase().replace(/_/g, ' ');
    //     if (normalized === 'communicationloss') {
    //         return t('alarms.communicationLoss');
    //     }
    //     if (normalized === 'battery') {
    //         return t('alarms.battery');
    //     }
    //     if (normalized === 'total flow') {
    //         return t('alarms.totalFlow');
    //     }
    //     if (normalized === 'total uptime') {
    //         return t('alarms.totalUptime');
    //     }
    //     return fieldName;
    // };


    // Define columns in logical order (English/LTR)
    const columns = [
        {
            key: 'actions',
            header: t('common.actions'),
            headerClassName: 'text-center',
            render: (alarm: PumpStatusIdvResponse) => (
                <div className="flex gap-2 justify-center">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(alarm)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    {onDelete && (
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
            key: 'monitoringHours',
            header: t('alarms.monitoringHours'),
            headerClassName: 'text-center',
            render: (alarm: PumpStatusIdvResponse) => (
                <div className="text-center">
                    <Badge variant="outline" dir={isRTL ? 'rtl' : 'ltr'}>
                        {alarm.monitoringHours === 1 ? `${alarm.monitoringHours} ${t('alarms.hour')}` : `${alarm.monitoringHours} ${t('alarms.hours')}`}
                    </Badge>
                </div>
            )
        },
        {
            key: 'recipients',
            header: t('alarms.recipients'),
            render: (alarm: PumpStatusIdvResponse) => {
                const recipients = [];
                if (alarm.emails && alarm.emails.trim()) {
                    recipients.push(...alarm.emails.split(',').map(e => e.trim()));
                }
                if (alarm.phones && alarm.phones.trim()) {
                    recipients.push(...alarm.phones.split(',').map(p => p.trim()));
                }
                return (
                    <div className={`flex flex-wrap gap-1 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                        {recipients.length > 0 && recipients.map((recipient, idx) => {
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
                );
            }
        },
        {
            key: 'pumpNumber',
            header: t('alarms.idvPump'),
            headerClassName: 'text-center',
            render: (alarm: PumpStatusIdvResponse) => (
                <div className="text-center">
                    <Badge variant="outline">
                        {isRTL ? `${alarm.pumpNumber} ${t('alarms.pump')}` : `${t('alarms.pump')} ${alarm.pumpNumber}`}
                    </Badge>
                </div>
            )
        },
        {
            key: 'site',
            header: t('alarms.site'),
            render: (alarm: PumpStatusIdvResponse) => (
                <div className={textAlignClass} dir={isRTL ? 'rtl' : 'ltr'} style={{ fontWeight: 'normal' }}>
                    {alarm.siteName}
                </div>
            )
        },
        {
            key: 'alarmName',
            header: t('alarms.alarmName'),
            render: (alarm: PumpStatusIdvResponse) => (
                <div className={textAlignClass} dir={isRTL ? 'rtl' : 'ltr'} style={{ fontWeight: 'normal' }}>
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
                        <TableHead 
                            key={column.key} 
                            className={column.headerClassName || textAlignClass}
                        >
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