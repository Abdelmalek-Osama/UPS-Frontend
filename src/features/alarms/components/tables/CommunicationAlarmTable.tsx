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
import { CommunicationAlarmResponse } from '../../types';

interface CommunicationAlarmTableProps {
    alarms: CommunicationAlarmResponse[];
    onEdit: (alarm: CommunicationAlarmResponse) => void;
    onDelete?: (alarmId: number) => void;
    error?: boolean;
}

export function CommunicationAlarmTable({ alarms, onEdit, onDelete, error }: CommunicationAlarmTableProps) {
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const isRTL = t('_rtl') === 'rtl';
    // Arabic/RTL should align right, English/LTR should align left
    const textAlignClass = isRTL ? 'text-right' : 'text-left';

    // Define columns in logical order (English/LTR)
    const columns = [
        {
            key: 'actions',
            header: t('common.actions'),
            render: (alarm: CommunicationAlarmResponse) => (
                <div className="flex gap-2 justify-center">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(alarm)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    {onDelete && currentUser?.role === 'Admin' && (
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
            render: (alarm: CommunicationAlarmResponse) => (
                <div className={`flex flex-wrap gap-1 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                    {alarm.emails && alarm.emails.split(',').filter(Boolean).map((email, idx) => (
                        <Badge key={`email-${idx}`} variant="secondary" className="text-xs flex items-center">
                            <Mail className="ml-1 h-3 w-3" /> {email.trim()}
                        </Badge>
                    ))}
                    {alarm.phones && alarm.phones.split(',').filter(Boolean).map((phone, idx) => (
                        <Badge key={`phone-${idx}`} variant="secondary" className="text-xs flex items-center">
                            <Phone className="ml-1 h-3 w-3" /> {phone.trim()}
                        </Badge>
                    ))}
                </div>
            )
        },
        {
            key: 'hours',
            header: t('alarms.hours'),
            render: (alarm: CommunicationAlarmResponse) => (
                <div className={textAlignClass}>
                    <Badge variant="outline" dir={isRTL ? 'rtl' : 'ltr'}>
                        {alarm.numHours === 1 ? `${alarm.numHours} ${t('alarms.hour')}` : `${alarm.numHours} ${t('alarms.hours')}`}
                    </Badge>
                </div>
            )
        },
        {
            key: 'site',
            header: t('alarms.site'),
            render: (alarm: CommunicationAlarmResponse) => (
                <div className={textAlignClass} style={{ fontWeight: 'medium' }}>
                    {alarm.siteName}
                </div>
            )
        },
        {
            key: 'alarmName',
            header: t('alarms.alarmName'),
            render: (alarm: CommunicationAlarmResponse) => (
                <div className={textAlignClass} style={{ fontWeight: 'medium' }}>
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