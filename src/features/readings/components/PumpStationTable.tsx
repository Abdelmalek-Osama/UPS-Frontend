import React, { useState, useEffect } from 'react';
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
import apiService from '../../../../src/shared/utils/apiService';
import type { Site } from '../../sites/types';
import type {PumpStationApiResponse, PumpStationReading, SiteLookupOption} from "../types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from '../../../components/ui/select';
import {Input} from '../../../components/ui/input';
import {DatePicker} from '../../../components/ui/datepicker';

interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

// Redefine PumpStationApiResponse locally to match API response


const formatDateTimeForAPI = (date: Date | null): string => {
  if (!date) return '';
  // Using toISOString for precise UTC formatting, then truncate to seconds
  return date.toISOString().slice(0, 19);
};

interface PumpStationTableProps {
  onViewDetails: (reading: PumpStationReading) => void;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  handleExport: () => void;
  isEditPumpStationOpen: boolean;
  setIsEditPumpStationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingPumpStation: PumpStationReading | null;
  setEditingPumpStation: React.Dispatch<React.SetStateAction<PumpStationReading | null>>;
  handleEditPumpStation: (reading: PumpStationReading) => void;
  readings: PumpStationReading[];
  sites: SiteLookupOption[];
  selectedSiteId: string;
  startDate: Date | null;
  endDate: Date | null;
  isLoading: boolean;
  error: string | null;
  fetchPumpStationReadings: (siteId: number, startDate?: string, endDate?: string) => Promise<void>;
  createPumpStationReading: (data: {
    siteId: number;
    timestamp: string;
    timePerHour: number;
    recordNumber: number;
    p1_Time: number;
    p1_Flow: number;
    p2_Time: number;
    p2_Flow: number;
    p3_Time: number;
    p3_Flow: number;
    p4_Time: number;
    p4_Flow: number;
    p5_Time: number;
    p5_Flow: number;
    p6_Time: number;
    p6_Flow: number;
    p7_Time: number;
    p7_Flow: number;
    p8_Time: number;
    p8_Flow: number;
    p9_Time: number;
    p9_Flow: number;
    p10_Time: number;
    p10_Flow: number;
    totalUptime: number;
    totalFlow: number;
    isManual: boolean;
  }) => Promise<any>;
  updatePumpStationReading: (data: {
    id: number;
    siteId: number;
    timestamp: string;
    timePerHour: number;
    recordNumber: number;
    p1_Time: number;
    p1_Flow: number;
    p2_Time: number;
    p2_Flow: number;
    p3_Time: number;
    p3_Flow: number;
    p4_Time: number;
    p4_Flow: number;
    p5_Time: number;
    p5_Flow: number;
    p6_Time: number;
    p6_Flow: number;
    p7_Time: number;
    p7_Flow: number;
    p8_Time: number;
    p8_Flow: number;
    p9_Time: number;
    p9_Flow: number;
    p10_Time: number;
    p10_Flow: number;
    totalUptime: number;
    totalFlow: number;
    isManual: boolean;
  }) => Promise<any>;
}

