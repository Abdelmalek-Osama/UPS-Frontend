import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Edit, Trash2, AlertTriangle, WifiOff, Mail } from 'lucide-react';

interface ValueThresholdAlarm {
  id: number;
  site: string;
  field: string;
  operator: string;
  threshold: number;
  color: string;
  severity: 'Warning' | 'Critical';
}

interface CommunicationAlarm {
  id: number;
  site: string;
  hours: number;
  recipients: string[];
}

export function AlarmConfiguration() {
  const [activeTab, setActiveTab] = useState('threshold');
  const [isAddThresholdOpen, setIsAddThresholdOpen] = useState(false);
  const [isAddCommOpen, setIsAddCommOpen] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);

  const thresholdAlarms: ValueThresholdAlarm[] = [
    { id: 1, site: 'مستوى المياه - القاهرة 01', field: 'Battery', operator: '<', threshold: 12.5, color: '#fbbf24', severity: 'Warning' },
    { id: 2, site: 'مستوى المياه - القاهرة 01', field: 'USWL', operator: '>', threshold: 130, color: '#ef4444', severity: 'Critical' },
    { id: 3, site: 'محطة الضخ - الجيزة 01', field: 'TotalFlow', operator: '<', threshold: 50, color: '#fbbf24', severity: 'Warning' },
  ];

  const communicationAlarms: CommunicationAlarm[] = [
    { id: 1, site: 'مستوى المياه - القاهرة 01', hours: 2, recipients: ['admin@irrigation.gov.eg', 'operator1@irrigation.gov.eg'] },
    { id: 2, site: 'محطة الضخ - الإسكندرية 02', hours: 1, recipients: ['admin@irrigation.gov.eg'] },
  ];

  const sites = [
    'مستوى المياه - القاهرة 01',
    'مستوى المياه - الإسكندرية 01',
    'محطة الضخ - الجيزة 01',
    'محطة الضخ - الدقهلية 02',
  ];

  const fields = ['Battery', 'USWL', 'DSWL', 'TotalFlow', 'TotalUptime'];
  const operators = ['>', '<', '>=', '<=', '=='];

  const addRecipient = () => {
    if (newRecipient && !recipients.includes(newRecipient)) {
      setRecipients([...recipients, newRecipient]);
      setNewRecipient('');
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl">تكوين التنبيهات</h2>
        <p className="text-gray-500 mt-1">إدارة تنبيهات القيم وفقدان الاتصال</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="threshold">
            <AlertTriangle className="ml-2 h-4 w-4"/>
            تنبيهات القيم الحدية
          </TabsTrigger>
          <TabsTrigger value="communication">
            <WifiOff className="ml-2 h-4 w-4" />
            تنبيهات فقدان الاتصال
          </TabsTrigger>
        </TabsList>

        {/* Value Threshold Alarms */}
        <TabsContent value="threshold" className="mt-6 space-y-6">
          <div className="flex justify-end">
            <Dialog open={isAddThresholdOpen} onOpenChange={setIsAddThresholdOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة تنبيه جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إضافة تنبيه قيمة حدية</DialogTitle>
                  <DialogDescription>
                    تكوين تنبيه جديد عند تجاوز قيمة معينة
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>الموقع</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموقع" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites.map(site => (
                          <SelectItem key={site} value={site}>{site}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الحقل</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحقل" />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.map(field => (
                          <SelectItem key={field} value={field}>{field}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>المعامل</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المعامل" />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map(op => (
                            <SelectItem key={op} value={op}>{op}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>القيمة الحدية</Label>
                      <Input type="number" step="0.1" placeholder="12.5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>مستوى الخطورة</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المستوى" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Warning">تحذير</SelectItem>
                        <SelectItem value="Critical">حرج</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>اللون</Label>
                    <div className="flex gap-2">
                      <Input type="color" defaultValue="#fbbf24" className="w-20" />
                      <Input type="text" defaultValue="#fbbf24" className="flex-1" />
                    </div>
                  </div>
                </div>
                 <div className="space-y-2">
                    <Label>المستلمون</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="email" 
                        placeholder="email@example.com"
                        value={newRecipient}
                        onChange={(e) => setNewRecipient(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                      />
                      <Button type="button" onClick={addRecipient}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddThresholdOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={() => setIsAddThresholdOpen(false)}>
                    إضافة التنبيه
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-right">تنبيهات القيم الحدية ({thresholdAlarms.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">إجراءات</TableHead>
                    <TableHead className="text-right">الخطورة</TableHead>
                    <TableHead className="text-right">اللون</TableHead>
                    <TableHead className="text-right">الشرط</TableHead>
                    <TableHead className="text-right">الحقل</TableHead>
                    <TableHead className="text-right">الموقع</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {thresholdAlarms.map((alarm) => (
                    <TableRow key={alarm.id}>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                         
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">
                          {alarm.severity === 'Critical' ? 'حرج' : 'تحذير'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: alarm.color }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {alarm.operator} {alarm.threshold}
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{alarm.field}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{alarm.site}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Loss Alarms */}
        <TabsContent value="communication" className="mt-6 space-y-6">
          <div className="flex justify-end">
            <Dialog open={isAddCommOpen} onOpenChange={setIsAddCommOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة تنبيه جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إضافة تنبيه فقدان اتصال</DialogTitle>
                  <DialogDescription>
                    تكوين تنبيه عند انقطاع البيانات لفترة محددة
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>الموقع</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموقع" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites.map(site => (
                          <SelectItem key={site} value={site}>{site}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>عدد الساعات</Label>
                    <Input type="number" placeholder="2" defaultValue="2" />
                    <p className="text-xs text-gray-500">
                      سيتم إرسال تنبيه إذا لم تصل بيانات لهذا العدد من الساعات
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>المستلمون</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="email" 
                        placeholder="email@example.com"
                        value={newRecipient}
                        onChange={(e) => setNewRecipient(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                      />
                      <Button type="button" onClick={addRecipient}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {recipients.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {recipients.map(email => (
                          <Badge key={email} variant="secondary" className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {email}
                            <button 
                              onClick={() => removeRecipient(email)}
                              className="mr-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddCommOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={() => setIsAddCommOpen(false)}>
                    إضافة التنبيه
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-right">تنبيهات فقدان الاتصال ({communicationAlarms.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">إجراءات</TableHead>
                    <TableHead className="text-right">المستلمون</TableHead>
                    <TableHead className="text-right">الحد الزمني</TableHead>
                    <TableHead className="text-right">الموقع</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communicationAlarms.map((alarm) => (
                    <TableRow key={alarm.id}>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4"/>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap gap-1 justify-end">
                          {alarm.recipients.map((email, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              <Mail className="ml-1 h-3 w-3" />
                              {email}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">
                          {alarm.hours} ساعة
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{alarm.site}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
