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
    return (
        <Table className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
            <TableHeader>
                <TableRow>
                    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('common.actions')}</TableHead>
                    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.color')}</TableHead>
                    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.field')}</TableHead>
                    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.operator')}</TableHead>
                    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.emailRecipients')}</TableHead>
                    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.severity')}</TableHead>
                    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.site')}</TableHead>
                    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.alarmName')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {alarms.map((alarm) => (
                    <TableRow key={alarm.id}>
                        <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(alarm)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TableCell>
                        <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            <div
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: alarm.color }}
                            />
                        </TableCell>
                        <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            <Badge variant="outline">{mapNumberToField[alarm.field]}</Badge>
                        </TableCell>
                        <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                {mapNumberToOperator[alarm.operator]} {alarm.threshold}
                            </code>
                        </TableCell>
                        <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            <div className="flex flex-wrap gap-1 justify-end">
                                {alarm.recipients && Array.isArray(alarm.recipients) && alarm.recipients.map((recipient, idx) => {
                                    const isEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(recipient);
                                    const isPhone = /^\d{11}$/.test(recipient);
                                    return (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                            {isEmail && <Mail className="ml-1 h-3 w-3" />}
                                            {isPhone && <Phone className="ml-1 h-3 w-3" />}
                                            {recipient}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </TableCell>
                        <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            <Badge variant="outline">{alarm.severity}</Badge>
                        </TableCell>
                        <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} style={{fontWeight: 'normal'}}>{alarm.site}</TableCell>
                        <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} style={{fontWeight: 'normal'}}>{alarm.alarmName}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
