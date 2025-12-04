import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { useSitesData } from '../../sites/hooks/useSitesData';
import apiService, { ApiResponse } from '../../../shared/utils/apiService';
import type { FlowSite } from '../types';
import { toast } from 'react-toastify';

interface FlowCalculationDto {
  id: number;
  siteId: number;
  calculationMethod: string;
  formulaConstants: number[];
  equation: string;
}

export function FlowCalculations() {
  const [selectedSite, setSelectedSite] = useState('');
  const [formulaConstants, setFormulaConstants] = useState<number[]>([]);
  const [equation, setEquation] = useState('');
  const [calculationMethod, setCalculationMethod] = useState('');
  const [constantsError, setConstantsError] = useState<string | null>(null);
  const [constantsLoading, setConstantsLoading] = useState(false);
  const [savingConstants, setSavingConstants] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const { sites, loading: sitesLoading, error: sitesError } = useSitesData();

  useEffect(() => {
    console.log('useEffect (selectedSite) triggered. Current selectedSite:', selectedSite); // Debug log
    if (sites.length > 0 && !selectedSite) {
      setSelectedSite(sites[0].id.toString()); 
    }
  }, [sites, selectedSite]);

  useEffect(() => {
    console.log('useEffect (selectedSite) triggered. Current selectedSite:', selectedSite); // Debug log
    if (!selectedSite) {
      return;
    }

    const fetchFlowCalculation = async () => {
      console.log('fetchFlowCalculation called for site:', selectedSite); // Debug log
      setConstantsLoading(true);
      setConstantsError(null);
      setSaveSuccessMessage(null);
      setSaveErrorMessage(null);

      try {
        const response = await apiService.get<ApiResponse<FlowCalculationDto>>(
          `/v1/FlowCalculation/${selectedSite}`
        );
        console.log('API response received in fetchFlowCalculation:', response); // Debug log

        const flowData = response?.data;

        if (flowData) {
          setEquation(flowData.equation ?? '');
          setFormulaConstants(flowData.formulaConstants ?? []);
          setCalculationMethod(flowData.calculationMethod ?? '');
        } else {
          setEquation('');
          setFormulaConstants([]);
          setCalculationMethod('');
        }
      } catch (error) {
        setEquation('');
        setFormulaConstants([]);
        setCalculationMethod('');
        setConstantsError(
          (error as Error).message
        );
      } finally {
        setConstantsLoading(false);
      }
    };

    fetchFlowCalculation();
  }, [selectedSite]);

  const currentSite = sites.find(s => s.id.toString() === selectedSite) as FlowSite | undefined;

  const handleConstantChange = (index: number, value: number) => {
    setFormulaConstants(prev =>
      prev.map((constant, i) => (i === index ? value : constant))
    );
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);
  };

  const handleSaveConstants = async () => {
    if (!selectedSite) {
      setSaveErrorMessage('يرجى اختيار موقع قبل الحفظ.');
      return;
    }

    setSavingConstants(true);
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);

    try {
      const payload = JSON.stringify(formulaConstants.join(','));
      await apiService.put<ApiResponse<FlowCalculationDto>, string>(
        `/v1/FlowCalculation/${selectedSite}`,
        payload
      );
      toast.success('تم حفظ المعاملات بنجاح');

    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSavingConstants(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl">حسابات التدفق</h2>
        <p className="text-gray-500 mt-1">تكوين معادلات ومنحنيات حساب التدفق</p>
      </div>

      {/* Site Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2" >
              <Label>اختر الموقع</Label>
              <Select  value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue />
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
              <Label>طريقة الحساب</Label>
              <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                <Badge variant="outline">
                  {calculationMethod || '—'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">تكوين المعادلة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" dir="rtl">
            <p className="text-sm text-blue-800 text-center">
              <strong>المعادلة: </strong> {equation || '—'}
            </p>
          </div>

          {constantsError && (
            <p className="text-sm text-red-600 text-center">{constantsError}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formulaConstants.map((value, index) => (
              <div key={`constant-${index}`} className="space-y-2">
                <Label htmlFor={`constant-${index}`}>
                  {index === 0 ? 'a' : index === 1 ? 'b' : index === 2 ? 'c' : `C${index + 1}`}{" "}
                  <span className="text-gray-500">(ثابت)</span>
                </Label>
                <Input
                  id={`constant-${index}`}
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) =>
                    handleConstantChange(index, parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            ))}

            {/* {!constantsLoading && formulaConstants.length === 0 && (
              <p className="text-gray-500 text-center col-span-full">
                لا توجد ثوابت متاحة لهذا الموقع.
              </p>
            )} */}
          </div>

          <div className="flex justify-start ">
            <Button
              disabled={constantsLoading || savingConstants}
              onClick={handleSaveConstants}
              loadingText="جاري الحفظ..."
              isLoading={savingConstants}
            >
              حفظ المعاملات
            </Button>
          </div>

          {saveSuccessMessage && (
            <p className="text-sm text-green-600 text-center">{saveSuccessMessage}</p>
          )}

          {saveErrorMessage && (
            <p className="text-sm text-red-600 text-center">{saveErrorMessage}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
