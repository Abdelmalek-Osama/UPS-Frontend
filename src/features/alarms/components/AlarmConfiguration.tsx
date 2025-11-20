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
import { Plus, Edit, AlertTriangle, WifiOff } from 'lucide-react';
import { useAlarmsData } from '../hooks/useAlarmsData';
import { useSitesData } from '../../sites/hooks/useSitesData';
import { AlarmFormDialog } from './AlarmFormDialog';
import { CreateThresholdAlarmRequest, CreateCommunicationAlarmRequest, AlarmForm } from '../types';
import { mapSeverityToNumber, mapNumberToOperator, mapFieldToNumber, mapNumberToField } from '../utils/alarm-utils';
import { Dialog, DialogTrigger } from '../../../components/ui/dialog';

const INITIAL_THRESHOLD_FORM: AlarmForm = {
  id: 0, // Placeholder for new alarms
  siteId: null,
  alarmName: '',
  site: '',
  field: '',
  operator: '',
  threshold: 0,
  color: '#fbbf24',
  severity: 'Warning',
  recipients: [],
};

const INITIAL_COMMUNICATION_FORM: AlarmForm = {
  id: 0, // Placeholder for new alarms
  siteId: null,
  alarmName: '',
  site: '',
  severity: 'Warning',
  hours: 0,
  recipients: [],
};

