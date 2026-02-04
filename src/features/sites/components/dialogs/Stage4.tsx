import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import apiService from '../../../../shared/utils/apiService';
import type { Site } from '../../types';

interface Equation {
  id: number;
  name: string;
  displayFormula: string;
  createdAt?: string;
  isDeleted?: boolean;
}

// Helper function to extract constants from formula (e.g., c1, c2, c3) and map to a, b, c
const extractConstants = (formula: string): string[] => {
  const matches = formula.match(/c\d+/g);
  if (!matches) return [];
  
  const sorted = [...new Set(matches)].sort((a, b) => {
    const numA = parseInt(a.substring(1));
    const numB = parseInt(b.substring(1));
    return numA - numB;
  });
  
  // Map c1->a, c2->b, c3->c, etc.
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  return sorted.map((_, index) => alphabet[index] || `var${index}`);
};

interface Stage4Props {
  data: Partial<Site>;
  onChange: (field: string, value: any) => void;
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  onValidationChange?: (isValid: boolean) => void;
  userRole?: 'Admin' | 'Operator';
}

export default function Stage4({ data, onChange, isOpen, onClose, mode = "create", onValidationChange, userRole }: Stage4Props) {
  const { t } = useTranslation();
  const dir = t('_rtl') === 'rtl' ? 'rtl' : 'ltr';
  const [equations, setEquations] = useState<Equation[]>([]);
  const [loadingEquations, setLoadingEquations] = useState(true);
  const [loadingFlowCalc, setLoadingFlowCalc] = useState(false);
  const [selectedEquationId, setSelectedEquationId] = useState<number | null>(null);
  const [constants, setConstants] = useState<{ [key: string]: string }>({});
  const [selectedEquation, setSelectedEquation] = useState<Equation | null>(null);
  const [hasLoadedFlowCalc, setHasLoadedFlowCalc] = useState(false);

  // Calculate validation state
  const { isValid } = useMemo(() => {
    // Stage 4 is valid if:
    // 1. An equation is selected
    // 2. All variable fields are filled
    const hasEquationSelected = selectedEquationId !== null && selectedEquationId !== undefined;
    const allFieldsFilled = hasEquationSelected && 
      Object.values(constants).every(val => val !== null && val !== undefined && val.toString().trim() !== '');
    
    return { isValid: hasEquationSelected && allFieldsFilled };
  }, [selectedEquationId, constants]);

  // Call the validation change callback whenever validation state changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  // Fetch equations from API
  useEffect(() => {
    const fetchEquations = async () => {
      try {
        setLoadingEquations(true);
        const response = await apiService.get<any>('/v1/Equations');
        // apiService.get already returns response.data, so use it directly
        const equationsData = Array.isArray(response) ? response : response?.data || [];
        setEquations(equationsData);
      } catch (error) {
        console.error('Failed to fetch equations:', error);
        // Fallback to empty array if API fails
        setEquations([]);
      } finally {
        setLoadingEquations(false);
      }
    };

    fetchEquations();
  }, []);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setHasLoadedFlowCalc(false);
      setSelectedEquationId(null);
      setConstants({});
      setSelectedEquation(null);
    }
  }, [isOpen]);

  // Fetch flow calculation when editing
  useEffect(() => {
    // Only fetch if we have equations loaded and haven't already loaded flow calc
    if (mode === 'edit' && data.id && isOpen && !hasLoadedFlowCalc && !loadingEquations && equations.length > 0) {
      const fetchFlowCalculation = async () => {
        try {
          setLoadingFlowCalc(true);
          const response = await apiService.get<any>(`/v1/FlowCalculation/${data.id}`);
          // apiService.get already returns response.data, so handle accordingly
          const flowCalcData = response?.data || response;
          
          console.log('Fetched flow calculation:', flowCalcData);
          
          if (flowCalcData) {
            // Try to match by equationId first (most reliable)
            if (flowCalcData.equationId !== null && flowCalcData.equationId !== undefined) {
              const equation = equations.find(eq => eq.id === flowCalcData.equationId);
              if (equation) {
                console.log('Found equation by ID:', equation);
                setSelectedEquationId(flowCalcData.equationId);
                
                let constantsObj: { [key: string]: string } = {};
                
                // Parse constants
                if (flowCalcData.formulaConstants) {
                  try {
                    const parsed = typeof flowCalcData.formulaConstants === 'string' 
                      ? JSON.parse(flowCalcData.formulaConstants)
                      : flowCalcData.formulaConstants;
                    constantsObj = parsed;
                    setConstants(parsed);
                  } catch (e) {
                    console.error('Error parsing formula constants:', e);
                    setConstants({});
                  }
                }
                
                onChange('flowCalculation', {
                  equationId: flowCalcData.equationId,
                  formulaConstants: JSON.stringify(constantsObj)
                });
              }
            } 
            // Fallback: try to find equation by formula string
            else if (flowCalcData.equation) {
              const matchingEquation = equations.find(eq => eq.displayFormula === flowCalcData.equation);
              
              if (matchingEquation) {
                console.log('Found equation by formula:', matchingEquation);
                setSelectedEquationId(matchingEquation.id);
                
                let constantsObj: { [key: string]: string } = {};
                
                if (flowCalcData.formulaConstants) {
                  try {
                    const parsed = typeof flowCalcData.formulaConstants === 'string' 
                      ? JSON.parse(flowCalcData.formulaConstants)
                      : flowCalcData.formulaConstants;
                    constantsObj = parsed;
                    setConstants(parsed);
                  } catch (e) {
                    console.error('Error parsing formula constants:', e);
                    setConstants({});
                  }
                }
                
                onChange('flowCalculation', {
                  equationId: matchingEquation.id,
                  formulaConstants: JSON.stringify(constantsObj)
                });
              }
            }
          }
          
          setHasLoadedFlowCalc(true);
        } catch (error: any) {
          console.error('Error fetching flow calculation:', error);
          setHasLoadedFlowCalc(true);
        } finally {
          setLoadingFlowCalc(false);
        }
      };
      
      fetchFlowCalculation();
    }
  }, [mode, data.id, isOpen, onChange, hasLoadedFlowCalc, equations, loadingEquations]);

  // Handle equation selection and extract constants
  useEffect(() => {
    if (selectedEquationId && equations.length > 0) {
      const equation = equations.find(eq => eq.id === selectedEquationId);
      setSelectedEquation(equation || null);
      
      if (equation && !hasLoadedFlowCalc) {
        // Only initialize empty constants if this is NOT from loaded flow calculation
        const extractedConstants = extractConstants(equation.displayFormula);
        const parsedConstants = extractedConstants.reduce((acc, c) => ({ ...acc, [c]: '' }), {});
        setConstants(parsedConstants);
      } else if (equation && hasLoadedFlowCalc) {
        // If we loaded flow calc, ensure all constants from the equation are present
        // but preserve any loaded values
        const extractedConstants = extractConstants(equation.displayFormula);
        const mergedConstants = { ...constants };
        extractedConstants.forEach(c => {
          if (!(c in mergedConstants)) {
            mergedConstants[c] = '';
          }
        });
        setConstants(mergedConstants);
      }
    } else if (!selectedEquationId) {
      setSelectedEquation(null);
      if (!hasLoadedFlowCalc) {
        setConstants({});
      }
    }
  }, [selectedEquationId, equations, hasLoadedFlowCalc]);

  const handleEquationChange = (equationId: string) => {
    const id = parseInt(equationId);
    const equation = equations.find(eq => eq.id === id);
    setSelectedEquationId(id);
    setHasLoadedFlowCalc(false); // Clear the flag when manually changing equation
    
    // Update parent form with equation ID and empty formula constants
    if (equation) {
      const constants = extractConstants(equation.displayFormula);
      onChange('flowCalculation', {
        equationId: id,
        formulaConstants: JSON.stringify(constants.reduce((acc: { [key: string]: string }, c: string) => ({ ...acc, [c]: '' }), {}))
      });
    }
  };

  const handleConstantChange = (constantName: string, value: string) => {
    const updated = { ...constants, [constantName]: value };
    setConstants(updated);
    
    // Update parent form with updated formula constants
    if (selectedEquationId) {
      onChange('flowCalculation', {
        equationId: selectedEquationId,
        formulaConstants: JSON.stringify(updated)
      });
    }
  };

  const buildEquationDisplay = (): string => {
    if (!selectedEquation) return '';
    
    let displayFormula = selectedEquation.displayFormula;
    const constantsList = extractConstants(displayFormula);
    
    // Map c1->a, c2->b, c3->c for substitution
    const cMatches = displayFormula.match(/c\d+/g) || [];
    const sortedMatches = [...new Set(cMatches)].sort((a, b) => {
      const numA = parseInt(a.substring(1));
      const numB = parseInt(b.substring(1));
      return numA - numB;
    });
    
    constantsList.forEach((constant, index) => {
      const originalConstant = sortedMatches[index];
      if (originalConstant) {
        const value = constants[constant] || '';
        displayFormula = displayFormula.replaceAll(originalConstant, value);
      }
    });
    
    return displayFormula;
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  };

  const fieldContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  };

  const gridContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '1rem'
  };

  const equationDisplayStyle: React.CSSProperties = {
    padding: '1rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #86efac',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontFamily: 'monospace',
    color: '#166534',
    wordBreak: 'break-word',
    direction: 'ltr',
    textAlign: 'center',
    unicodeBidi: 'embed'
  };

  return (
    <div style={containerStyle}>
      <div style={fieldContainerStyle}>
        <Label>{t('sites.stage4.selectEquation')}</Label>
        <Select 
          value={selectedEquationId?.toString() || ''} 
          onValueChange={handleEquationChange} 
          dir={dir} 
          disabled={loadingEquations || loadingFlowCalc}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingEquations || loadingFlowCalc ? t('common.loading') : t('sites.stage4.selectEquationPlaceholder')} />
          </SelectTrigger>
          <SelectContent dir={dir}>
            {equations.map(equation => (
              <SelectItem key={equation.id} value={equation.id.toString()}>
                {equation.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedEquation && (
        <>
          <div style={fieldContainerStyle}>
            <Label>{t('sites.stage4.equationFormula')}</Label>
            <div style={{
              padding: '0.75rem',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              color: '#1f2937'
            }}>
              {selectedEquation.displayFormula}
            </div>
          </div>

          <div style={fieldContainerStyle}>
            <Label>{t('sites.stage4.fillConstants')}</Label>
            <div style={gridContainerStyle}>
              {extractConstants(selectedEquation.displayFormula).map(constant => (
                <div key={constant} style={fieldContainerStyle}>
                  <Label>{constant}</Label>
                  <Input
                    type="number"
                    step="any"
                    placeholder={`${t('sites.stage4.enterValueFor')} ${constant}`}
                    value={constants[constant] || ''}
                    onChange={(e) => handleConstantChange(constant, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={fieldContainerStyle}>
            <Label>{t('sites.stage4.equationPreview')}</Label>
            <div style={equationDisplayStyle}>
              {buildEquationDisplay() || selectedEquation.displayFormula}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
