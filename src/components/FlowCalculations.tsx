import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calculator, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HQCurvePoint {
  head: number;
  flow: number;
}

export function FlowCalculations() {
  const [selectedSite, setSelectedSite] = useState('site1');
  const [activeTab, setActiveTab] = useState('formula');
  
  // Mock data for formula method
  const [formulaParams, setFormulaParams] = useState({
    c: 1.84,
    w: 2.5,
    n: 1.5
  });

  // Mock data for HQ curve
  const [hqCurve, setHqCurve] = useState<HQCurvePoint[]>([
    { head: 0, flow: 0 },
    { head: 0.5, flow: 12.5 },
    { head: 1.0, flow: 28.3 },
    { head: 1.5, flow: 46.8 },
    { head: 2.0, flow: 67.2 },
    { head: 2.5, flow: 89.1 },
    { head: 3.0, flow: 112.4 },
  ]);

  const sites = [
    { id: 'site1', name: 'مستوى المياه - القاهرة 01', method: 'Formula' },
    { id: 'site2', name: 'مستوى المياه - الإسكندرية 01', method: 'HQCurve' },
    { id: 'site3', name: 'مستوى المياه - الجيزة 03', method: 'Formula' },
  ];

  const currentSite = sites.find(s => s.id === selectedSite);

  // Calculate flow using formula: Q = C × W × H^n
  const calculateFlow = (uswl: number, dswl: number) => {
    const h = uswl - dswl;
    return formulaParams.c * formulaParams.w * Math.pow(h, formulaParams.n);
  };

  // Sample calculation
  const sampleUSWL = 125.4;
  const sampleDSWL = 122.1;
  const sampleFlow = calculateFlow(sampleUSWL, sampleDSWL);

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
            <div className="space-y-2">
              <Label>اختر الموقع</Label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
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

      {/* Tabs for Formula vs HQ Curve */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>

        {/* Formula Method */}
        <TabsContent value="formula" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تكوين المعادلة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 text-center">
                  <strong>المعادلة:</strong> Q = C × W × H<sup>n</sup>
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

              <div className="flex justify-end">
                <Button>حفظ المعاملات</Button>
              </div>
            </CardContent>
          </Card>

          {/* Sample Calculation */}

        </TabsContent>

        {/* HQ Curve Method */}
        <TabsContent value="hqcurve" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>جدول منحنى HQ</CardTitle>
              <Button size="sm">
                <Plus className="ml-2 h-4 w-4" />
                إضافة نقطة
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الرأس (Head) - متر</TableHead>
                    <TableHead className="text-right">التدفق (Flow) - م³/س</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hqCurve.map((point, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input 
                          type="number" 
                          step="0.1"
                          value={point.head}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          step="0.1"
                          value={point.flow}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-4">
                <Button>حفظ المنحنى</Button>
              </div>
            </CardContent>
          </Card>

          {/* HQ Curve Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>رسم منحنى HQ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hqCurve}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="head" 
                    label={{ value: 'الرأس (م)', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'التدفق (م³/س)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="flow" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    name="التدفق"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>ملاحظة:</strong> يتم استخدام الاستيفاء الخطي (Linear Interpolation) بين النقاط لحساب التدفق عند قيم الرأس المتوسطة.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
