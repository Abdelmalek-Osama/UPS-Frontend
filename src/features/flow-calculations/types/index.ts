export interface FormulaParams {
  c: number;
  w: number;
  n: number;
}

export interface HQCurvePoint {
  head: number;
  flow: number;
}

export interface FlowSite {
  id: string;
  name: string;
  method: 'Formula' | 'HQCurve';
}
