import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table';
import { Download, Edit, FileText, Plus, CalendarIcon } from 'lucide-react';
import type { PumpStationReading } from '../types';
import {useReadingsData} from '../hooks/useReadingsData';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from '../../../components/ui/select';
import {Input} from '../../../components/ui/input';
import { Calendar } from '../../../components/ui/calendar';
import {DatePicker} from '../../../components/ui/datepicker';

interface PumpStationTableProps {
  readings: PumpStationReading[];
  onViewDetails: (reading: PumpStationReading) => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
}

export function PumpStationTable({ readings, onViewDetails, isAddDialogOpen, setIsAddDialogOpen }: PumpStationTableProps) {
    const {
        waterLevelReadings,
        pumpStationReadings,
        setPumpStationReadings,
        sites,
        handleViewPumpDetails,
        handleEditPump,
        handleExport,
        isEditPumpStationOpen,
        setIsEditPumpStationOpen,
        editingPumpStation,
        handleEditPumpStation,
        }=useReadingsData();
    const [readingDate, setReadingDate] = useState<Date | undefined>();
    const [readingTime, setReadingTime] = useState<string>('');
    const [editReadingDate, setEditReadingDate] = useState<Date | undefined>();
    const [editReadingTime, setEditReadingTime] = useState<string>('');
    
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>قراءات محطات رفع ({readings.length})</CardTitle>
            <div className="flex gap-2 justify-end">

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
                <DialogTitle className="text-right">إضافة قراءة يدوية</DialogTitle>
                <DialogDescription className="text-right">
                  أدخل بيانات القراءة الجديدة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الموقع</Label>
                    <Select dir="rtl" defaultValue="all">
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
                    <Label>التاريخ</Label>
                    <DatePicker 
                    placeholder="اختر التاريخ"
                    value={readingDate}
                    onChange={setReadingDate}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>الوقت</Label>
                  <Select dir="rtl" value={readingTime} onValueChange={setReadingTime}>
                    <SelectTrigger className="w-1/2">
                      <SelectValue placeholder="اختر الساعة" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {`${hour}:00`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label> المضخات النشطة</Label>
                    <Input type="number" step="0.1" placeholder="125.4" />
                  </div>
                  {/* <div className="space-y-2">
                    <Label>	إجمالي وقت التشغيل</Label>
                    <Input type="number" step="0.1" placeholder="122.1" />
                  </div>*/}
                </div>
                {/* <div className="space-y-2">
                  <Label>إجمالي التدفق</Label>
                  <Input type="number" step="0.1" placeholder="12.8" />
                </div> */}
                {/* <div className="bg-gray-50 border rounded-lg p-4">
                  <Label className="text-sm text-gray-600" >التدفق المحسوب</Label>
                  <p className="text-2xl mt-1">34.5 م³/س</p>
                  <p className="text-xs text-gray-500 mt-1">يتم الحساب تلقائياً بناءً على المعادلة المعرفة للموقع</p>
                </div> */}
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

          {/* Edit Dialog */}
          <Dialog open={isEditPumpStationOpen} onOpenChange={setIsEditPumpStationOpen}>
            <DialogContent className="sm:max-w-[600px]" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">تعديل القراءة</DialogTitle>
                <DialogDescription className="text-right">
                  قم بتعديل بيانات القراءة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الموقع</Label>
                    <Select dir="rtl" defaultValue={editingPumpStation?.site || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموقع" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites.map(site => (
                          <SelectItem key={site} value={site}>{site}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>التاريخ</Label>
                    <DatePicker 
                    placeholder="اختر التاريخ"
                    value={editReadingDate}
                    onChange={setEditReadingDate}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>الوقت</Label>
                  <Select dir="rtl" value={editReadingTime} onValueChange={setEditReadingTime}>
                    <SelectTrigger className="w-1/2">
                      <SelectValue placeholder="اختر الساعة" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {`${hour}:00`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label> المضخات النشطة</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      defaultValue={editingPumpStation?.pumps.filter(p => p.time > 0).length || 0}
                      placeholder="0" 
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditPumpStationOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => setIsEditPumpStationOpen(false)}>
                  حفظ التعديلات
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
            </div>
        </div>
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
              {readings.map((reading) => (
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditPumpStation(reading)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onViewDetails(reading)}
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
  );
}