export function PumpStationTable({
  // readings,
  onViewDetails,
  isAddDialogOpen,
  setIsAddDialogOpen,
  handleExport,
  isEditPumpStationOpen,
  setIsEditPumpStationOpen,
  setEditingPumpStation,
  editingPumpStation,
  handleEditPumpStation,
  readings,
  sites,
  selectedSiteId,
  startDate,
  endDate,
  isLoading,
  error,
  fetchPumpStationReadings,
  createPumpStationReading,
  updatePumpStationReading,
}: PumpStationTableProps) {
    const [readingDate, setReadingDate] = useState<Date | undefined>();
    const [readingTime, setReadingTime] = useState<string>('');
    const [editReadingDate, setEditReadingDate] = useState<Date | undefined>(undefined);
    const [editReadingTime, setEditReadingTime] = useState<string>('');
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);

    // Fetch selected site details to get numPumps
    useEffect(() => {
      const fetchSelectedSite = async () => {
        if (selectedSiteId) {
          try {
            const response = await apiService.get<Site>(`/v1/Sites/${selectedSiteId}`);
            setSelectedSite(response);
          } catch (err) {
            console.error("Failed to fetch site details:", err);
            setSelectedSite(null);
          }
        }
      };
      fetchSelectedSite();
    }, [selectedSiteId]);

    // Existing states for dialogs and form inputs

    // Handlers
    
    // Determine number of pumps based on first reading's pumps array or site configuration
    const firstReading = readings.length > 0 ? readings[0] : null;
    const numPumps = firstReading?.pumps?.length || selectedSite?.numPumps || 0;
    
    // Calculate total column count for colSpan (site, timestamp, pumps*2, totalUptime, totalFlow, actions)
    const totalColumns = 2 + (numPumps * 2) + 3;
    
  return (
    <Card >
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
                    <Select dir="rtl" value={selectedSiteId || ''} onValueChange={(value) => {
                      // Site selection handled by parent
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموقع" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* {sites.map(site => (
                          <SelectItem key={site.id} value={site.name}>{site.name}</SelectItem>
                        ))} */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>التاريخ</Label>
                    <DatePicker 
                    placeholder="اختر التاريخ"
                    value={readingDate}
                    onChange={(date) => setReadingDate(date ?? undefined)}
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
                    <Label> المرفعات النشطة</Label>
                    <Input type="number" step="0.1" placeholder="125.4" />
                  </div>
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
                    <Select dir="rtl" value={editingPumpStation?.site || ""} onValueChange={(value) => {
                      if (editingPumpStation) {
                        setEditingPumpStation(prev => prev ? { ...prev, site: value } : null);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموقع" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* {sites.map(site => (
                          <SelectItem key={site.id} value={site.name}>{site.name}</SelectItem>
                        ))} */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>التاريخ</Label>
                    <DatePicker 
                    placeholder="اختر التاريخ"
                    value={editReadingDate}
                    onChange={(date) => setEditReadingDate(date ?? undefined)}
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
                    <Label> المرفعات النشطة</Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      defaultValue={editingPumpStation?.pumps ? editingPumpStation.pumps.filter(p => p.time > 0).length : 0}
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
      <CardContent className="overflow-x-hidden">
        <div className="overflow-x-auto">
          <Table  className="min-w-max" dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الموقع</TableHead>
                <TableHead className="text-right">التاريخ والوقت</TableHead>
                {numPumps > 0 && Array.from({ length: numPumps }).map((_, i) => (
                  <React.Fragment key={i}>
                    <TableHead className="text-right">مضخة {i + 1} وقت التشغيل</TableHead>
                    <TableHead className="text-right">مضخة {i + 1} التدفق</TableHead>
                  </React.Fragment>
                ))}
                <TableHead className="text-right">إجمالي وقت التشغيل</TableHead>
                <TableHead className="text-right">إجمالي التدفق</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.length === 0 && !isLoading && !error && (
                <TableRow>
                  <TableCell colSpan={totalColumns} className="h-24 text-center">
                    {selectedSiteId
                      ? "لا توجد قراءات لمحطة الرفع هذه ضمن النطاق الزمني المحدد."
                      : "الرجاء اختيار موقع لعرض قراءات محطة الرفع."}
                  </TableCell>
                </TableRow>
              )}
              {error && (
                <TableRow>
                  <TableCell colSpan={totalColumns} className="h-24 text-center text-red-500">
                    حدث خطأ أثناء تحميل البيانات: {error}
                  </TableCell>
                </TableRow>
              )}
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={totalColumns} className="h-24 text-center">
                    تحميل البيانات...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !error && readings.map((reading) => {
                return (
                <TableRow key={reading.id}>
                  <TableCell className="text-right font-medium">{reading.site}</TableCell>
                  <TableCell className="text-right">{reading.timestamp}</TableCell>
                  {numPumps > 0 && Array.from({ length: numPumps }).map((_, i) => {
                    const pump = reading.pumps?.[i];
                    return (
                      <React.Fragment key={i}>
                        <TableCell className="text-right">{pump?.time?.toFixed(1) || 'N/A'} ساعة</TableCell>
                        <TableCell className="text-right">{pump?.flow?.toFixed(1) || 'N/A'} م³/س</TableCell>
                      </React.Fragment>
                    );
                  })}
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
               );
               })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
