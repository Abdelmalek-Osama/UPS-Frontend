import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Calendar } from '../../../components/ui/calendar';
import { 
  FileText, 
  Download, 
  Search, 
  CalendarIcon,
  UserCircle,
  MapPin,
  Edit3,
} from 'lucide-react';
import { getActionIcon, getActionLabel, getActionColor } from '../utils/formatters';
import type { AuditLog } from '../types';
import {DatePicker} from '../../../components/ui/datepicker';

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterSite, setFilterSite] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  

  const auditLogs: AuditLog[] = [
    {
      id: 1,
      timestamp: '2025-11-03 11:45:32',
      user: 'أحمد محمود',
      action: 'update',
      site: 'مستوى المياه - القاهرة 01',
      field: 'USWL',
      oldValue: '125.2',
      newValue: '125.4',
      readingId: 1234
    },
    {
      id: 2,
      timestamp: '2025-11-03 11:30:15',
      user: 'محمد علي',
      action: 'create',
      site: 'محطة الضخ - الجيزة 01',
      field: 'P1_time',
      oldValue: '-',
      newValue: '3.5',
      readingId: 1235
    },
  ];

  const users = ['أحمد محمود', 'محمد علي', 'فاطمة حسن'];
  const sites = [
    'مستوى المياه - القاهرة 01',
    'محطة الضخ - الجيزة 01',
    'مستوى المياه - الإسكندرية 01',
    'محطة الضخ - الدقهلية 02',
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.field.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = filterUser === 'all' || log.user === filterUser;
    const matchesSite = filterSite === 'all' || log.site === filterSite;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesUser && matchesSite && matchesAction;
  });

  const handleExport = () => {
    alert('سيتم تصدير سجل التدقيق إلى ملف Excel');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">سجل التدقيق</h2>
          <p className="text-gray-500 mt-1">تتبع جميع التغييرات على القراءات والبيانات</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="ml-2 h-4 w-4" />
          تصدير السجل
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger>
                <SelectValue placeholder="المستخدم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستخدمين</SelectItem>
                {users.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSite} onValueChange={setFilterSite}>
              <SelectTrigger>
                <SelectValue placeholder="الموقع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المواقع</SelectItem>
                {sites.map(site => (
                  <SelectItem key={site} value={site}>{site}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الإجراء" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الإجراءات</SelectItem>
                <SelectItem value="create">إضافة</SelectItem>
                <SelectItem value="update">تحديث</SelectItem>
                <SelectItem value="delete">حذف</SelectItem>
              </SelectContent>
            </Select>
            <DatePicker
                placeholder="التاريخ"
                value={selectedDate}
                onChange={setSelectedDate}
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>السجلات ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">التاريخ والوقت</TableHead>
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">الإجراء</TableHead>
                <TableHead className="text-right">الموقع</TableHead>
                <TableHead className="text-right">الحقل</TableHead>
                <TableHead className="text-right">القيمة القديمة</TableHead>
                <TableHead className="text-right">القيمة الجديدة</TableHead>
                <TableHead className="text-right">رقم القراءة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-gray-600">
                    {log.timestamp}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{log.user}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionColor(log.action)}>
                      <span className="ml-1">{getActionIcon(log.action)}</span>
                      {getActionLabel(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {log.site}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {log.field}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {log.oldValue === '-' ? (
                        <span className="text-gray-400">-</span>
                      ) : (
                        log.oldValue
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {log.newValue === '-' ? (
                        <span className="text-red-600">محذوف</span>
                      ) : (
                        log.newValue
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">
                      #{log.readingId}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">إجمالي السجلات</p>
                <p className="text-2xl mt-1">{auditLogs.length}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">عمليات التحديث</p>
                <p className="text-2xl mt-1">
                  {auditLogs.filter(l => l.action === 'update').length}
                </p>
              </div>
              <Edit3 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">آخر نشاط</p>
                <p className="text-sm mt-1">{auditLogs[0]?.timestamp}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
