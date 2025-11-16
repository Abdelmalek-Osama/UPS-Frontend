import React, { useState, useEffect } from 'react';
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
import { ValueThresholdAlarm, CreateThresholdAlarmRequest, CreateCommunicationAlarmRequest } from '../types';
import { useSitesData } from '../../sites/hooks/useSitesData';
import { Site } from '../../sites/types';

export function AlarmConfiguration() {
    const {
    thresholdAlarms,
    communicationAlarms,
    isAddCommOpen,
    setIsAddCommOpen,
    createThresholdAlarm,
    createCommunicationAlarm,
  } = useAlarmsData();
  const [activeTab, setActiveTab] = useState('threshold');
  const [isAddThresholdOpen, setIsAddThresholdOpen] = useState(false);

  const [newThresholdAlarmForm, setNewThresholdAlarmForm] = useState<{
    siteId: number | null;
    alarmName: string;
    fieldName: string;
    operator: string;
    thresholdValue: number;
    colorCode: string;
    severity: 'Warning' | 'Critical';
    emails: string[];
    phones: string[];
  }>({
    siteId: null,
    alarmName: '',
    fieldName: '',
    operator: '',
    thresholdValue: 0,
    colorCode: '#fbbf24',
    severity: 'Warning',
    emails: [],
    phones: [],
  });

  const [newCommunicationAlarmForm, setNewCommunicationAlarmForm] = useState<{
    siteId: number | null;
    alarmName: string;
    severity: 'Warning' | 'Critical';
    numHours: number;
    emails: string[];
    phones: string[];
  }>({
    siteId: null,
    alarmName: '',
    severity: 'Warning',
    numHours: 0,
    emails: [],
    phones: [],
  });

  const [newEmailRecipient, setNewEmailRecipient] = useState('');
  const [newPhoneRecipient, setNewPhoneRecipient] = useState('');

  const { sites, loading: sitesLoading, error: sitesError } = useSitesData();

  useEffect(() => {
    if (sites.length > 0 && newThresholdAlarmForm.siteId === null) {
      const defaultSite = sites[0];
      setNewThresholdAlarmForm(prev => ({ ...prev, siteId: defaultSite.id }));
    }
  }, [sites, newThresholdAlarmForm.siteId]);

  useEffect(() => {
    if (sites.length > 0 && newCommunicationAlarmForm.siteId === null) {
      const defaultSite = sites[0];
      setNewCommunicationAlarmForm(prev => ({ ...prev, siteId: defaultSite.id }));
    }
  }, [sites, newCommunicationAlarmForm.siteId]);

  const handleAddEmailRecipient = (forAlarmType: 'threshold' | 'communication') => {
    if (newEmailRecipient && !newEmailRecipient.includes(newEmailRecipient)) {
        if (forAlarmType === 'threshold') {
            setNewThresholdAlarmForm(prev => ({ ...prev, emails: [...prev.emails, newEmailRecipient] }));
        } else {
            setNewCommunicationAlarmForm(prev => ({ ...prev, emails: [...prev.emails, newEmailRecipient] }));
        }
        setNewEmailRecipient('');
    }
  };

  const handleAddPhoneRecipient = (forAlarmType: 'threshold' | 'communication') => {
    if (newPhoneRecipient && !newPhoneRecipient.includes(newPhoneRecipient)) {
        if (forAlarmType === 'threshold') {
            setNewThresholdAlarmForm(prev => ({ ...prev, phones: [...prev.phones, newPhoneRecipient] }));
        } else {
            setNewCommunicationAlarmForm(prev => ({ ...prev, phones: [...prev.phones, newPhoneRecipient] }));
        }
        setNewPhoneRecipient('');
    }
  };

  const handleRemoveEmailRecipient = (emailToRemove: string, forAlarmType: 'threshold' | 'communication') => {
    if (forAlarmType === 'threshold') {
        setNewThresholdAlarmForm(prev => ({ ...prev, emails: prev.emails.filter(email => email !== emailToRemove) }));
    } else {
        setNewCommunicationAlarmForm(prev => ({ ...prev, emails: prev.emails.filter(email => email !== emailToRemove) }));
    }
  };

  const handleRemovePhoneRecipient = (phoneToRemove: string, forAlarmType: 'threshold' | 'communication') => {
    if (forAlarmType === 'threshold') {
        setNewThresholdAlarmForm(prev => ({ ...prev, phones: prev.phones.filter(phone => phone !== phoneToRemove) }));
    } else {
        setNewCommunicationAlarmForm(prev => ({ ...prev, phones: prev.phones.filter(phone => phone !== phoneToRemove) }));
    }
  };

  const mapFieldToNumber = (field: string): number => {
    const fieldMap: { [key: string]: number } = {
      'مستوى الماء': 0,
      'التدفق': 1,
      'الضغط': 2,
    };
    return fieldMap[field] ?? 0;
  };

  const mapOperatorToNumber = (operator: string): number => {
    const operatorMap: { [key: string]: number } = {
      '>': 0,
      '<': 1,
      '>=': 2,
      '<=': 3,
      '==': 4,
    };
    return operatorMap[operator] ?? 0;
  };

  const mapSeverityToNumber = (severity: 'Warning' | 'Critical'): number => {
    return severity === 'Warning' ? 0 : 1;
  };

  const handleSubmitThresholdAlarm = async () => {
    if (!newThresholdAlarmForm.siteId || !newThresholdAlarmForm.alarmName || !newThresholdAlarmForm.fieldName || !newThresholdAlarmForm.operator) {
      console.error('Missing required threshold alarm fields');
      return;
    }

    const requestBody: CreateThresholdAlarmRequest = {
      id: 0,
      siteId: newThresholdAlarmForm.siteId,
      alarmName: newThresholdAlarmForm.alarmName,
      emails: newThresholdAlarmForm.emails.join(','),
      phones: newThresholdAlarmForm.phones.join(','),
      method: 0,
      valueThreshold: {
        fieldName: mapFieldToNumber(newThresholdAlarmForm.fieldName),
        operator: mapOperatorToNumber(newThresholdAlarmForm.operator),
        thresholdValue: newThresholdAlarmForm.thresholdValue,
        colorCode: newThresholdAlarmForm.colorCode,
        severity: mapSeverityToNumber(newThresholdAlarmForm.severity),
      },
    };

    const result = await createThresholdAlarm(requestBody);
    if (result.success) {
      setIsAddThresholdOpen(false);
      setNewThresholdAlarmForm({
        siteId: null,
        alarmName: '',
        fieldName: '',
        operator: '',
        thresholdValue: 0,
        colorCode: '#fbbf24',
        severity: 'Warning',
        emails: [],
        phones: [],
      });
      setNewEmailRecipient('');
      setNewPhoneRecipient('');
    } else {
      console.error('Error creating threshold alarm:', result.message);
    }
  };

  const handleSubmitCommunicationAlarm = async () => {
    if (!newCommunicationAlarmForm.siteId || !newCommunicationAlarmForm.alarmName) {
      console.error('Missing required communication alarm fields');
      return;
    }

    const requestBody: CreateCommunicationAlarmRequest = {
      id: 0,
      siteId: newCommunicationAlarmForm.siteId,
      alarmName: newCommunicationAlarmForm.alarmName,
      emails: newCommunicationAlarmForm.emails.join(','),
      phones: newCommunicationAlarmForm.phones.join(','),
      method: 0,
      communicationLoss: {
        severity: mapSeverityToNumber(newCommunicationAlarmForm.severity),
        numHours: newCommunicationAlarmForm.numHours,
      },
    };

    const result = await createCommunicationAlarm(requestBody);
    if (result.success) {
      setIsAddCommOpen(false);
      setNewCommunicationAlarmForm({
        siteId: null,
        alarmName: '',
        severity: 'Warning',
        numHours: 0,
        emails: [],
        phones: [],
      });
      setNewEmailRecipient('');
      setNewPhoneRecipient('');
    } else {
      console.error('Error creating communication alarm:', result.message);
    }
  };

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
              <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة تنبيه قيمة حدية</DialogTitle>
                  <DialogDescription className="text-right">
                    تكوين تنبيه جديد عند تجاوز قيمة معينة
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-1 py-4">
                  <div className="space-y-2">
                    <Label>الموقع</Label>
                    <Select onValueChange={(value) => setNewThresholdAlarmForm(prev => ({ ...prev, siteId: parseInt(value) }))} value={newThresholdAlarmForm.siteId?.toString() || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموقع" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites.map(site => (
                          <SelectItem key={site.id} value={site.id.toString()}>{site.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>اسم التنبيه</Label>
                    <Input type="text" placeholder="اسم التنبيه" value={newThresholdAlarmForm.alarmName} onChange={(e) => setNewThresholdAlarmForm(prev => ({ ...prev, alarmName: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>الحقل</Label>
                    <Select onValueChange={(value) => setNewThresholdAlarmForm(prev => ({ ...prev, fieldName: value }))} value={newThresholdAlarmForm.fieldName}>
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
                      <Select onValueChange={(value) => setNewThresholdAlarmForm(prev => ({ ...prev, operator: value }))} value={newThresholdAlarmForm.operator}>
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
                      <Input type="number" step="0.1" placeholder="12.5" value={newThresholdAlarmForm.thresholdValue} onChange={(e) => setNewThresholdAlarmForm(prev => ({ ...prev, thresholdValue: parseFloat(e.target.value) }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>مستوى الخطورة</Label>
                    <Select onValueChange={(value: 'Warning' | 'Critical') => setNewThresholdAlarmForm(prev => ({ ...prev, severity: value }))} value={newThresholdAlarmForm.severity}>
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
                      <Input type="color" defaultValue="#fbbf24" className="w-20" value={newThresholdAlarmForm.colorCode} onChange={(e) => setNewThresholdAlarmForm(prev => ({ ...prev, colorCode: e.target.value }))} />
                      <Input type="text" defaultValue="#fbbf24" className="flex-1" value={newThresholdAlarmForm.colorCode} onChange={(e) => setNewThresholdAlarmForm(prev => ({ ...prev, colorCode: e.target.value }))} />
                    </div>
                  </div>
                </div>
                 <div className="space-y-2">
                    <Label>المستلمون (البريد الإلكتروني)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="email@example.example.com"
                        value={newEmailRecipient}
                        onChange={(e) => setNewEmailRecipient(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddEmailRecipient('threshold')}
                      />
                      <Button type="button" onClick={() => handleAddEmailRecipient('threshold')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {newThresholdAlarmForm.emails.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newThresholdAlarmForm.emails.map(email => (
                          <Badge key={email} variant="secondary" className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {email}
                            <button
                              onClick={() => handleRemoveEmailRecipient(email, 'threshold')}
                              className="mr-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>المستلمون (أرقام الهواتف)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="tel"
                        placeholder="0123456789"
                        value={newPhoneRecipient}
                        onChange={(e) => setNewPhoneRecipient(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddPhoneRecipient('threshold')}
                      />
                      <Button type="button" onClick={() => handleAddPhoneRecipient('threshold')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {newThresholdAlarmForm.phones.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newThresholdAlarmForm.phones.map(phone => (
                          <Badge key={phone} variant="secondary" className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {phone}
                            <button
                              onClick={() => handleRemovePhoneRecipient(phone, 'threshold')}
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
                  <Button onClick={handleSubmitThresholdAlarm}>
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
              <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto p-4 sm:p-6" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة تنبيه فقدان اتصال</DialogTitle>
                  <DialogDescription className="text-right">
                    تكوين تنبيه عند انقطاع البيانات لفترة محددة
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>الموقع</Label>
                    <Select onValueChange={(value) => setNewCommunicationAlarmForm(prev => ({ ...prev, siteId: parseInt(value) }))} value={newCommunicationAlarmForm.siteId?.toString() || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموقع" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites.map(site => (
                          <SelectItem key={site.id} value={site.id.toString()}>{site.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>اسم التنبيه</Label>
                    <Input type="text" placeholder="اسم التنبيه" value={newCommunicationAlarmForm.alarmName} onChange={(e) => setNewCommunicationAlarmForm(prev => ({ ...prev, alarmName: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>عدد الساعات</Label>
                    <Input type="number" placeholder="2" value={newCommunicationAlarmForm.numHours} onChange={(e) => setNewCommunicationAlarmForm(prev => ({ ...prev, numHours: parseInt(e.target.value) || 0 }))} />
                    <p className="text-xs text-gray-500">
                      سيتم إرسال تنبيه إذا لم تصل بيانات لهذا العدد من الساعات
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>مستوى الخطورة</Label>
                    <Select onValueChange={(value: 'Warning' | 'Critical') => setNewCommunicationAlarmForm(prev => ({ ...prev, severity: value }))} value={newCommunicationAlarmForm.severity}>
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
                    <Label>المستلمون (البريد الإلكتروني)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={newEmailRecipient}
                        onChange={(e) => setNewEmailRecipient(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddEmailRecipient('communication')}
                      />
                      <Button type="button" onClick={() => handleAddEmailRecipient('communication')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {newCommunicationAlarmForm.emails.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newCommunicationAlarmForm.emails.map(email => (
                          <Badge key={email} variant="secondary" className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {email}
                            <button
                              onClick={() => handleRemoveEmailRecipient(email, 'communication')}
                              className="mr-1 hover:text-red-600"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>المستلمون (أرقام الهواتف)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="tel"
                        placeholder="0123456789"
                        value={newPhoneRecipient}
                        onChange={(e) => setNewPhoneRecipient(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddPhoneRecipient('communication')}
                      />
                      <Button type="button" onClick={() => handleAddPhoneRecipient('communication')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {newCommunicationAlarmForm.phones.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newCommunicationAlarmForm.phones.map(phone => (
                          <Badge key={phone} variant="secondary" className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {phone}
                            <button
                              onClick={() => handleRemovePhoneRecipient(phone, 'communication')}
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
                  <Button onClick={handleSubmitCommunicationAlarm}>
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
