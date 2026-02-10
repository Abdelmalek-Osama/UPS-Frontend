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
  equations?: any[];
  loadingEquations?: boolean;
}

export default function Stage4({ data, onChange, isOpen, onClose, mode = "create", onValidationChange, userRole, equations = [], loadingEquations = false }: Stage4Props) {
  const { t } = useTranslation();
  const dir = t('_rtl') === 'rtl' ? 'rtl' : 'ltr';
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
                let commaSeparatedValues = '';
                
                // Parse constants - handle array, comma-separated string, or JSON object
                if (flowCalcData.formulaConstants) {
                  try {
                    let values: string[] = [];
                    
                    if (Array.isArray(flowCalcData.formulaConstants)) {
                      // It's an array of numbers [1, 2, 9]
                      values = flowCalcData.formulaConstants.map((v: any) => String(v));
                      commaSeparatedValues = values.join(',');
                    } else if (typeof flowCalcData.formulaConstants === 'string' && 
                        !flowCalcData.formulaConstants.startsWith('{')) {
                      // It's a comma-separated string
                      values = flowCalcData.formulaConstants.split(',');
                      commaSeparatedValues = flowCalcData.formulaConstants;
                    } else {
                      // It's a JSON object
                      const parsed = typeof flowCalcData.formulaConstants === 'string' 
                        ? JSON.parse(flowCalcData.formulaConstants)
                        : flowCalcData.formulaConstants;
                      
                      // Convert object to comma-separated array
                      const extractedConstants = extractConstants(equation.displayFormula);
                      values = extractedConstants.map(c => String(parsed[c] || ''));
                      commaSeparatedValues = values.join(',');
                      constantsObj = parsed;
                    }
                    
                    // If we have values from array or string, convert to object for display
                    if (!constantsObj || Object.keys(constantsObj).length === 0) {
                      const extractedConstants = extractConstants(equation.displayFormula);
                      constantsObj = extractedConstants.reduce((acc, c, idx) => ({
                        ...acc,
                        [c]: values[idx] || ''
                      }), {});
                    }
                    
                    setConstants(constantsObj);
                  } catch (e) {
                    console.error('Error parsing formula constants:', e);
                    setConstants({});
                    commaSeparatedValues = '';
                  }
                }
                
                onChange('flowCalculation', {
                  equationId: flowCalcData.equationId,
                  formulaConstants: commaSeparatedValues
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
                let commaSeparatedValues = '';
                
                if (flowCalcData.formulaConstants) {
                  try {
                    let values: string[] = [];
                    
                    if (Array.isArray(flowCalcData.formulaConstants)) {
                      // It's an array of numbers [1, 2, 9]
                      values = flowCalcData.formulaConstants.map((v: any) => String(v));
                      commaSeparatedValues = values.join(',');
                    } else if (typeof flowCalcData.formulaConstants === 'string' && 
                        !flowCalcData.formulaConstants.startsWith('{')) {
                      // It's a comma-separated string
                      values = flowCalcData.formulaConstants.split(',');
                      commaSeparatedValues = flowCalcData.formulaConstants;
                    } else {
                      // It's a JSON object
                      const parsed = typeof flowCalcData.formulaConstants === 'string' 
                        ? JSON.parse(flowCalcData.formulaConstants)
                        : flowCalcData.formulaConstants;
                      
                      // Convert object to comma-separated array
                      const extractedConstants = extractConstants(matchingEquation.displayFormula);
                      values = extractedConstants.map(c => String(parsed[c] || ''));
                      commaSeparatedValues = values.join(',');
                      constantsObj = parsed;
                    }
                    
                    // If we have values from array or string, convert to object for display
                    if (!constantsObj || Object.keys(constantsObj).length === 0) {
                      const extractedConstants = extractConstants(matchingEquation.displayFormula);
                      constantsObj = extractedConstants.reduce((acc, c, idx) => ({
                        ...acc,
                        [c]: values[idx] || ''
                      }), {});
                    }
                    
                    setConstants(constantsObj);
                  } catch (e) {
                    console.error('Error parsing formula constants:', e);
                    setConstants({});
                    commaSeparatedValues = '';
                  }
                }
                
                onChange('flowCalculation', {
                  equationId: matchingEquation.id,
                  formulaConstants: commaSeparatedValues
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

  // Initialize from formData.flowCalculation when in create mode or returning to tab
  useEffect(() => {
    // Only restore if the dialog is open, equations are loaded, and we have flow calculation data
    // Check if we need to restore by seeing if our current state doesn't match formData
    if (isOpen && !loadingEquations && equations.length > 0 && data.flowCalculation) {
      const flowCalc = data.flowCalculation;
      
      if (flowCalc.equationId) {
        const equation = equations.find(eq => eq.id === flowCalc.equationId);
        if (equation) {
          // Check if we need to restore by comparing constants
          const needsConstantRestore = flowCalc.formulaConstants && 
            (Object.keys(constants).length === 0 || 
             Object.values(constants).some(v => v === ''));
          
          // Check if equation ID needs to be restored
          const needsEquationRestore = flowCalc.equationId !== selectedEquationId;
          
          if (needsEquationRestore || needsConstantRestore) {
            console.log('Restoring flow calculation from formData:', flowCalc);
            console.log('Needs equation restore:', needsEquationRestore, 'Needs constant restore:', needsConstantRestore);
            
            // Set flag FIRST to prevent the equation selection effect from overwriting constants
            setHasLoadedFlowCalc(true);
            
            // Parse the saved constants
            if (flowCalc.formulaConstants) {
              try {
                let constantsObj: { [key: string]: string } = {};
                const formulaConstants = flowCalc.formulaConstants;
                
                // Handle comma-separated string
                if (typeof formulaConstants === 'string') {
                  const values = formulaConstants.split(',');
                  const extractedConstants = extractConstants(equation.displayFormula);
                  constantsObj = extractedConstants.reduce((acc, c, idx) => ({
                    ...acc,
                    [c]: values[idx] || ''
                  }), {});
                }
                
                console.log('Restored constants:', constantsObj);
                setConstants(constantsObj);
              } catch (e) {
                console.error('Error restoring constants:', e);
              }
            }
            
            // Set equation ID AFTER setting flag and constants
            if (needsEquationRestore) {
              setSelectedEquationId(flowCalc.equationId);
            }
          }
        }
      }
    }
  }, [isOpen, loadingEquations, equations, data.flowCalculation, selectedEquationId, constants]);

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
    
    // Update parent form with equation ID and empty formula constants as comma-separated
    if (equation) {
      const constants = extractConstants(equation.displayFormula);
      // Create empty values placeholder (e.g., ",,")
      const emptyCommaSeparatedValues = constants.map(() => '').join(',');
      onChange('flowCalculation', {
        equationId: id,
        formulaConstants: emptyCommaSeparatedValues
      });
    }
  };

  const handleConstantChange = (constantName: string, value: string) => {
    const updated = { ...constants, [constantName]: value };
    setConstants(updated);
    
    // Update parent form with updated formula constants as comma-separated values
    if (selectedEquationId) {
      // Convert constants object to comma-separated values (a,b,c -> "1,5,6")
      const constantsArray = extractConstants(selectedEquation?.displayFormula || '');
      const commaSeparatedValues = constantsArray.map(c => updated[c] || '').join(',');
      
      onChange('flowCalculation', {
        equationId: selectedEquationId,
        formulaConstants: commaSeparatedValues
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
