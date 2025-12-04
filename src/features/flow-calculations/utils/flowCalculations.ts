import type { FormulaParams } from '../types';

// Calculate flow using formula: Q = C × W × H^n
export function calculateFlow(uswl: number, dswl: number, params: FormulaParams): number {
  const h = uswl - dswl;
  return params.c * params.w * Math.pow(h, params.n);
}

// Linear interpolation for HQ curve
export function interpolateFlow(head: number, curve: Array<{ head: number; flow: number }>): number {
  if (curve.length === 0) return 0;
  
  // Find surrounding points
  let lowerPoint = curve[0];
  let upperPoint = curve[curve.length - 1];
  
  for (let i = 0; i < curve.length - 1; i++) {
    if (head >= curve[i].head && head <= curve[i + 1].head) {
      lowerPoint = curve[i];
      upperPoint = curve[i + 1];
      break;
    }
  }
  
  // Linear interpolation
  const ratio = (head - lowerPoint.head) / (upperPoint.head - lowerPoint.head);
  return lowerPoint.flow + ratio * (upperPoint.flow - lowerPoint.flow);
}
