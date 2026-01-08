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
import { PumpStatusPSResponse } from '../../types';
import { mapNumberToField, mapNumberToOperator } from '../../utils/alarmMappers';

interface PumpStatusPSResponseTableProps {
    alarms: PumpStatusPSResponse[];
    onEdit: (alarm: any) => void;
}

export function PumpStatusPSTable({ alarms, onEdit }: PumpStatusPSResponseTableProps) {
    const { t } = useTranslation();
    const isRTL = t('_rtl') === 'rtl';
    // Arabic/RTL should align right, English/LTR should align left
    const textAlignClass = isRTL ? 'text-right' : 'text-left';

   // Define columns in logical order (English/LTR)
    const columns = [
        {
            key: 'actions',
            header: t('common.actions'),
            render: (alarm: PumpStatusPSResponse) => (
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
            render: (alarm: PumpStatusPSResponse) => (
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
            key: 'site',
            header: t('alarms.site'),
            render: (alarm: PumpStatusPSResponse) => (
                <div className={textAlignClass} style={{ fontWeight: 'normal' }}>
                    {alarm.site}
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