import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  CreateCommunicationAlarmRequest,
  AlarmMethod,
  Severity
} from '../types/index';
import apiService, { ApiResponse } from '../../../shared/utils/apiService'; // Import apiService
import Loader from '../../../components/ui/Loader'; // Import Loader component

const FIELD_MAP: { [key: string]: number } = {
  USWL: 0,
  DSWL1: 1,
  DSWL2: 26,
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
  '<': 0,
  '<=': 1,
  '>': 2,
  '>=': 3,
  '==': 4,
  '!=': 5,
};

const mapNumberToOperator: { [key: number]: string } = {
  0: '<',
  1: '<=',
  2: '>',
  3: '>=',
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
  1: 'DSWL1',
  26: 'DSWL2',
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
  'DSWL1',
  'DSWL2',
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

interface Site {
  id: number;
  name: string;
}

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
  emails: string[];
  phones: string[];
}

interface CommunicationAlarmForm {
  id: number; // Added for editing existing alarms
  siteId: number | null;
  alarmName: string;
  site: string; // Added site property
  severity: 'Warning' | 'Critical';
  hours: number;
  emails: string[];
  phones: string[];
}

interface SiteDetails {
  id: number;
  code: string;
  name: string;
  siteType: string;
  canal: string;
  longitude: number;
  latitude: number;
  directorateName: string;
  hasUS: boolean;
  hasDS1: boolean;
  hasDS2: boolean;
  numPumps: number;
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
  emails: [],
  phones: [],
};

