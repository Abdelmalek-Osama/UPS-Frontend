import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Calendar } from '../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { 
  Plus, 
  Download, 
  Upload, 
  CalendarIcon,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../../../components/ui/dialog';
import { useReadingsData } from '../hooks/useReadingsData';
import { WaterLevelTable } from './WaterLevelTable';
import { PumpStationTable } from './PumpStationTable';
import type { PumpStationReading } from '../types';

export function ReadingsManagement() {
  const { waterLevelReadings, pumpStationReadings, sites } = useReadingsData();
  const [activeTab, setActiveTab] = useState('waterLevel');
  const [selectedSite, setSelectedSite] = useState('مستوى المياه - القاهرة 01');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isPumpDetailsOpen, setIsPumpDetailsOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState<PumpStationReading | null>(null);

  const handleExport = () => {
    alert('سيتم تصدير البيانات إلى ملف Excel');
  };

  const handleViewPumpDetails = (reading: PumpStationReading) => {
    setSelectedReading(reading);
    setIsPumpDetailsOpen(true);
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

        <TabsContent value="waterLevel" className="mt-6">
          <WaterLevelTable readings={waterLevelReadings} />
        </TabsContent>

        <TabsContent value="pumpStation" className="mt-6">
          <PumpStationTable 
            readings={pumpStationReadings} 
            onViewDetails={handleViewPumpDetails}
          />
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
    </div>
  );
}
