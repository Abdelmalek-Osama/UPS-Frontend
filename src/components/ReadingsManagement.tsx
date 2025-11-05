import React, { useState } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  Plus, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  CalendarIcon,
  FileText,
  AlertCircle
} from 'lucide-react';

interface WaterLevelReading {
  id: number;
  site: string;
  timestamp: string;
  uswl: number;
  dswl: number;
  battery: number;
  calculatedFlow: number;
  hasAlarm: boolean;
}

interface PumpStationReading {
  id: number;
  site: string;
  timestamp: string;
  pumps: { time: number; flow: number }[];
  totalUptime: number;
  totalFlow: number;
  hasAlarm: boolean;
}

export function ReadingsManagement() {
  const [activeTab, setActiveTab] = useState('waterLevel');
  const [selectedSite, setSelectedSite] = useState('مستوى المياه - القاهرة 01'); // Default: all sites
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isPumpDetailsOpen, setIsPumpDetailsOpen] = useState(false);
  const [isPumpEditOpen, setIsPumpEditOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState<PumpStationReading | null>(null);
  const [selectedPumpIndex, setSelectedPumpIndex] = useState<number | null>(null);

  const waterLevelReadings: WaterLevelReading[] = [
    { id: 1, site: 'مستوى المياه - القاهرة 01', timestamp: '2025-11-03 11:00', uswl: 125.4, dswl: 122.1, battery: 12.8, calculatedFlow: 34.5, hasAlarm: false },
    { id: 2, site: 'مستوى المياه - القاهرة 01', timestamp: '2025-11-03 10:00', uswl: 125.2, dswl: 121.9, battery: 12.4, calculatedFlow: 33.8, hasAlarm: true },
    { id: 3, site: 'مستوى المياه - الإسكندرية 01', timestamp: '2025-11-03 11:00', uswl: 98.7, dswl: 95.2, battery: 13.1, calculatedFlow: 28.9, hasAlarm: false },
  ];

  const pumpStationReadings: PumpStationReading[] = [
    { 
      id: 1, 
      site: 'محطة الضخ - الجيزة 01', 
      timestamp: '2025-11-03 11:00',
      pumps: [
        { time: 3.5, flow: 45.2 },
        { time: 4.2, flow: 48.1 },
        { time: 0, flow: 0 },
      ],
      totalUptime: 7.7,
      totalFlow: 93.3,
      hasAlarm: false
    },
    { 
      id: 2, 
      site: 'محطة الضخ - الدقهلية 02', 
      timestamp: '2025-11-03 11:00',
      pumps: [
        { time: 5.0, flow: 52.3 },
        { time: 4.8, flow: 50.1 },
        { time: 3.2, flow: 38.5 },
      ],
      totalUptime: 13.0,
      totalFlow: 140.9,
      hasAlarm: false
    },
  ];

  const sites = [
    'مستوى المياه - القاهرة 01',
    'مستوى المياه - الإسكندرية 01',
    'محطة الضخ - الجيزة 01',
    'محطة الضخ - الدقهلية 02',
  ];

  const handleExport = () => {
    alert('سيتم تصدير البيانات إلى ملف Excel');
  };

  const handleViewPumpDetails = (reading: PumpStationReading) => {
    setSelectedReading(reading);
    setIsPumpDetailsOpen(true);
  };

  const handleEditPump = (pumpIndex: number) => {
    setSelectedPumpIndex(pumpIndex);
    setIsPumpEditOpen(true);
    setIsPumpDetailsOpen(false);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة القراءات</h2>
          <p className="text-gray-500 mt-1">عرض وتحرير قراءات المواقع</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="ml-2 h-4 w-4" />
                استيراد من ملف
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>استيراد البيانات</DialogTitle>
                <DialogDescription>
                  رفع ملف .dat يحتوي على القراءات
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">اسحب الملف هنا أو انقر للتحميل</p>
                  <Input type="file" className="mt-4" accept=".dat" />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p>تنسيق الملف المطلوب: .dat</p>
                      <p className="mt-1">سيتم التحقق من صحة البيانات تلقائياً قبل الاستيراد</p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => setIsImportDialogOpen(false)}>
                  استيراد البيانات
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleExport}>
            <Download className="ml-2 h-4 w-4" />
            تصدير
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة قراءة يدوية
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]" dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة قراءة يدوية</DialogTitle>
                <DialogDescription>
                  أدخل بيانات القراءة الجديدة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الموقع</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموقع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع المواقع</SelectItem>
                        {sites.map(site => (
                          <SelectItem key={site} value={site}>{site}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>التاريخ والوقت</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          اختر التاريخ
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>USWL (متر)</Label>
                    <Input type="number" step="0.1" placeholder="125.4" />
                  </div>
                  <div className="space-y-2">
                    <Label>DSWL (متر)</Label>
                    <Input type="number" step="0.1" placeholder="122.1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>البطارية (فولت)</Label>
                  <Input type="number" step="0.1" placeholder="12.8" />
                </div>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <Label className="text-sm text-gray-600" >التدفق المحسوب</Label>
                  <p className="text-2xl mt-1">34.5 م³/س</p>
                  <p className="text-xs text-gray-500 mt-1">يتم الحساب تلقائياً بناءً على المعادلة المعرفة للموقع</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  حفظ القراءة
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedSite} onValueChange={setSelectedSite} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="اختر الموقع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المواقع</SelectItem>
                {sites.map(site => (
                  <SelectItem key={site} value={site}>{site}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  من تاريخ
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  إلى تاريخ
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="waterLevel">قراءات مستوى المياه</TabsTrigger>
          <TabsTrigger value="pumpStation">قراءات محطات الضخ</TabsTrigger>
        </TabsList>

        {/* Water Level Readings */}
        <TabsContent value="waterLevel" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>قراءات مستوى المياه ({waterLevelReadings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table dir="rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الموقع</TableHead>
                      <TableHead className="text-right">التاريخ والوقت</TableHead>
                      <TableHead className="text-right">USWL (م)</TableHead>
                      <TableHead className="text-right">DSWL (م)</TableHead>
                      <TableHead className="text-right">البطارية (V)</TableHead>
                      <TableHead className="text-right">التدفق المحسوب</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waterLevelReadings.map((reading) => (
                      <TableRow key={reading.id}>
                        <TableCell className="text-right font-medium">{reading.site}</TableCell>
                        <TableCell className="text-right">{reading.timestamp}</TableCell>
                        <TableCell className="text-right">{reading.uswl.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{reading.dswl.toFixed(1)}</TableCell>
                        <TableCell className={`text-right ${reading.battery < 12.5 ? 'text-yellow-600 font-medium' : ''}`}>
                          {reading.battery.toFixed(1)}
                        </TableCell>
                        <TableCell  className={`text-right ${reading.calculatedFlow < 30 ? 'text-red-600 font-medium' : ''}`}>
                          <div className="flex items-center justify-start gap-2">
                            <span>{reading.calculatedFlow.toFixed(1)} م³/س</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pump Station Readings */}
        <TabsContent value="pumpStation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>قراءات محطات الضخ ({pumpStationReadings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table dir="rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الموقع</TableHead>
                      <TableHead className="text-right">التاريخ والوقت</TableHead>
                      <TableHead className="text-right">المضخات النشطة</TableHead>
                      <TableHead className="text-right">إجمالي وقت التشغيل</TableHead>
                      <TableHead className="text-right">إجمالي التدفق</TableHead>
                      <TableHead className="text-right">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pumpStationReadings.map((reading) => (
                      <TableRow key={reading.id}>
                        <TableCell className="text-right font-medium">{reading.site}</TableCell>
                        <TableCell className="text-right">{reading.timestamp}</TableCell>
                        <TableCell className="text-right">
                          {reading.pumps.filter(p => p.time > 0).length} / {reading.pumps.length}
                        </TableCell>
                        <TableCell className="text-right">{reading.totalUptime.toFixed(1)} ساعة</TableCell>
                        <TableCell className="text-right">{reading.totalFlow.toFixed(1)} م³/س</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewPumpDetails(reading)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pump Details Dialog */}
      <Dialog open={isPumpDetailsOpen} onOpenChange={setIsPumpDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل قراءات المضخات</DialogTitle>
            <DialogDescription>
              {selectedReading?.site} - {selectedReading?.timestamp}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم المضخة</TableHead>
                  <TableHead className="text-right">وقت التشغيل (ساعة)</TableHead>
                  <TableHead className="text-right">التدفق (م³/س)</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedReading?.pumps.map((pump, index) => (
                  <TableRow key={index}>
                    <TableCell>مضخة {index + 1}</TableCell>
                    <TableCell>{pump.time.toFixed(1)}</TableCell>
                    <TableCell>{pump.flow.toFixed(1)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditPump(index)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">إجمالي وقت التشغيل</p>
                  <p className="text-xl mt-1">{selectedReading?.totalUptime.toFixed(1)} ساعة</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">إجمالي التدفق</p>
                  <p className="text-xl mt-1">{selectedReading?.totalFlow.toFixed(1)} م³/س</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPumpDetailsOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Pump Dialog */}
      <Dialog open={isPumpEditOpen} onOpenChange={setIsPumpEditOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المضخة {selectedPumpIndex !== null ? selectedPumpIndex + 1 : ''}</DialogTitle>
            <DialogDescription>
              تحديث قراءات المضخة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>الموقع</Label>
              <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                <span className="text-sm">{selectedReading?.site}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>التاريخ والوقت</Label>
              <div className="flex items-center h-10 px-3 border rounded-md bg-gray-50">
                <span className="text-sm">{selectedReading?.timestamp}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>وقت التشغيل (ساعة)</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  defaultValue={selectedPumpIndex !== null ? selectedReading?.pumps[selectedPumpIndex]?.time : 0}
                />
              </div>
              <div className="space-y-2">
                <Label>التدفق (م³/س)</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  defaultValue={selectedPumpIndex !== null ? selectedReading?.pumps[selectedPumpIndex]?.flow : 0}
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p>سيتم إعادة حساب إجمالي التدفق ووقت التشغيل تلقائياً بعد التعديل</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPumpEditOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => setIsPumpEditOpen(false)}>
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}