const INITIAL_COMMUNICATION_FORM: CommunicationAlarmForm = {
  id: 0, // Placeholder for new alarms
  siteId: null,
  alarmName: '',
  site: '', // Added site property
  severity: 'Warning',
  hours: 0,
  emails: [],
  phones: [],
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

  const [sites, setSites] = useState<Site[]>([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [sitesError, setSitesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setSitesLoading(true);
        const response = await apiService.get<Site[]>('/v1/Lookups/Lookup/Sites');
        setSites(response);
      } catch (error) {
        setSitesError(error instanceof Error ? error.message : 'Failed to fetch sites');
      } finally {
        setSitesLoading(false);
      }
    };
    fetchSites();
  }, []);

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
  const [hasThresholdChanges, setHasThresholdChanges] = useState(false); // New state to track changes in threshold form
  const [hasCommunicationChanges, setHasCommunicationChanges] = useState(false); // New state to track changes in communication form

  const [availableFields, setAvailableFields] = useState<string[]>(FIELDS);
  const [isFetchingSiteDetails, setIsFetchingSiteDetails] = useState(false);

  useEffect(() => {
    const fetchSiteDetails = async () => {
      if (!newThresholdAlarmForm.siteId) {
        setAvailableFields(FIELDS);
        return;
      }

      setIsFetchingSiteDetails(true);
      try {
        const response = await apiService.get<ApiResponse<SiteDetails>>(`/v1/Sites/${newThresholdAlarmForm.siteId}`);
        if (response.isSuccess && response.data) {
          const site = response.data;
          const newFields = ['Calculated_flow', 'Total_uptime', 'Total_flow', 'Battery'];

          if (site.hasUS) newFields.push('USWL');
          if (site.hasDS1) newFields.push('DSWL1');
          if (site.hasDS2) newFields.push('DSWL2');

          for (let i = 1; i <= site.numPumps; i++) {
            newFields.push(`P${i}_Time`);
            newFields.push(`P${i}_Flow`);
          }

          setAvailableFields(newFields);
        }
      } catch (error) {
        console.error("Error fetching site details", error);
        setAvailableFields(FIELDS);
      } finally {
        setIsFetchingSiteDetails(false);
      }
    };

    fetchSiteDetails();
  }, [newThresholdAlarmForm.siteId]);

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
      emails: newThresholdAlarmForm.emails.join(','),
      phones: newThresholdAlarmForm.phones.join(','),
      method: AlarmMethod.Email, // Changed from 0 to AlarmMethod.Email
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
      emails: newCommunicationAlarmForm.emails.join(','),
      phones: newCommunicationAlarmForm.phones.join(','),
      method: AlarmMethod.Email, // Changed from 0 to AlarmMethod.Email
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

  const setThresholdEmails = (newEmails: string[]) => {
    setNewThresholdAlarmForm(prev => ({ ...prev, emails: newEmails }));
  };

  const setThresholdPhones = (newPhones: string[]) => {
    setNewThresholdAlarmForm(prev => ({ ...prev, phones: newPhones }));
  };

  const setCommunicationEmails = (newEmails: string[]) => {
    setNewCommunicationAlarmForm(prev => ({ ...prev, emails: newEmails }));
  };

  const setCommunicationPhones = (newPhones: string[]) => {
    setNewCommunicationAlarmForm(prev => ({ ...prev, phones: newPhones }));
  };

  // Set default site when sites load
  useEffect(() => {
    if (sites.length > 0 && newThresholdAlarmForm.siteId === null) {
      setNewThresholdAlarmForm(prev => ({ ...prev, siteId: sites[0].id, site: sites[0].name }));
    }
  }, [sites, newThresholdAlarmForm.siteId]);

  useEffect(() => {
    if (sites.length > 0 && newCommunicationAlarmForm.siteId === null) {
      setNewCommunicationAlarmForm(prev => ({ ...prev, siteId: sites[0].id, site: sites[0].name }));
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
      setHasThresholdChanges(false); // Reset changes tracker
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
      setHasCommunicationChanges(false); // Reset changes tracker
    }
  }, [isEditCommOpen]);

  // Helper functions
  const populateThresholdAlarmFormForEdit = (alarm: any) => {
    // Find siteId from sites array if not present in alarm
    let siteId = alarm.siteId;
    if (!siteId && alarm.site) {
      const matchingSite = sites.find(s => s.name === alarm.site);
      siteId = matchingSite?.id;
    }

    // If still no siteId, try to find by trimming and case-insensitive match
    if (!siteId && alarm.site) {
      const matchingSite = sites.find(s => s.name.trim().toLowerCase() === alarm.site.trim().toLowerCase());
      siteId = matchingSite?.id;
    }

    // Separate emails and phones from recipients
    const emails: string[] = [];
    const phones: string[] = [];

    if (alarm.recipients && Array.isArray(alarm.recipients)) {
      alarm.recipients.forEach((recipient: string) => {
        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        const phoneRegex = /^\d{11}$/;
        if (emailRegex.test(recipient)) {
          emails.push(recipient);
        } else if (phoneRegex.test(recipient)) {
          phones.push(recipient);
        }
      });
    }

    const formData = {
      id: alarm.id, // Populate ID for editing
      siteId: siteId || null, // Use null if still undefined
      alarmName: alarm.alarmName,
      site: alarm.site, // Populate site
      field: mapNumberToField[alarm.field],
      operator: mapNumberToOperator[alarm.operator],
      threshold: alarm.threshold,
      color: alarm.color,
      severity: alarm.severity,
      emails: emails,
      phones: phones,
    };
    setNewThresholdAlarmForm(formData);
    setHasThresholdChanges(false); // Reset changes tracker when form is populated
  };

  const populateCommunicationAlarmFormForEdit = (alarm: any) => {
    const emails = alarm.emails ? alarm.emails.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const phones = alarm.phones ? alarm.phones.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

    // Find siteId from sites array if not present in alarm
    let siteId = alarm.siteId;
    if (!siteId && alarm.siteName) {
      const matchingSite = sites.find(s => s.name === alarm.siteName);
      siteId = matchingSite?.id;
    }

    setNewCommunicationAlarmForm({
      id: alarm.alarmId, // Populate ID for editing
      siteId: siteId,
      alarmName: alarm.alarmName,
      site: alarm.siteName || '', // Populate site
      severity: alarm.severity === Severity.Warning ? 'Warning' : 'Critical',
      hours: alarm.numHours || 0,
      emails: emails,
      phones: phones,
    });
    setHasCommunicationChanges(false); // Reset changes tracker when form is populated
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
    setRecipients,
    setHasChanges // New prop for setting hasChanges flag
  }: {
    type: 'email' | 'phone';
    forAlarmType: 'threshold' | 'communication';
    recipients: string[];
    setRecipients: (newRecipients: string[]) => void; // Modified to accept a function
    setHasChanges: (hasChanges: boolean) => void; // New prop for setting hasChanges flag
  }) => {
    const isEmail = type === 'email';
    const [inputValue, setInputValue] = useState('');

    const handleAdd = (newRecipient: string) => {
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

      setRecipients([...recipients, newRecipient]);
      setInputValue('');
      setHasChanges(true); // Set hasChanges when a recipient is added
    };

    const handleRemove = (recipientToRemove: string) => {
      setRecipients(recipients.filter(r => r !== recipientToRemove));
      setHasChanges(true); // Set hasChanges when a recipient is removed
    };

    return (
      <div className="space-y-2">
        <Label>{isEmail ? 'المستلمون (البريد الإلكتروني)' : 'المستلمون (أرقام الهواتف)'}</Label>
        <div className="flex gap-2">
          <Input
            type={isEmail ? 'email' : 'tel'}
            placeholder={isEmail ? 'email@example.com' : '0123456789'}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              // Don't set hasChanges here - only when actually adding/removing recipients
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAdd(inputValue);
              }
            }}
          />
          <Button type="button" onClick={() => {
            handleAdd(inputValue);
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
                    onClick={() => handleRemove(recipient)}
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
      emails: newThresholdAlarmForm.emails.join(','),
      phones: newThresholdAlarmForm.phones.join(','),
      method: AlarmMethod.Email, // Changed from 0 to AlarmMethod.Email
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
      emails: newCommunicationAlarmForm.emails.join(','),
      phones: newCommunicationAlarmForm.phones.join(','),
      method: AlarmMethod.Email, // Changed from 0 to AlarmMethod.Email
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
            <AlertTriangle className="ml-2 h-4 w-4" />
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
                            {sitesLoading ? (
                              <SelectItem value="0">جاري التحميل...</SelectItem>
                            ) : sitesError ? (
                              <SelectItem value="0" disabled>{sitesError}</SelectItem>
                            ) : (
                              sites.map(site => (
                                <SelectItem key={site.id} value={site.id.toString()}>{site.name}</SelectItem>
                              ))
                            )}
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
                            {availableFields.map(field => (
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
                        recipients={newThresholdAlarmForm.emails}
                        setRecipients={setThresholdEmails}
                        setHasChanges={() => { }} // No need to track changes for add dialog
                      />

                      <RecipientInput
                        type="phone"
                        forAlarmType="threshold"
                        recipients={newThresholdAlarmForm.phones}
                        setRecipients={setThresholdPhones}
                        setHasChanges={() => { }} // No need to track changes for add dialog
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
                                  populateThresholdAlarmFormForEdit(alarm);
                                  // Set currentThresholdAlarm after populating the form
                                  setCurrentThresholdAlarm({
                                    id: alarm.id,
                                    siteId: alarm.siteId,
                                    alarmName: alarm.alarmName,
                                    site: alarm.site,
                                    field: alarm.field,
                                    operator: alarm.operator,
                                    threshold: alarm.threshold,
                                    color: alarm.color,
                                    severity: alarm.severity,
                                    emails: [],
                                    phones: [],
                                  });
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
                                      onValueChange={(value) => {
                                        setNewThresholdAlarmForm(prev => ({
                                          ...prev,
                                          siteId: parseInt(value)
                                        }));
                                        setHasThresholdChanges(true);
                                      }}
                                      value={newThresholdAlarmForm.siteId?.toString() || ""}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="اختر الموقع" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {sitesLoading ? (
                                          <SelectItem value="0">جاري التحميل...</SelectItem>
                                        ) : sitesError ? (
                                          <SelectItem value="0" disabled>{sitesError}</SelectItem>
                                        ) : (
                                          sites.map(site => (
                                            <SelectItem key={site.id} value={site.id.toString()}>{site.name}</SelectItem>
                                          ))
                                        )}
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
                                    onChange={(e) => {
                                      setNewThresholdAlarmForm(prev => ({
                                        ...prev,
                                        alarmName: e.target.value
                                      }));
                                      setHasThresholdChanges(true);
                                    }}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>الحقل</Label>
                                  <Select
                                    onValueChange={(value) => {
                                      setNewThresholdAlarmForm(prev => ({
                                        ...prev,
                                        field: value
                                      }));
                                      setHasThresholdChanges(true);
                                    }}
                                    value={newThresholdAlarmForm.field}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر الحقل" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableFields.map(field => (
                                        <SelectItem key={field} value={field}>{field}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>المعامل</Label>
                                    <Select
                                      onValueChange={(value) => {
                                        setNewThresholdAlarmForm(prev => ({
                                          ...prev,
                                          operator: value
                                        }));
                                        setHasThresholdChanges(true);
                                      }}
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
                                      onChange={(e) => {
                                        setNewThresholdAlarmForm(prev => ({
                                          ...prev,
                                          threshold: parseFloat(e.target.value) || 0
                                        }));
                                        setHasThresholdChanges(true);
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label>مستوى الخطورة</Label>
                                  <Select
                                    onValueChange={(value: 'Warning' | 'Critical') => {
                                      setNewThresholdAlarmForm(prev => ({
                                        ...prev,
                                        severity: value
                                      }));
                                      setHasThresholdChanges(true);
                                    }}
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
                                      onChange={(e) => {
                                        setNewThresholdAlarmForm(prev => ({
                                          ...prev,
                                          color: e.target.value
                                        }));
                                        setHasThresholdChanges(true);
                                      }}
                                    />
                                    <Input
                                      type="text"
                                      className="flex-1"
                                      value={newThresholdAlarmForm.color}
                                      onChange={(e) => {
                                        setNewThresholdAlarmForm(prev => ({
                                          ...prev,
                                          color: e.target.value
                                        }));
                                        setHasThresholdChanges(true);
                                      }}
                                    />
                                  </div>
                                </div>

                                <RecipientInput
                                  type="email"
                                  forAlarmType="threshold"
                                  recipients={newThresholdAlarmForm.emails}
                                  setRecipients={setThresholdEmails}
                                  setHasChanges={setHasThresholdChanges}
                                />

                                <RecipientInput
                                  type="phone"
                                  forAlarmType="threshold"
                                  recipients={newThresholdAlarmForm.phones}
                                  setRecipients={setThresholdPhones}
                                  setHasChanges={setHasThresholdChanges}
                                />
                              </div>

                              <DialogFooter>
                                <div className="w-full flex justify-start gap-2">
                                  <Button variant="outline" onClick={() => setIsEditThresholdOpen(false)}>
                                    إلغاء
                                  </Button>
                                  <Button
                                    onClick={handleEditThresholdAlarm}
                                    disabled={isSubmittingThresholdEdit || !hasThresholdChanges || !newThresholdAlarmForm.siteId || !newThresholdAlarmForm.alarmName || !newThresholdAlarmForm.field || !newThresholdAlarmForm.operator}
                                    loadingText="جاري الحفظ..."
                                    isLoading={isSubmittingThresholdEdit}
                                  >
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
                    <Button onClick={() => setNewCommunicationAlarmForm(INITIAL_COMMUNICATION_FORM)}> {/* Reset form on add click */}
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
                            {sitesLoading ? (
                              <SelectItem value="0">جاري التحميل...</SelectItem>
                            ) : sitesError ? (
                              <SelectItem value="0" disabled>{sitesError}</SelectItem>
                            ) : (
                              sites.map(site => (
                                <SelectItem key={site.id} value={site.id.toString()}>{site.name}</SelectItem>
                              ))
                            )}
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
                        recipients={newCommunicationAlarmForm.emails}
                        setRecipients={setCommunicationEmails}
                        setHasChanges={() => { }} // No need to track changes for add dialog
                      />

                      <RecipientInput
                        type="phone"
                        forAlarmType="communication"
                        recipients={newCommunicationAlarmForm.phones}
                        setRecipients={setCommunicationPhones}
                        setHasChanges={() => { }} // No need to track changes for add dialog
                      />
                    </div>

                    <DialogFooter>
                      <div className="w-full flex justify-start gap-2">
                        <Button variant="outline" onClick={() => setIsAddCommOpen(false)}>
                          إلغاء
                        </Button>
                        <Button onClick={handleSubmitCommunicationAlarm} disabled={isSubmittingCommAdd || !newCommunicationAlarmForm.siteId || !newCommunicationAlarmForm.alarmName || !newCommunicationAlarmForm.hours} loadingText="جاري الإضافة..." isLoading={isSubmittingCommAdd}>
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
                      <TableRow key={alarm.alarmId}>
                        <TableCell className="text-right">
                          <Dialog open={isEditCommOpen && currentCommunicationAlarm?.id === alarm.alarmId} onOpenChange={setIsEditCommOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Transform CommunicationAlarm to CommunicationAlarmForm for setCurrentCommunicationAlarm
                                  const emails = alarm.emails ? alarm.emails.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
                                  const phones = alarm.phones ? alarm.phones.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
                                  setCurrentCommunicationAlarm({
                                    id: alarm.alarmId,
                                    siteId: alarm.siteId,
                                    alarmName: alarm.alarmName,
                                    site: alarm.siteName || '',
                                    severity: alarm.severity === Severity.Warning ? 'Warning' : 'Critical',
                                    hours: alarm.numHours || 0,
                                    emails: emails,
                                    phones: phones,
                                  });
                                  populateCommunicationAlarmFormForEdit(alarm);
                                  setIsEditCommOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
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
                                        {sitesLoading ? (
                                          <SelectItem value="0">جاري التحميل...</SelectItem>
                                        ) : sitesError ? (
                                          <SelectItem value="0" disabled>{sitesError}</SelectItem>
                                        ) : (
                                          sites.map(site => (
                                            <SelectItem key={site.id} value={site.id.toString()}>{site.name}</SelectItem>
                                          ))
                                        )}
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
                                    onChange={(e) => {
                                      setNewCommunicationAlarmForm(prev => ({
                                        ...prev,
                                        alarmName: e.target.value
                                      }));
                                      setHasCommunicationChanges(true);
                                    }}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>عدد الساعات</Label>
                                  <Input
                                    type="number"
                                    placeholder="2"
                                    value={newCommunicationAlarmForm.hours}
                                    onChange={(e) => {
                                      setNewCommunicationAlarmForm(prev => ({
                                        ...prev,
                                        hours: parseInt(e.target.value) || 0
                                      }));
                                      setHasCommunicationChanges(true);
                                    }}
                                  />
                                  <p className="text-xs text-gray-500">
                                    سيتم إرسال تنبيه إذا لم تصل بيانات لهذا العدد من الساعات
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <Label>مستوى الخطورة</Label>
                                  <Select
                                    onValueChange={(value: 'Warning' | 'Critical') => {
                                      setNewCommunicationAlarmForm(prev => ({
                                        ...prev,
                                        severity: value
                                      }));
                                      setHasCommunicationChanges(true);
                                    }}
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
                                  recipients={newCommunicationAlarmForm.emails}
                                  setRecipients={setCommunicationEmails}
                                  setHasChanges={setHasCommunicationChanges}
                                />

                                <RecipientInput
                                  type="phone"
                                  forAlarmType="communication"
                                  recipients={newCommunicationAlarmForm.phones}
                                  setRecipients={setCommunicationPhones}
                                  setHasChanges={setHasCommunicationChanges}
                                />
                              </div>

                              <DialogFooter>
                                <div className="w-full flex justify-start gap-2">
                                  <Button variant="outline" onClick={() => setIsEditCommOpen(false)}>
                                    إلغاء
                                  </Button>
                                  <Button onClick={handleEditCommunicationAlarm} disabled={isSubmittingCommEdit || !hasCommunicationChanges || !newCommunicationAlarmForm.siteId || !newCommunicationAlarmForm.alarmName || !newCommunicationAlarmForm.hours} loadingText="جاري الحفظ..." isLoading={isSubmittingCommEdit}>
                                    حفظ التغييرات
                                  </Button>
                                </div>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
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
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>    </div>
  );
}
