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
import { Plus, Edit, AlertTriangle, WifiOff, Mail, Phone } from 'lucide-react';
import { useAlarmsData } from '../hooks/useAlarmsData';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '../../../components/ui/select';
import { 
  CreateThresholdAlarmRequest, 
  CreateCommunicationAlarmRequest 
} from '../types';
import { useSitesData } from '../../sites/hooks/useSitesData';
import Loader from '../../../components/ui/Loader'; // Import Loader component

const FIELD_MAP: { [key: string]: number } = {
  USWL: 0,
  DSWL: 1,
  Battery: 2,
  P1_Time: 3,
  P1_Flow: 4,
  P2_Time: 5,
  P2_Flow: 6,
  P3_Time: 7,
  P3_Flow: 8,
  P4_Time: 9,
  P4_Flow: 10,
  P5_Time: 11,
  P5_Flow: 12,
  P6_Time: 13,
  P6_Flow: 14,
  P7_Time: 15,
  P7_Flow: 16,
  P8_Time: 17,
  P8_Flow: 18,
  P9_Time: 19,
  P9_Flow: 20,
  P10_Time: 21,
  P10_Flow: 22,
  Calculated_flow: 23,
  Total_uptime: 24,
  Total_flow: 25,
};

const OPERATOR_MAP: { [key: string]: number } = {
  '>': 0,
  '<': 1,
  '>=': 2,
  '<=': 3,
  '==': 4,
  '!=': 5,
};

const mapNumberToOperator: { [key: number]: string } = {
  0: '>',
  1: '<',
  2: '>=',
  3: '<=',
  4: '==',
  5: '!=',
};

const mapFieldToNumber = (field: string): number => {
  const mappedValue = FIELD_MAP[field];
  if (mappedValue === undefined) {
    throw new Error(`Unknown field: ${field}`);
  }
  return mappedValue;
};

const mapOperatorToNumber = (operator: string): number => {
  const mappedValue = OPERATOR_MAP[operator];
  if (mappedValue === undefined) {
    throw new Error(`Unknown operator: ${operator}`);
  }
  return mappedValue;
};

const mapSeverityToNumber = (severity: 'Warning' | 'Critical'): number => 
    severity === 'Warning' ? 0 : 1;

const mapNumberToField: { [key: number]: string } = {
  0: 'USWL',
  1: 'DSWL',
  2: 'Battery',
  3: 'P1_Time',
  4: 'P1_Flow',
  5: 'P2_Time',
  6: 'P2_Flow',
  7: 'P3_Time',
  8: 'P3_Flow',
  9: 'P4_Time',
  10: 'P4_Flow',
  11: 'P5_Time',
  12: 'P5_Flow',
  13: 'P6_Time',
  14: 'P6_Flow',
  15: 'P7_Time',
  16: 'P7_Flow',
  17: 'P8_Time',
  18: 'P8_Flow',
  19: 'P9_Time',
  20: 'P9_Flow',
  21: 'P10_Time',
  22: 'P10_Flow',
  23: 'Calculated_flow',
  24: 'Total_uptime',
  25: 'Total_flow',
};

const FIELDS = [
  'USWL',
  'DSWL',
  'Battery',
  'P1_Time',
  'P1_Flow',
  'P2_Time',
  'P2_Flow',
  'P3_Time',
  'P3_Flow',
  'P4_Time',
  'P4_Flow',
  'P5_Time',
  'P5_Flow',
  'P6_Time',
  'P6_Flow',
  'P7_Time',
  'P7_Flow',
  'P8_Time',
  'P8_Flow',
  'P9_Time',
  'P9_Flow',
  'P10_Time',
  'P10_Flow',
  'Calculated_flow',
  'Total_uptime',
  'Total_flow',
];
const OPERATORS = ['>', '<', '>=', '<=', '==', '!='];

interface ThresholdAlarmForm {
  id: number; // Added for editing existing alarms
  siteId: number | null;
  alarmName: string;
  site: string; // Added site property
  field: string;
  operator: string;
  threshold: number;
  color: string;
  severity: 'Warning' | 'Critical';
  recipients: string[];
}

