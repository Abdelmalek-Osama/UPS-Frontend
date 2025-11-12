import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Plus, Edit, AlertTriangle, WifiOff, Mail } from 'lucide-react';
import { useAlarmsData } from '../hooks/useAlarmsData';
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { ValueThresholdAlarm } from '../types';

export function AlarmConfiguration() {
    const {
    thresholdAlarms,
    setThresholdAlarms,
    communicationAlarms,
    setCommunicationAlarms,
    isAddCommOpen,
    setIsAddCommOpen,
    addRecipient,
    removeRecipient,
    newRecipient,
    setNewRecipient,
    recipients, 
    setRecipients,
    addThresholdAlarm,
  } = useAlarmsData();
  const [activeTab, setActiveTab] = useState('threshold');
  const [isAddThresholdOpen, setIsAddThresholdOpen] = useState(false);
  const [newThresholdAlarm, setNewThresholdAlarm] = useState<Omit<ValueThresholdAlarm, 'id'> & { id: number }>({
    id: 0,
    site: '',
    field: '',
    operator: '',
    threshold: 0,
    color: '#fbbf24',
    severity: 'Warning',
    recipients: [],
  });

  const handleAddThresholdAlarm = () => {
    addThresholdAlarm({
      ...newThresholdAlarm,
      recipients: recipients,
    });
    setIsAddThresholdOpen(false);
    setNewThresholdAlarm({
      id: 0,
      site: '',
      field: '',
      operator: '',
      threshold: 0,
      color: '#fbbf24',
      severity: 'Warning',
      recipients: [],
    });
    setRecipients([]); // Clear recipients after adding alarm
  };

  // Mock data for dropdowns
  const sites = ['محطة ضخ 1', 'محطة ضخ 2', 'محطة ضخ 3'];
  const fields = ['مستوى الماء', 'التدفق', 'الضغط'];
  const operators = ['>', '<', '>=', '<=', '=='];

  
  

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
          

          <Card>
            <CardHeader className="flex justify-between items-center" dir="rtl">
              <CardTitle className="text-right">تنبيهات القيم الحدية ({thresholdAlarms.length})</CardTitle>
            
            <Dialog open={isAddThresholdOpen} onOpenChange={setIsAddThresholdOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة تنبيه جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة تنبيه قيمة حدية</DialogTitle>
                  <DialogDescription className="text-right">
                    تكوين تنبيه جديد عند تجاوز قيمة معينة
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-1 py-4">
                  <div className="space-y-2">
                    <Label>الموقع</Label>
                    <Select onValueChange={(value) => setNewThresholdAlarm(prev => ({ ...prev, site: value }))}>
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
                    <Select onValueChange={(value) => setNewThresholdAlarm(prev => ({ ...prev, field: value }))}>
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
                      <Select onValueChange={(value) => setNewThresholdAlarm(prev => ({ ...prev, operator: value }))}>
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
                      <Input type="number" step="0.1" placeholder="12.5" onChange={(e) => setNewThresholdAlarm(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>مستوى الخطورة</Label>
                    <Select onValueChange={(value: 'Warning' | 'Critical') => setNewThresholdAlarm(prev => ({ ...prev, severity: value }))}>
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
                      <Input type="color" defaultValue="#fbbf24" className="w-20" onChange={(e) => setNewThresholdAlarm(prev => ({ ...prev, color: e.target.value }))} />
                      <Input type="text" defaultValue="#fbbf24" className="flex-1" onChange={(e) => setNewThresholdAlarm(prev => ({ ...prev, color: e.target.value }))} />
                    </div>
                  </div>
                </div>
                 <div className="space-y-2">
                    <Label>المستلمون</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="email" 
                        placeholder="email@example.example.com"
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
                <DialogFooter>
                    <div className="w-full justify-start">
                  <Button variant="outline" onClick={() => setIsAddThresholdOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleAddThresholdAlarm}>
                    إضافة التنبيه
                  </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">إجراءات</TableHead>
                    <TableHead className="text-right">الخطورة</TableHead>
                    <TableHead className="text-right">المستلمون</TableHead>
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
          

          <Card>
            <CardHeader className="flex justify-between items-center" dir="rtl">
              <CardTitle className="text-right">تنبيهات فقدان الاتصال ({communicationAlarms.length})</CardTitle>
            <Dialog open={isAddCommOpen} onOpenChange={setIsAddCommOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة تنبيه جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[75vh] overflow-y-auto p-4 sm:p-6" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة تنبيه فقدان اتصال</DialogTitle>
                  <DialogDescription className="text-right">
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
