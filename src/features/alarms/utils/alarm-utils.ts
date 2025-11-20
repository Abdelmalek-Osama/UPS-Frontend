export const FIELD_MAP: { [key: string]: number } = {
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

export const OPERATOR_MAP: { [key: string]: number } = {
  '>': 0,
  '<': 1,
  '>=': 2,
  '<=': 3,
  '==': 4,
  '!=': 5,
};

export const mapNumberToOperator: { [key: number]: string } = {
  0: '>',
  1: '<',
  2: '>=',
  3: '<=',
  4: '==',
  5: '!=',
};

export const mapFieldToNumber = (field: string): number => {
  const mappedValue = FIELD_MAP[field];
  if (mappedValue === undefined) {
    throw new Error(`Unknown field: ${field}`);
  }
  return mappedValue;
};

export const mapOperatorToNumber = (operator: string): number => {
  const mappedValue = OPERATOR_MAP[operator];
  if (mappedValue === undefined) {
    throw new Error(`Unknown operator: ${operator}`);
  }
  return mappedValue;
};

export const mapSeverityToNumber = (severity: 'Warning' | 'Critical'): number => 
    severity === 'Warning' ? 0 : 1;

export const mapNumberToField: { [key: number]: string } = {
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

export const FIELDS = [
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
export const OPERATORS = ['>', '<', '>=', '<=', '==', '!='];