interface CommunicationAlarmForm {
  id: number; // Added for editing existing alarms
  siteId: number | null;
  alarmName: string;
  site: string; // Added site property
  severity: 'Warning' | 'Critical';
  hours: number;
  recipients: string[];
}

const INITIAL_THRESHOLD_FORM: ThresholdAlarmForm = {
  id: 0, // Placeholder for new alarms
  siteId: null,
  alarmName: '',
  site: '', // Added site property
  field: '',
  operator: '',
  threshold: 0,
  color: '#fbbf24',
  severity: 'Warning',
  recipients: [],
};

const INITIAL_COMMUNICATION_FORM: CommunicationAlarmForm = {
  id: 0, // Placeholder for new alarms
  siteId: null,
  alarmName: '',
  site: '', // Added site property
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
    isLoading, // Destructure isLoading from useAlarmsData
  } = useAlarmsData();

  const { sites } = useSitesData();
  
  const [activeTab, setActiveTab] = useState('threshold');
  const [isAddThresholdOpen, setIsAddThresholdOpen] = useState(false);
  const [isEditThresholdOpen, setIsEditThresholdOpen] = useState(false);
  const [currentThresholdAlarm, setCurrentThresholdAlarm] = useState<ThresholdAlarmForm | null>(null);
  const [newThresholdAlarmForm, setNewThresholdAlarmForm] = useState<ThresholdAlarmForm>(INITIAL_THRESHOLD_FORM);
  const [newCommunicationAlarmForm, setNewCommunicationAlarmForm] = useState<CommunicationAlarmForm>(INITIAL_COMMUNICATION_FORM);
  const [isEditCommOpen, setIsEditCommOpen] = useState(false);
  const [currentCommunicationAlarm, setCurrentCommunicationAlarm] = useState<CommunicationAlarmForm | null>(null);
  const [isSubmittingThresholdAdd, setIsSubmittingThresholdAdd] = useState(false); // New state for add threshold dialog
  const [isSubmittingThresholdEdit, setIsSubmittingThresholdEdit] = useState(false); // New state for edit threshold dialog
  const [isSubmittingCommAdd, setIsSubmittingCommAdd] = useState(false); // New state for add communication dialog
  const [isSubmittingCommEdit, setIsSubmittingCommEdit] = useState(false); // New state for edit communication dialog

  // Form submission handlers
  const handleSubmitThresholdAlarm = async () => {
    setIsSubmittingThresholdAdd(true); // Set submitting state to true
    const { siteId, alarmName, field, operator, threshold, color } = newThresholdAlarmForm;
    
    if (!siteId || !alarmName || !field || !operator) {
      console.error('Missing required threshold alarm fields');
      setIsSubmittingThresholdAdd(false); // Reset on validation failure
      return;
    }

    const requestBody: CreateThresholdAlarmRequest = {
      id: 0,
      siteId,
      alarmName,
      emails: newThresholdAlarmForm.recipients.join(','),
      phones: '', // Assuming phones are combined into recipients
      method: 0,
      valueThreshold: {
        fieldName: mapFieldToNumber(field),
        operator: mapOperatorToNumber(operator),
        thresholdValue: threshold,
        colorCode: color,
        severity: mapSeverityToNumber(newThresholdAlarmForm.severity),
      },
    };

    try {
      const result = await createThresholdAlarm(requestBody);
      if (result.success) {
        setIsAddThresholdOpen(false);
        setNewThresholdAlarmForm(INITIAL_THRESHOLD_FORM);
      } else {
        console.error('Error creating threshold alarm:', result.message);
      }
    } finally {
      setIsSubmittingThresholdAdd(false); // Reset submitting state to false
    }
  };

  const handleSubmitCommunicationAlarm = async () => {
    setIsSubmittingCommAdd(true); // Set submitting state to true
    const { siteId, alarmName, hours } = newCommunicationAlarmForm;
    
    if (!siteId || !alarmName) {
      console.error('Missing required communication alarm fields');
      setIsSubmittingCommAdd(false); // Reset on validation failure
      return;
    }

    const requestBody: CreateCommunicationAlarmRequest = {
      id: 0,
      siteId,
      alarmName,
      emails: newCommunicationAlarmForm.recipients.join(','),
      phones: '', // Assuming phones are combined into recipients
      method: 0,
      communicationLoss: {
        severity: mapSeverityToNumber(newCommunicationAlarmForm.severity),
        numHours: hours,
      },
    };

    try {
      const result = await createCommunicationAlarm(requestBody);
      if (result.success) {
        setIsAddCommOpen(false);
        setNewCommunicationAlarmForm(INITIAL_COMMUNICATION_FORM);
      } else {
        console.error('Error creating communication alarm:', result.message);
      }
    } finally {
      setIsSubmittingCommAdd(false); // Reset submitting state to false
    }
  };

  const setThresholdRecipients = (newRecipients: string[]) => {
    setNewThresholdAlarmForm(prev => ({ ...prev, recipients: newRecipients }));
  };

  const setCommunicationRecipients = (newRecipients: string[]) => {
    setNewCommunicationAlarmForm(prev => ({ ...prev, recipients: newRecipients }));
  };

  // Set default site when sites load
  useEffect(() => {
    if (sites.length > 0 && newThresholdAlarmForm.siteId === null) {
      setNewThresholdAlarmForm(prev => ({ ...prev, siteId: sites[0].id }));
    }
  }, [sites, newThresholdAlarmForm.siteId]);

  useEffect(() => {
    if (sites.length > 0 && newCommunicationAlarmForm.siteId === null) {
      setNewCommunicationAlarmForm(prev => ({ ...prev, siteId: sites[0].id }));
    }
  }, [sites, newCommunicationAlarmForm.siteId]);

  useEffect(() => {
    if (!isAddThresholdOpen) {
      setIsSubmittingThresholdAdd(false); // Reset submitting state when dialog closes
    }
  }, [isAddThresholdOpen]);

  useEffect(() => {
    if (!isEditThresholdOpen) {
      setIsSubmittingThresholdEdit(false); // Reset submitting state when dialog closes
    }
  }, [isEditThresholdOpen]);

  useEffect(() => {
    if (!isAddCommOpen) {
      setIsSubmittingCommAdd(false); // Reset submitting state when dialog closes
    }
  }, [isAddCommOpen]);

  useEffect(() => {
    if (!isEditCommOpen) {
      setIsSubmittingCommEdit(false); // Reset submitting state when dialog closes
    }
  }, [isEditCommOpen]);

  // Helper functions
  const populateThresholdAlarmFormForEdit = (alarm: any) => {
    setNewThresholdAlarmForm({
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
  };
  
  const populateCommunicationAlarmFormForEdit = (alarm: any) => {
    setNewCommunicationAlarmForm({
      id: alarm.id, // Populate ID for editing
      siteId: sites.find(site => site.name === alarm.site)?.id || null,
      alarmName: alarm.alarmName,
      site: alarm.site, // Populate site
      severity: alarm.severity,
      hours: alarm.hours,
      recipients: alarm.recipients,
    });
  };
  
  const mapFieldToNumber = (field: string): number => {
    const mappedValue = FIELD_MAP[field];
    if (mappedValue === undefined) {
      throw new Error(`Unknown field: ${field}`);
    }
    return mappedValue;
  };

  const mapOperatorToNumber = (operator: string): number => {
    const mappedValue = OPERATOR_MAP[operator];
    if (mappedValue === undefined) {
      throw new Error(`Unknown operator: ${operator}`);
    }
    return mappedValue;
  };

  const mapSeverityToNumber = (severity: 'Warning' | 'Critical'): number => 
    severity === 'Warning' ? 0 : 1;

  // Recipient management
  const RecipientInput = ({
    type,
    forAlarmType,
    recipients,
    setRecipients
  }: {
    type: 'email' | 'phone';
    forAlarmType: 'threshold' | 'communication';
    recipients: string[];
    setRecipients: (newRecipients: string[]) => void; // Modified to accept a function
  }) => {
    const isEmail = type === 'email';
    const [inputValue, setInputValue] = useState('');

    const handleAdd = (alarmType: 'threshold' | 'communication', newRecipient: string) => {
      if (newRecipient.trim() === '') return;

      const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
      const phoneRegex = /^\d{11}$/;

      if (isEmail && !emailRegex.test(newRecipient)) {
        alert('Please enter a valid email address.');
        return;
      } else if (!isEmail && !phoneRegex.test(newRecipient)) {
        alert('Please enter a valid 11-digit phone number.');
        return;
      }

      if (alarmType === 'threshold') {
        setThresholdRecipients([...newThresholdAlarmForm.recipients, newRecipient]);
        setInputValue('');
      } else {
        setCommunicationRecipients([...newCommunicationAlarmForm.recipients, newRecipient]);
        setInputValue('');
      }
    };

    const handleRemove = (recipientToRemove: string, alarmType: 'threshold' | 'communication') => {
      if (alarmType === 'threshold') {
        setThresholdRecipients(newThresholdAlarmForm.recipients.filter(r => r !== recipientToRemove));
      } else {
        setCommunicationRecipients(newCommunicationAlarmForm.recipients.filter(r => r !== recipientToRemove));
      }
    };

    return (
      <div className="space-y-2">
        <Label>{isEmail ? 'المستلمون (البريد الإلكتروني)' : 'المستلمون (أرقام الهواتف)'}</Label>
        <div className="flex gap-2">
          <Input
            type={isEmail ? 'email' : 'tel'}
            placeholder={isEmail ? 'email@example.com' : '0123456789'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAdd(forAlarmType, inputValue);
                setInputValue(''); 
              }
            }}
          />
          <Button type="button" onClick={() => {
            handleAdd(forAlarmType, inputValue);
            setInputValue(''); 
          }}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {recipients.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {recipients.map(recipient => {
              const isEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(recipient);
              const isPhone = /^\d{11}$/.test(recipient);
              return (
                <Badge key={recipient} variant="secondary" className="flex items-center gap-1">
                  {isEmail && <Mail className="ml-1 h-3 w-3" />}
                  {isPhone && <Phone className="ml-1 h-3 w-3" />}
                  {recipient}
                  <button
                    onClick={() => handleRemove(recipient, forAlarmType)}
                    className="mr-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const handleEditThresholdAlarm = async () => {
    setIsSubmittingThresholdEdit(true); // Set submitting state to true
    if (!currentThresholdAlarm) return;

    const { siteId, alarmName, field, operator, threshold, color } = newThresholdAlarmForm;
    
    if (!siteId || !alarmName || !field || !operator) {
      console.error('Missing required threshold alarm fields');
      setIsSubmittingThresholdEdit(false); // Reset on validation failure
      return;
    }

    const requestBody: CreateThresholdAlarmRequest = {
      id: currentThresholdAlarm.id, // Use the existing alarm ID
      siteId,
      alarmName,
      emails: newThresholdAlarmForm.recipients.join(','),
      phones: '', // Assuming phones are combined into recipients
      method: 0,
      valueThreshold: {
        fieldName: mapFieldToNumber(field),
        operator: mapOperatorToNumber(operator),
        thresholdValue: threshold,
        colorCode: color,
        severity: mapSeverityToNumber(newThresholdAlarmForm.severity),
      },
    };

    try {
      const result = await updateThresholdAlarm(currentThresholdAlarm.id, requestBody);
      if (result.success) {
        setIsEditThresholdOpen(false);
        setCurrentThresholdAlarm(null);
        setNewThresholdAlarmForm(INITIAL_THRESHOLD_FORM);
      } else {
        console.error('Error updating threshold alarm:', result.message);
      }
    } finally {
      setIsSubmittingThresholdEdit(false); // Reset submitting state to false
    }
  };

  const handleEditCommunicationAlarm = async () => {
    setIsSubmittingCommEdit(true); // Set submitting state to true
    if (!currentCommunicationAlarm) return;

    const { siteId, alarmName, hours } = newCommunicationAlarmForm;
    
    if (!siteId || !alarmName) {
      console.error('Missing required communication alarm fields');
      setIsSubmittingCommEdit(false); // Reset on validation failure
      return;
    }

    const requestBody: CreateCommunicationAlarmRequest = {
      id: currentCommunicationAlarm.id, // Use the existing alarm ID
      siteId,
      alarmName,
      emails: newCommunicationAlarmForm.recipients.join(','),
      phones: '', // Assuming phones are combined into recipients
      method: 0,
      communicationLoss: {
        severity: mapSeverityToNumber(newCommunicationAlarmForm.severity),
        numHours: hours,
      },
    };

    try {
      const result = await updateCommunicationAlarm(currentCommunicationAlarm.id, requestBody);
      if (result.success) {
        setIsEditCommOpen(false);
        setCurrentCommunicationAlarm(null);
        setNewCommunicationAlarmForm(INITIAL_COMMUNICATION_FORM);
      } else {
        console.error('Error updating communication alarm:', result.message);
      }
    } finally {
      setIsSubmittingCommEdit(false); // Reset submitting state to false
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
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader />
            </div>
          ) : (
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
                <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-right">إضافة تنبيه قيمة حدية</DialogTitle>
                    <DialogDescription className="text-right">
                      تكوين تنبيه جديد عند تجاوز قيمة معينة
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>الموقع</Label>
                      <Select 
                        onValueChange={(value) => setNewThresholdAlarmForm(prev => ({ 
                          ...prev, 
                          siteId: parseInt(value) 
                        }))} 
                        value={newThresholdAlarmForm.siteId?.toString() || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الموقع" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map(site => (
                            <SelectItem key={site.id} value={site.id.toString()}>
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>اسم التنبيه</Label>
                      <Input 
                        type="text" 
                        placeholder="اسم التنبيه" 
                        value={newThresholdAlarmForm.alarmName} 
                        onChange={(e) => setNewThresholdAlarmForm(prev => ({ 
                          ...prev, 
                          alarmName: e.target.value 
                        }))} 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>الحقل</Label>
                      <Select 
                        onValueChange={(value) => setNewThresholdAlarmForm(prev => ({ 
                          ...prev, 
                          field: value 
                        }))} 
                        value={newThresholdAlarmForm.field}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحقل" />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELDS.map(field => (
                            <SelectItem key={field} value={field}>{field}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>المعامل</Label>
                        <Select 
                          onValueChange={(value) => setNewThresholdAlarmForm(prev => ({ 
                            ...prev, 
                            operator: value 
                          }))} 
                          value={newThresholdAlarmForm.operator}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المعامل" />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERATORS.map(op => (
                              <SelectItem key={op} value={op}>{op}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>القيمة الحدية</Label>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="12.5" 
                          value={newThresholdAlarmForm.threshold} 
                          onChange={(e) => setNewThresholdAlarmForm(prev => ({ 
                            ...prev, 
                            threshold: parseFloat(e.target.value) || 0
                          }))} 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>مستوى الخطورة</Label>
                      <Select 
                        onValueChange={(value: 'Warning' | 'Critical') => setNewThresholdAlarmForm(prev => ({ 
                          ...prev, 
                          severity: value 
                        }))} 
                        value={newThresholdAlarmForm.severity}
                      >
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
                        <Input 
                          type="color" 
                          className="w-20" 
                          value={newThresholdAlarmForm.color} 
                          onChange={(e) => setNewThresholdAlarmForm(prev => ({ 
                            ...prev, 
                            color: e.target.value 
                          }))} 
                        />
                        <Input 
                          type="text" 
                          className="flex-1" 
                          value={newThresholdAlarmForm.color} 
                          onChange={(e) => setNewThresholdAlarmForm(prev => ({ 
                            ...prev, 
                            color: e.target.value 
                          }))} 
                        />
                      </div>
                    </div>

                    <RecipientInput 
                      type="email" 
                      forAlarmType="threshold" 
                      recipients={newThresholdAlarmForm.recipients} 
                      setRecipients={setThresholdRecipients}
                    />
                    
                    <RecipientInput 
                      type="phone" 
                      forAlarmType="threshold" 
                      recipients={newThresholdAlarmForm.recipients} 
                      setRecipients={setThresholdRecipients}
                    />
                  </div>

                  <DialogFooter>
                    <div className="w-full flex justify-start gap-2">
                      <Button variant="outline" onClick={() => setIsAddThresholdOpen(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleSubmitThresholdAlarm} disabled={isSubmittingThresholdAdd || !newThresholdAlarmForm.siteId || !newThresholdAlarmForm.alarmName || !newThresholdAlarmForm.field || !newThresholdAlarmForm.operator} loadingText="جاري الإضافة..." isLoading={isSubmittingThresholdAdd}>
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
                                populateThresholdAlarmFormForEdit(alarm);
                                setIsEditThresholdOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto" dir="rtl">
                            <DialogHeader>
                              <DialogTitle className="text-right">تعديل تنبيه قيمة حدية</DialogTitle>
                              <DialogDescription className="text-right">
                                تعديل تكوين التنبيه الحالي
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>الموقع</Label>
                                {currentThresholdAlarm ? (
                                  <Input type="text" value={currentThresholdAlarm.site} disabled />
                                ) : (
                                  <Select 
                                    onValueChange={(value) => setNewThresholdAlarmForm(prev => ({
                                      ...prev, 
                                      siteId: parseInt(value)
                                    }))} 
                                    value={newThresholdAlarmForm.siteId?.toString() || ""}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر الموقع" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {sites.map(site => (
                                        <SelectItem key={site.id} value={site.id.toString()}>
                                          {site.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label>اسم التنبيه</Label>
                                <Input 
                                  type="text" 
                                  placeholder="اسم التنبيه" 
                                  value={newThresholdAlarmForm.alarmName} 
                                  onChange={(e) => setNewThresholdAlarmForm(prev => ({ 
                                    ...prev, 
                                    alarmName: e.target.value 
                                  }))} 
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>الحقل</Label>
                                <Select 
                                  onValueChange={(value) => setNewThresholdAlarmForm(prev => ({ 
                                    ...prev, 
                                    field: value 
                                  }))} 
                                  value={newThresholdAlarmForm.field}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر الحقل" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {FIELDS.map(field => (
                                      <SelectItem key={field} value={field}>{field}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>المعامل</Label>
                                  <Select 
                                    onValueChange={(value) => setNewThresholdAlarmForm(prev => ({ 
                                      ...prev, 
                                      operator: value 
                                    }))} 
                                    value={newThresholdAlarmForm.operator}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر المعامل" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {OPERATORS.map(op => (
                                        <SelectItem key={op} value={op}>{op}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>القيمة الحدية</Label>
                                  <Input 
                                    type="number" 
                                    step="0.1" 
                                    placeholder="12.5" 
                                    value={newThresholdAlarmForm.threshold} 
                                    onChange={(e) => setNewThresholdAlarmForm(prev => ({ 
                                      ...prev, 
                                      threshold: parseFloat(e.target.value) || 0
                                    }))} 
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>مستوى الخطورة</Label>
                                <Select 
                                  onValueChange={(value: 'Warning' | 'Critical') => setNewThresholdAlarmForm(prev => ({ 
                                    ...prev, 
                                    severity: value 
                                  }))} 
                                  value={newThresholdAlarmForm.severity}
                                >
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
                                  <Input 
                                    type="color" 
                                    className="w-20" 
                                    value={newThresholdAlarmForm.color} 
                                    onChange={(e) => setNewThresholdAlarmForm(prev => ({ 
                                      ...prev, 
                                      color: e.target.value 
                                    }))} 
                                  />
                                  <Input 
                                    type="text" 
                                    className="flex-1" 
                                    value={newThresholdAlarmForm.color} 
                                    onChange={(e) => setNewThresholdAlarmForm(prev => ({ 
                                      ...prev, 
                                      color: e.target.value 
                                    }))} 
                                  />
                                </div>
                              </div>

                              <RecipientInput 
                                type="email" 
                                forAlarmType="threshold" 
                                recipients={newThresholdAlarmForm.recipients} 
                                setRecipients={setThresholdRecipients}
                              />
                              
                              <RecipientInput 
                                type="phone" 
                                forAlarmType="threshold" 
                                recipients={newThresholdAlarmForm.recipients} 
                                setRecipients={setThresholdRecipients}
                              />
                            </div>

                            <DialogFooter>
                              <div className="w-full flex justify-start gap-2">
                                <Button variant="outline" onClick={() => setIsEditThresholdOpen(false)}>
                                  إلغاء
                                </Button>
                                <Button onClick={handleEditThresholdAlarm} disabled={isSubmittingThresholdEdit || !newThresholdAlarmForm.siteId || !newThresholdAlarmForm.alarmName || !newThresholdAlarmForm.field || !newThresholdAlarmForm.operator} loadingText="جاري الحفظ..." isLoading={isSubmittingThresholdEdit}>
                                  حفظ التغييرات
                                </Button>
                              </div>
                            </DialogFooter>
                          </DialogContent>
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
                                {isEmail && <Mail className="ml-1 h-3 w-3" />}
                                {isPhone && <Phone className="ml-1 h-3 w-3" />}
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
          )}
        </TabsContent>

        {/* Communication Loss Alarms Tab */}
        <TabsContent value="communication" className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader />
            </div>
          ) : (
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
                <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto" dir="rtl">
                  <DialogHeader>
                    <DialogTitle className="text-right">إضافة تنبيه فقدان اتصال</DialogTitle>
                    <DialogDescription className="text-right">
                      تكوين تنبيه عند انقطاع البيانات لفترة محددة
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>الموقع</Label>
                      <Select 
                        onValueChange={(value) => setNewCommunicationAlarmForm(prev => ({ 
                          ...prev, 
                          siteId: parseInt(value) 
                        }))} 
                        value={newCommunicationAlarmForm.siteId?.toString() || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الموقع" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map(site => (
                            <SelectItem key={site.id} value={site.id.toString()}>
                              {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>اسم التنبيه</Label>
                      <Input 
                        type="text" 
                        placeholder="اسم التنبيه" 
                        value={newCommunicationAlarmForm.alarmName} 
                        onChange={(e) => setNewCommunicationAlarmForm(prev => ({ 
                          ...prev, 
                          alarmName: e.target.value 
                        }))} 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>عدد الساعات</Label>
                      <Input 
                        type="number" 
                        placeholder="2" 
                        value={newCommunicationAlarmForm.hours} 
                        onChange={(e) => setNewCommunicationAlarmForm(prev => ({ 
                          ...prev, 
                          hours: parseInt(e.target.value) || 0 
                        }))} 
                      />
                      <p className="text-xs text-gray-500">
                        سيتم إرسال تنبيه إذا لم تصل بيانات لهذا العدد من الساعات
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>مستوى الخطورة</Label>
                      <Select 
                        onValueChange={(value: 'Warning' | 'Critical') => setNewCommunicationAlarmForm(prev => ({ 
                          ...prev, 
                          severity: value 
                        }))} 
                        value={newCommunicationAlarmForm.severity}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المستوى" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Warning">تحذير</SelectItem>
                          <SelectItem value="Critical">حرج</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <RecipientInput 
                      type="email" 
                      forAlarmType="communication" 
                      recipients={newCommunicationAlarmForm.recipients} 
                      setRecipients={setCommunicationRecipients}
                    />
                    
                    <RecipientInput 
                      type="phone" 
                      forAlarmType="communication" 
                      recipients={newCommunicationAlarmForm.recipients} 
                      setRecipients={setCommunicationRecipients}
                    />
                  </div>

                  <DialogFooter>
                    <div className="w-full flex justify-start gap-2">
                      <Button variant="outline" onClick={() => setIsAddCommOpen(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleSubmitCommunicationAlarm} disabled={isSubmittingCommAdd || !newCommunicationAlarmForm.siteId || !newCommunicationAlarmForm.alarmName} loadingText="جاري الإضافة..." isLoading={isSubmittingCommAdd}>
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
                                populateCommunicationAlarmFormForEdit(alarm);
                                setIsEditCommOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4"/>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto" dir="rtl">
                            <DialogHeader>
                              <DialogTitle className="text-right">تعديل تنبيه فقدان اتصال</DialogTitle>
                              <DialogDescription className="text-right">
                                تعديل تكوين التنبيه الحالي
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>الموقع</Label>
                                {currentCommunicationAlarm ? (
                                  <Input type="text" value={currentCommunicationAlarm.site} disabled />
                                ) : (
                                  <Select 
                                    onValueChange={(value) => setNewCommunicationAlarmForm(prev => ({
                                      ...prev, 
                                      siteId: parseInt(value)
                                    }))} 
                                    value={newCommunicationAlarmForm.siteId?.toString() || ""}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر الموقع" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {sites.map(site => (
                                        <SelectItem key={site.id} value={site.id.toString()}>
                                          {site.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label>اسم التنبيه</Label>
                                <Input 
                                  type="text" 
                                  placeholder="اسم التنبيه" 
                                  value={newCommunicationAlarmForm.alarmName} 
                                  onChange={(e) => setNewCommunicationAlarmForm(prev => ({
                                    ...prev, 
                                    alarmName: e.target.value 
                                  }))} 
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>عدد الساعات</Label>
                                <Input 
                                  type="number" 
                                  placeholder="2" 
                                  value={newCommunicationAlarmForm.hours} 
                                  onChange={(e) => setNewCommunicationAlarmForm(prev => ({
                                    ...prev, 
                                    hours: parseInt(e.target.value) || 0 
                                  }))} 
                                />
                                <p className="text-xs text-gray-500">
                                  سيتم إرسال تنبيه إذا لم تصل بيانات لهذا العدد من الساعات
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label>مستوى الخطورة</Label>
                                <Select 
                                  onValueChange={(value: 'Warning' | 'Critical') => setNewCommunicationAlarmForm(prev => ({
                                    ...prev, 
                                    severity: value 
                                  }))} 
                                  value={newCommunicationAlarmForm.severity}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر المستوى" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Warning">تحذير</SelectItem>
                                    <SelectItem value="Critical">حرج</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <RecipientInput 
                                type="email" 
                                forAlarmType="communication" 
                                recipients={newCommunicationAlarmForm.recipients} 
                                setRecipients={setCommunicationRecipients}
                              />
                              
                              <RecipientInput 
                                type="phone" 
                                forAlarmType="communication" 
                                recipients={newCommunicationAlarmForm.recipients} 
                                setRecipients={setCommunicationRecipients}
                              />
                            </div>

                            <DialogFooter>
                              <div className="w-full flex justify-start gap-2">
                                <Button variant="outline" onClick={() => setIsEditCommOpen(false)}>
                                  إلغاء
                                </Button>
                                <Button onClick={handleEditCommunicationAlarm} disabled={isSubmittingCommEdit || !newCommunicationAlarmForm.siteId || !newCommunicationAlarmForm.alarmName} loadingText="جاري الحفظ..." isLoading={isSubmittingCommEdit}>
                                  حفظ التغييرات
                                </Button>
                              </div>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap gap-1 justify-end">
                          {alarm.recipients.map((recipient, idx) => {
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
          )}
        </TabsContent>
      </Tabs>    </div>
  );
}