export function AlarmConfiguration() {
  const {
    thresholdAlarms,
    communicationAlarms,
    isAddCommOpen,
    setIsAddCommOpen,
    createThresholdAlarm,
    createCommunicationAlarm,
    updateThresholdAlarm,
    updateCommunicationAlarm,
  } = useAlarmsData();

  const { sites } = useSitesData();
  
  const [activeTab, setActiveTab] = useState('threshold');
  const [isAddThresholdOpen, setIsAddThresholdOpen] = useState(false);
  const [isEditThresholdOpen, setIsEditThresholdOpen] = useState(false);
  const [currentThresholdAlarm, setCurrentThresholdAlarm] = useState<AlarmForm | null>(null);
  const [alarmForm, setAlarmForm] = useState<AlarmForm>(INITIAL_THRESHOLD_FORM);
  const [isEditCommOpen, setIsEditCommOpen] = useState(false);
  const [currentCommunicationAlarm, setCurrentCommunicationAlarm] = useState<AlarmForm | null>(null);

  // Form submission handlers
  const handleSubmitAlarm = async (type: 'threshold' | 'communication') => {
    if (type === 'threshold') {
      const { siteId, alarmName, field, operator, threshold, color } = alarmForm;
    
    if (!siteId || !alarmName || !field || !operator) {
      console.error('Missing required threshold alarm fields');
      return;
    }

    const requestBody: CreateThresholdAlarmRequest = {
      id: 0,
      siteId,
      alarmName,
        emails: alarmForm.recipients.join(','),
      phones: '', // Assuming phones are combined into recipients
      method: 0,
      valueThreshold: {
          fieldName: mapFieldToNumber(field!),
          operator: mapNumberToOperator[operator!],
          thresholdValue: threshold! || 0,
          colorCode: color! || '#fbbf24',
          severity: mapSeverityToNumber(alarmForm.severity),
      },
    };

    const result = await createThresholdAlarm(requestBody);
    if (result.success) {
      setIsAddThresholdOpen(false);
        setAlarmForm(INITIAL_THRESHOLD_FORM);
    } else {
      console.error('Error creating threshold alarm:', result.message);
    }
    } else {
      const { siteId, alarmName, hours } = alarmForm;
    
    if (!siteId || !alarmName) {
      console.error('Missing required communication alarm fields');
      return;
    }

    const requestBody: CreateCommunicationAlarmRequest = {
      id: 0,
      siteId,
      alarmName,
        emails: alarmForm.recipients.join(','),
      phones: '', // Assuming phones are combined into recipients
      method: 0,
      communicationLoss: {
          severity: mapSeverityToNumber(alarmForm.severity),
          numHours: hours! || 0,
      },
    };

    const result = await createCommunicationAlarm(requestBody);
    if (result.success) {
      setIsAddCommOpen(false);
        setAlarmForm(INITIAL_COMMUNICATION_FORM);
    } else {
      console.error('Error creating communication alarm:', result.message);
      }
    }
  };

  const setRecipients = (newRecipients: string[]) => {
    setAlarmForm(prev => ({ ...prev, recipients: newRecipients }));
  };

  // Set default site when sites load
  useEffect(() => {
    if (sites.length > 0 && alarmForm.siteId === null) {
      setAlarmForm(prev => ({
        ...prev,
        siteId: sites[0].id,
      }));
    }
  }, [sites, alarmForm.siteId]);

  // Helper functions
  const populateAlarmFormForEdit = (alarm: any, type: 'threshold' | 'communication') => {
    if (type === 'threshold') {
      setAlarmForm({
      id: alarm.id, // Populate ID for editing
      siteId: sites.find(site => site.name === alarm.site)?.id || null,
      alarmName: alarm.alarmName,
      site: alarm.site, // Populate site
      field: mapNumberToField[alarm.field],
      operator: mapNumberToOperator[alarm.operator],
      threshold: alarm.threshold,
      color: alarm.color,
      severity: alarm.severity,
      recipients: alarm.recipients,
    });
    } else {
      setAlarmForm({
      id: alarm.id, // Populate ID for editing
      siteId: sites.find(site => site.name === alarm.site)?.id || null,
      alarmName: alarm.alarmName,
      site: alarm.site, // Populate site
      severity: alarm.severity,
      hours: alarm.hours,
      recipients: alarm.recipients,
    });
    }
  };
  
  const handleEditAlarm = async (type: 'threshold' | 'communication') => {
    if (type === 'threshold') {
    if (!currentThresholdAlarm) return;

      const { siteId, alarmName, field, operator, threshold, color } = alarmForm;
    
    if (!siteId || !alarmName || !field || !operator) {
      console.error('Missing required threshold alarm fields');
      return;
    }

    const requestBody: CreateThresholdAlarmRequest = {
      id: currentThresholdAlarm.id, // Use the existing alarm ID
      siteId,
      alarmName,
        emails: alarmForm.recipients.join(','),
      phones: '', // Assuming phones are combined into recipients
      method: 0,
      valueThreshold: {
          fieldName: mapFieldToNumber(field!),
          operator: mapNumberToOperator[operator!],
          thresholdValue: threshold!,
          colorCode: color!,
          severity: mapSeverityToNumber(alarmForm.severity),
      },
    };

    const result = await updateThresholdAlarm(currentThresholdAlarm.id, requestBody);
    if (result.success) {
      setIsEditThresholdOpen(false);
      setCurrentThresholdAlarm(null);
        setAlarmForm(INITIAL_THRESHOLD_FORM);
    } else {
      console.error('Error updating threshold alarm:', result.message);
    }
    } else {
    if (!currentCommunicationAlarm) return;

      const { siteId, alarmName, hours } = alarmForm;
    
    if (!siteId || !alarmName) {
      console.error('Missing required communication alarm fields');
      return;
    }

    const requestBody: CreateCommunicationAlarmRequest = {
      id: currentCommunicationAlarm.id, // Use the existing alarm ID
      siteId,
      alarmName,
        emails: alarmForm.recipients.join(','),
      phones: '', // Assuming phones are combined into recipients
      method: 0,
      communicationLoss: {
          severity: mapSeverityToNumber(alarmForm.severity),
          numHours: hours!,
      },
    };

    const result = await updateCommunicationAlarm(currentCommunicationAlarm.id, requestBody);
    if (result.success) {
      setIsEditCommOpen(false);
      setCurrentCommunicationAlarm(null);
        setAlarmForm(INITIAL_COMMUNICATION_FORM);
    } else {
      console.error('Error updating communication alarm:', result.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl">تكوين التنبيهات</h2>
        <p className="text-gray-500 mt-1">إدارة تنبيهات القيم وفقدان الاتصال</p>
      </div>

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

        {/* Threshold Alarms Tab */}
        <TabsContent value="threshold" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex justify-between items-center" dir="rtl">
              <CardTitle className="text-right">
                تنبيهات القيم الحدية ({thresholdAlarms.length})
              </CardTitle>
            
              <Dialog open={isAddThresholdOpen} onOpenChange={setIsAddThresholdOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة تنبيه جديد
                  </Button>
                </DialogTrigger>
                <AlarmFormDialog
                  alarmForm={alarmForm}
                  setAlarmForm={setAlarmForm}
                  sites={sites}
                  isEdit={false}
                  onClose={() => setIsAddThresholdOpen(false)}
                  onSubmit={() => handleSubmitAlarm('threshold')}
                  type="threshold"
                />
              </Dialog>
            </CardHeader>
            
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">إجراءات</TableHead>
                    <TableHead className="text-right">اللون</TableHead>
                    <TableHead className="text-right">الحقل</TableHead>
                    <TableHead className="text-right">الشرط</TableHead>
                    <TableHead className="text-right">المستلمون</TableHead>
                    <TableHead className="text-right">الخطورة</TableHead>
                    <TableHead className="text-right">الموقع</TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {thresholdAlarms.map((alarm) => (
                    <TableRow key={alarm.id}>
                      <TableCell className="text-right">
                        <Dialog open={isEditThresholdOpen && currentThresholdAlarm?.id === alarm.id} onOpenChange={setIsEditThresholdOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setCurrentThresholdAlarm(alarm);
                                populateAlarmFormForEdit(alarm, 'threshold');
                                setIsEditThresholdOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <AlarmFormDialog
                            alarmForm={alarmForm}
                            setAlarmForm={setAlarmForm}
                            sites={sites}
                            isEdit={true}
                            onClose={() => setIsEditThresholdOpen(false)}
                            onSubmit={() => handleEditAlarm('threshold')}
                            type="threshold"
                          />
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-right">
                        <div 
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: alarm.color }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{mapNumberToField[alarm.field]}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {mapNumberToOperator[alarm.operator]} {alarm.threshold}
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap gap-1 justify-end">
                          {alarm.recipients.map((recipient, idx) => {
                            const isEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(recipient);
                            const isPhone = /^\d{11}$/.test(recipient);
                            return (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {recipient}
                              </Badge>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{alarm.severity}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{alarm.site}</TableCell>
                      <TableCell className="text-right font-medium">{alarm.alarmName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Loss Alarms Tab */}
        <TabsContent value="communication" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex justify-between items-center" dir="rtl">
              <CardTitle className="text-right">
                تنبيهات فقدان الاتصال ({communicationAlarms.length})
              </CardTitle>
              
              <Dialog open={isAddCommOpen} onOpenChange={setIsAddCommOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة تنبيه جديد
                  </Button>
                </DialogTrigger>
                <AlarmFormDialog
                  alarmForm={alarmForm}
                  setAlarmForm={setAlarmForm}
                  sites={sites}
                  isEdit={false}
                  onClose={() => setIsAddCommOpen(false)}
                  onSubmit={() => handleSubmitAlarm('communication')}
                  type="communication"
                />
              </Dialog>
            </CardHeader>
            
            <CardContent>
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
                  {communicationAlarms.map((alarm) => (
                    <TableRow key={alarm.id}>
                      <TableCell className="text-right">
                        <Dialog open={isEditCommOpen && currentCommunicationAlarm?.id === alarm.id} onOpenChange={setIsEditCommOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setCurrentCommunicationAlarm(alarm);
                                populateAlarmFormForEdit(alarm, 'communication');
                                setIsEditCommOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4"/>
                            </Button>
                          </DialogTrigger>
                          <AlarmFormDialog
                            alarmForm={alarmForm}
                            setAlarmForm={setAlarmForm}
                            sites={sites}
                            isEdit={true}
                            onClose={() => setIsEditCommOpen(false)}
                            onSubmit={() => handleEditAlarm('communication')}
                            type="communication"
                          />
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap gap-1 justify-end">
                          {alarm.recipients.map((recipient, idx) => {
                            const isEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(recipient);
                            const isPhone = /^\d{11}$/.test(recipient);
                            return (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {recipient}
                              </Badge>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">
                          {alarm.hours} {alarm.hours === 1 ? 'ساعة' : 'ساعات'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{alarm.site}</TableCell>
                      <TableCell className="text-right font-medium">{alarm.alarmName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>    </div>
  );
}