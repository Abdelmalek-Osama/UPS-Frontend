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
import { SensorStatusResponse } from '../../types';
import { mapNumberToField, mapNumberToOperator } from '../../utils/alarmMappers';

interface SensorStatusResponseTableProps {
    alarms: SensorStatusResponse[];
    onEdit: (alarm: any) => void;
    onDelete?: (alarmId: number) => void;
    error?: boolean;
}

export function SensorStatusTable({ alarms, onEdit, onDelete, error }: SensorStatusResponseTableProps) {
    const { t } = useTranslation();
    const isRTL = t('_rtl') === 'rtl';
    // Arabic/RTL should align right, English/LTR should align left
    const textAlignClass = isRTL ? 'text-right' : 'text-left';

   // Define columns in logical order (English/LTR)
    const columns = [
        {
            key: 'actions',
            header: t('common.actions'),
            headerClassName: 'text-center',
            render: (alarm: SensorStatusResponse) => (
                <div className="flex gap-2 justify-center">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(alarm)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onDelete(alarm.alarmId)}
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
            render: (alarm: SensorStatusResponse) => {
                // Handle both array format and comma-separated string format
                let recipients: string[] = [];
                if (alarm.recipients && Array.isArray(alarm.recipients)) {
                    recipients = alarm.recipients;
                } else {
                    const emailList = alarm.emails ? alarm.emails.split(',').map(e => e.trim()).filter(Boolean) : [];
                    const phoneList = alarm.phones ? alarm.phones.split(',').map(p => p.trim()).filter(Boolean) : [];
                    recipients = [...emailList, ...phoneList];
                }
                
                return (
                    <div className={`flex flex-wrap gap-1 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                        {recipients.length > 0 ? (
                            recipients.map((recipient, idx) => {
                                const isEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(recipient);
                                const isPhone = /^\d{11}$/.test(recipient);
                                return (
                                    <Badge key={idx} variant="secondary" className="text-xs flex items-center">
                                        {isEmail && <Mail className="ml-1 h-3 w-3" />}
                                        {isPhone && <Phone className="ml-1 h-3 w-3" />}
                                        {recipient}
                                    </Badge>
                                );
                            })
                        ) : (
                            <span className="text-gray-500 text-xs">-</span>
                        )}
                    </div>
                );
            }
        },
        
        {
            key: 'message',
            header: t('alarms.message'),
            render: (alarm: SensorStatusResponse) => (
                <div className={textAlignClass} style={{ fontWeight: 'normal' }}>
                    {alarm.message || alarm.customMessage || '-'}
                </div>
            )
        },
        {
            key: 'threshold',
            header: t('alarms.threshold'),
            render: (alarm: SensorStatusResponse) => (
                <div className={textAlignClass} style={{ fontWeight: 'normal' }}>
                    {alarm.threshold || alarm.thresholdValue || '-'}
                </div>
            )
        },
        {
            key: 'field',
            header: t('alarms.field'),
            render: (alarm: SensorStatusResponse) => (
                <div className={textAlignClass} style={{ fontWeight: 'normal' }}>
                    {alarm.field || alarm.fieldName || '-'}
                </div>
            )
        },
        {
            key: 'site',
            header: t('alarms.site'),
            render: (alarm: SensorStatusResponse) => (
                <div className={textAlignClass} style={{ fontWeight: 'normal' }}>
                    {isRTL ? (alarm.arabicName || alarm.site || alarm.siteName || '-') : (alarm.site || alarm.siteName || '-')}
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
                        <TableHead 
                            key={column.key} 
                            className={(column as any).headerClassName || textAlignClass}
                        >
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