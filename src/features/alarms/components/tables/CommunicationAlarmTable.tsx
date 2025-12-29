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
import { CommunicationAlarmResponse } from '../../types';

interface CommunicationAlarmTableProps {
    alarms: CommunicationAlarmResponse[];
    onEdit: (alarm: CommunicationAlarmResponse) => void;
}

export function CommunicationAlarmTable({ alarms, onEdit }: CommunicationAlarmTableProps) {
    const { t } = useTranslation();
    return (
        <Table className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
            <TableHeader>
                <TableRow>
                    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('common.actions')}</TableHead>
                    {/* <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.severity')}</TableHead> */}
                    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.emailRecipients')}</TableHead>
                    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.hours')}</TableHead>
                    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.site')}</TableHead>
                    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.alarmName')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {alarms.map((alarm) => (
                    <TableRow key={alarm.alarmId}>
                        <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(alarm)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TableCell>
                        {/* <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            {alarm.severity === 0 && (
                                <Badge style={{ backgroundColor: '#DAA520' }} dir="rtl">Warning</Badge>
                            )}
                            {alarm.severity === 1 && (
                                <Badge variant="destructive" dir="rtl">Critical</Badge>
                            )}
                        </TableCell> */}
                        <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            <div className="flex flex-wrap gap-1 justify-end">
                                {alarm.emails && alarm.emails.split(',').filter(Boolean).map((email, idx) => (
                                    <Badge key={`email-${idx}`} variant="secondary" className="text-xs">
                                        <Mail className="ml-1 h-3 w-3" /> {email.trim()}
                                    </Badge>
                                ))}
                                {alarm.phones && alarm.phones.split(',').filter(Boolean).map((phone, idx) => (
                                    <Badge key={`phone-${idx}`} variant="secondary" className="text-xs">
                                        <Phone className="ml-1 h-3 w-3" /> {phone.trim()}
                                    </Badge>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                            <Badge variant="outline" dir="rtl">
                                {alarm.numHours === 1 ? `${alarm.numHours} ${t('alarms.hour')}` : `${alarm.numHours} ${t('alarms.hours')}`}
                            </Badge>
                        </TableCell>
                        <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} style={{fontWeight: 'medium'}}>{alarm.siteName}</TableCell>
                        <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} style={{fontWeight: 'medium'}}>{alarm.alarmName}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
