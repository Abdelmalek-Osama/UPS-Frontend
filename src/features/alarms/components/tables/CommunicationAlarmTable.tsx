import React from 'react';
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
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-right">إجراءات</TableHead>
                    <TableHead className="text-right">المستلمون</TableHead>
                    <TableHead className="text-right">عدد الساعات</TableHead>
                    <TableHead className="text-right">الموقع</TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {alarms.map((alarm) => (
                    <TableRow key={alarm.alarmId}>
                        <TableCell className="text-right">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(alarm)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </TableCell>
                        <TableCell className="text-right">
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
                        <TableCell className="text-right">
                            <Badge variant="outline" dir="rtl">
                                {alarm.numHours === 1 ? `${alarm.numHours} ساعة ` : `${alarm.numHours} ساعات`}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{alarm.siteName}</TableCell>
                        <TableCell className="text-right font-medium">{alarm.alarmName}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
