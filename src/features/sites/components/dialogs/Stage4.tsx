import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../components/ui/select';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import type { Site } from '../../types';

interface Equation {
  id: number;
  name: string;
  formula: string;
  constants: string[]; // Array of constant names needed
}

// Mock equations data - replace with actual API call
const EQUATIONS: Equation[] = [
  {
    id: 1,
    name: 'Linear Flow',
    formula: 'Q = a × H + b',
    constants: ['a', 'b']
  },
  {
    id: 2,
    name: 'Quadratic Flow',
    formula: 'Q = a × H² + b × H + c',
    constants: ['a', 'b', 'c']
  },
  {
    id: 3,
    name: 'Power Flow',
    formula: 'Q = a × H^n',
    constants: ['a', 'n']
  }
];

// Helper function to map equation names to translation keys
const getEquationKey = (equationName: string): string => {
  switch (equationName) {
    case 'Linear Flow':
      return 'linearFlow';
    case 'Quadratic Flow':
      return 'quadraticFlow';
    case 'Power Flow':
      return 'powerFlow';
    default:
      return 'linearFlow';
  }
};

interface Stage4Props {
  data: Partial<Site>;
  onChange: (field: string, value: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Stage4({ data, onChange, isOpen, onClose }: Stage4Props) {
  const { t } = useTranslation();
  const dir = t('_rtl') === 'rtl' ? 'rtl' : 'ltr';
  const [selectedEquationId, setSelectedEquationId] = useState<number | null>(
    data.flowCalculation?.equationId || null
  );
  const [constants, setConstants] = useState<{ [key: string]: string }>({});
  const [selectedEquation, setSelectedEquation] = useState<Equation | null>(null);

  useEffect(() => {
    if (selectedEquationId) {
      const equation = EQUATIONS.find(eq => eq.id === selectedEquationId);
      setSelectedEquation(equation || null);
      
      // Parse stored constants if they exist
      if (data.flowCalculation?.formulaConstants && equation) {
        try {
          const parsed = JSON.parse(data.flowCalculation.formulaConstants);
          setConstants(parsed);
        } catch {
          // Initialize empty constants
          setConstants(equation.constants.reduce((acc, c) => ({ ...acc, [c]: '' }), {}));
        }
      } else if (equation) {
        // Initialize empty constants
        setConstants(equation.constants.reduce((acc, c) => ({ ...acc, [c]: '' }), {}));
      }
    } else {
      setSelectedEquation(null);
      setConstants({});
    }
  }, [selectedEquationId, data.flowCalculation?.formulaConstants]);

  const handleEquationChange = (equationId: string) => {
    const id = parseInt(equationId);
    const equation = EQUATIONS.find(eq => eq.id === id);
    setSelectedEquationId(id);
    
    // Update parent form with equation ID and empty formula constants
    if (equation) {
      onChange('flowCalculation', {
        equationId: id,
        formulaConstants: JSON.stringify(equation.constants.reduce((acc: { [key: string]: string }, c: string) => ({ ...acc, [c]: '' }), {}))
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
    
    let displayFormula = selectedEquation.formula;
    selectedEquation.constants.forEach(constant => {
      const value = constants[constant] || '';
      displayFormula = displayFormula.replaceAll(constant, value);
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
    wordBreak: 'break-word'
  };

  return (
    <div style={containerStyle}>
      <div style={fieldContainerStyle}>
        <Label>{t('sites.stage4.selectEquation')}</Label>
        <Select value={selectedEquationId?.toString() || ''} onValueChange={handleEquationChange} dir={dir}>
          <SelectTrigger>
            <SelectValue placeholder={t('sites.stage4.selectEquationPlaceholder')} />
          </SelectTrigger>
          <SelectContent dir={dir}>
            {EQUATIONS.map(equation => (
              <SelectItem key={equation.id} value={equation.id.toString()}>
                {t(`sites.stage4.${getEquationKey(equation.name)}`)}
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
              {selectedEquation.formula}
            </div>
          </div>

          <div style={fieldContainerStyle}>
            <Label>{t('sites.stage4.fillConstants')}</Label>
            <div style={gridContainerStyle}>
              {selectedEquation.constants.map(constant => (
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
              {buildEquationDisplay() || selectedEquation.formula}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
