import React, { useState } from 'react';
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { FormulaParams, FlowSite } from '../types';

export function FlowCalculations() {
  const [selectedSite, setSelectedSite] = useState('site1');
  const [formulaParams, setFormulaParams] = useState<FormulaParams>({
    c: 1.84,
    w: 2.5,
    n: 1.5
  });

  const sites: FlowSite[] = [
    { id: 'site1', name: 'مستوى المياه - القاهرة 01', method: 'Formula' },
    { id: 'site2', name: 'مستوى المياه - الإسكندرية 01', method: 'HQCurve' },
    { id: 'site3', name: 'مستوى المياه - الجيزة 03', method: 'Formula' },
  ];

  const currentSite = sites.find(s => s.id === selectedSite);

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
                    <SelectItem key={site.id} value={site.id}>
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
                  {currentSite?.method === 'Formula' ? 'معادلة' : 'منحنى HQ'}
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
              <strong>المعادلة: </strong> Q = C × W × H<sup>n</sup>
            </p>
            <p className="text-xs text-blue-600 text-center mt-1">
              حيث H = USWL - DSWL
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="param-c">
                معامل C <span className="text-gray-500">(معامل التصريف)</span>
              </Label>
              <Input 
                id="param-c"
                type="number" 
                step="0.01"
                value={formulaParams.c}
                onChange={(e) => setFormulaParams({...formulaParams, c: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="param-w">
                معامل W <span className="text-gray-500">(عرض الممر)</span>
              </Label>
              <Input 
                id="param-w"
                type="number" 
                step="0.1"
                value={formulaParams.w}
                onChange={(e) => setFormulaParams({...formulaParams, w: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="param-n">
                معامل n <span className="text-gray-500">(الأس)</span>
              </Label>
              <Input 
                id="param-n"
                type="number" 
                step="0.1"
                value={formulaParams.n}
                onChange={(e) => setFormulaParams({...formulaParams, n: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="flex justify-start ">
            <Button >حفظ المعاملات</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
