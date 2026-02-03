import { ThresholdAlarmForm, CommunicationAlarmForm, SensorStatusForm, PumpStatusPSAlarmForm, PumpStatusIdvAlarmForm } from '../types';

export const FIELD_MAP: { [key: string]: number } = {
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

export const OPERATOR_MAP: { [key: string]: number } = {
    '<': 0,
    '<=': 1,
    '>': 2,
    '>=': 3,
    '==': 4,
    '!=': 5,
};

export const FIELDS = [
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

export const OPERATORS = ['>', '<', '>=', '<=', '==', '!='];

export const getOperatorLabels = (t: (key: string) => string): Record<string, string> => {
    return {
        '>': t('alarms.operators.greaterThan'),
        '<': t('alarms.operators.lessThan'),
        '>=': t('alarms.operators.greaterThanOrEqual'),
        '<=': t('alarms.operators.lessThanOrEqual'),
        '==': t('alarms.operators.equal'),
        '!=': t('alarms.operators.notEqual')
    };
};

// Assuming ThresholdAlarmForm and CommunicationAlarmForm are defined elsewhere (e.g., in types/index.ts)
// These initial forms will be typed using those interfaces.

export const INITIAL_THRESHOLD_FORM: ThresholdAlarmForm = {
    id: 0,
    siteId: 0,
    alarmName: '',
    site: '',
    field: '',
    criticalOperator: '',
    criticalThresholdValue: 0,
    criticalColorCode: '#fbbf24',
    crisisOperator: '',
    crisisThresholdValue: 0,
    crisisColorCode: '#db0202ff',
    severity: 'Warning',
    emails: [],
    phones: [],
};

export const INITIAL_COMMUNICATION_FORM: CommunicationAlarmForm = {
    id: 0,
    siteId: 0,
    alarmName: '',
    site: '',
    // severity: 'Warning',
    hours: 0,
    emails: [],
    phones: [],
};

export const INITIAL_SENSOR_STATUS_FORM: SensorStatusForm = {
    alarmId: null,
    alarmName: '',
    method: 0,
    siteId: null,
    site: '',
    message: '',
    threshold: 0,
    field: '',
    readingValue: 0,
    emails: [],
    phones: [],
};


export const INITIAL_PumpStatusPS_FORM: PumpStatusPSAlarmForm = {
    id: 0,
    siteId: null,
    alarmName: '',
    site: '',
    emails: [],
    phones: [],
    monitoringHours: 0,
};

export const INITIAL_PumpStatusIdv_FORM: PumpStatusIdvAlarmForm = {
    alarmName: '',
    siteId: null,
    site: '',
    emails: [],
    phones: [],
    pumpNumber: 1,
    monitoringHours: 24,
};