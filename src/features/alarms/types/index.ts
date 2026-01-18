export interface AddCommunicationAlarmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: CommunicationAlarmForm;
  setForm: React.Dispatch<React.SetStateAction<CommunicationAlarmForm>>;
  sites: Site[];
  sitesLoading: boolean;
  sitesError: string | null;
  onSubmit: () => void;
  isSubmitting: boolean;
  setEmails: (emails: string[]) => void;
  setPhones: (phones: string[]) => void;
  submissionError: string | null;
}

export interface AddSensorStatusAlarmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: SensorStatusForm;
  setForm: React.Dispatch<React.SetStateAction<SensorStatusForm>>;
  onSubmit: () => void;
  isSubmitting: boolean;
  alarmId: number | null;
  setSiteId: (siteId: number | null) => void;
  setSite: (site: string) => void;
  setEmails: (emails: string[]) => void;
  setPhones: (phones: string[]) => void;
  setSentMessage : (sentMessage: string) => void;
  submissionError: string | null;
}
export interface AddPumpStatusPSAlarmDialogProps {
  onOpenChange: (open: boolean) => void;
  form: PumpStatusPSAlarmForm;
  setForm: React.Dispatch<React.SetStateAction<PumpStatusPSAlarmForm>>;
  onSubmit: () => void;
  isSubmitting: boolean;
  setSiteId: (siteId: number | null) => void;
  setSite: (site: string) => void;
  setEmails: (emails: string[]) => void;
  setPhones: (phones: string[]) => void;
  setSentMessage : (sentMessage: string) => void;
  submissionError: string | null;
}

export interface AddPumpStatusIdvAlarmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: PumpStatusIdvAlarmForm;
  setForm: React.Dispatch<React.SetStateAction<PumpStatusIdvAlarmForm>>;
  onSubmit: () => void;
  isSubmitting: boolean;
  setSite: (site: string) => void;
  setEmails: (emails: string[]) => void;
  setPhones: (phones: string[]) => void;
  setIdvPump: (IdvPump: string) => void;
  submissionError: string | null;
}

export interface Site {
  id: number;
  name: string;
}

export interface SiteConfiguration {
  hasUS: boolean;
  hasDS1: boolean;
  hasDS2: boolean;
  numPumps: number;
}

export interface ThresholdAlarmForm {
  id: number;
  siteId: number | null;
  alarmName: string;
  site: string;
  field: string;
  criticalOperator: string;
  criticalThresholdValue: number;
  criticalColorCode: string;
  criticalThresholdError?: string;
  criticalColorError?: string;
  crisisOperator: string;
  crisisThresholdValue: number;
  crisisColorCode: string;
  crisisThresholdError?: string;
  crisisColorError?: string;
  severity: 'Warning' | 'Critical';
  emails: string[];
  phones: string[];
}

export interface CommunicationAlarmForm {
  id: number;
  siteId: number | null;
  alarmName: string;
  site: string;
  //severity: 'Warning' | 'Critical';
  hours: number;
  hoursError?: string; // Add this line
  emails: string[];
  phones: string[];
}

export interface SensorStatusForm {
  alarmId: number | null;
  method: number;
  siteId: number | null;
  site: string;
  sentMessage: string,
  emails: string[];
  phones: string[];
}

export interface PumpStatusPSAlarmForm {
  id: number;
  siteId: number | null;
  alarmName: string;
  site: string;
  emails: string[];
  phones: string[];
  monitoringHours: number;
}

export interface PumpStatusIdvAlarmForm {
  siteId: number | null;
  site: string;
  emails: string[];
  phones: string[];
  IdvPump: string;
  duration: number;
}

export interface SiteDetails {
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

export enum AlarmMethod {
  Email = 0,
  SMS = 1,
}

export enum Severity {
  Critical = 0,
  Crisis = 1,
}

export interface CreateThresholdAlarmRequest {
  id: number;
  siteId: number;
  alarmName: string;
  emails: string;
  phones: string;
  method: AlarmMethod;
  valueThreshold: {
    fieldName: number;
    criticalOperator: number;
    criticalThresholdValue: number;
    criticalColorCode: string;
    crisisOperator: number;
    crisisThresholdValue: number;
    crisisColorCode: string;
  };
}

export interface CreateCommunicationAlarmRequest {
  id: number;
  siteId: number;
  alarmName: string;
  emails: string;
  phones: string;
  method: AlarmMethod;
  communicationLoss: {
    //severity: number;
    numHours: number;
  };
}

export interface CreateSensorStatusAlarmRequest {
  alarmId: number | null;
  siteId: number|null;
  site: string;
  method: AlarmMethod;
  sentMessage: string;
  emails: string;
  phones: string;

}

export interface CreatePumpStatusPSAlarmRequest {
  id: number;
  siteId: number;
  alarmName: string;
  emails: string;
  phones: string;
  method: number;
  pumpStatusOperation: {
    monitoringHours: number;
  };
}

export interface CreatePumpStatusIdvAlarmRequest {
  method: AlarmMethod;
  siteId: number|null;
  site: string;
  emails: string;
  phones: string;
  IdvPump: string;
  duration: number;
}

export interface EditCommunicationAlarmDialogProps extends AddCommunicationAlarmDialogProps {
  currentAlarm: CommunicationAlarmForm | null;
  hasChanges: boolean;
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface CommunicationAlarmResponse {
  alarmId: number;
  siteId: number;
  alarmName: string;
  siteName: string;
  severity: Severity;
  numHours: number;
  emails: string;
  phones: string;
}

export interface ValueThresholdAlarm {
  id: number;
  siteId: number;
  alarmName: string;
  site: string;
  field: number;
  criticalOperator?: number;
  criticalThresholdValue?: number;
  criticalColorCode?: string;
  crisisOperator?: number;
  crisisThresholdValue?: number;
  crisisColorCode?: string;
  // Legacy fields for backward compatibility
  operator?: number;
  threshold?: number;
  color?: string;
  severity: string;
  recipients: string[];
}

export interface SensorStatusResponse {
  alarmId: number;
  siteId: number;
  sentMessage: string;
  site: string;
  recipients: string[]; // Assuming recipients can be an array of strings

}

export interface PumpStatusPSResponse {
  alarmId: number;
  siteId: number;
  siteName: string;
  alarmName: string;
  alarmType: number;
  emails: string;
  phones: string;
  method: number;
  pumpStatusOperationId: number;
  monitoringHours: number;
}

export interface PumpStatusIdvResponse {
  alarmId: number;
  siteId: number;
  site: string;
  idvPump: string;
  duration: number;
  recipients: string[];
}