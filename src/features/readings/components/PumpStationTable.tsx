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
import type {PumpStationApiResponse, PumpStationReading, SiteLookupOption, ApiResponse, CreatePumpStationReadingRequest} from "../types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import {Select, SelectTrigger, SelectValue, SelectContent, SelectItem} from '../../../components/ui/select';
import {Input} from '../../../components/ui/input';
import {DatePicker} from '../../../components/ui/datepicker';
import { hexToHsl, getColorCategory, formatDateTimeForAPI } from '../utils/utils';


interface PumpStationTableProps {
  // onViewDetails: (reading: PumpStationReading) => void; // Removed, dialog handled internally
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  handleExport: () => void;
  isEditPumpStationOpen: boolean;
  setIsEditPumpStationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingPumpStation: PumpStationReading | null;
  setEditingPumpStation: React.Dispatch<React.SetStateAction<PumpStationReading | null>>;
  readings: PumpStationReading[];
  sites: SiteLookupOption[];
  selectedSiteId: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  isLoading: boolean;
  error: string | null;
  fetchPumpStationReadings: (siteId: number, startDate?: string, endDate?: string) => Promise<void>;
  createPumpStationReading: (data: CreatePumpStationReadingRequest) => Promise<any>;
  updatePumpStationReading: (data: CreatePumpStationReadingRequest & { id: number }) => Promise<any>;
  selectedSite: Site | null;
  handleEditPumpStation: (reading: PumpStationReading) => void;
  handleEditPump: (pumpIndex: number, reading: PumpStationReading) => void; // Added handleEditPump prop
}

export function PumpStationTable({
  // readings,
  // onViewDetails, // Removed, dialog handled internally
  isAddDialogOpen,
  setIsAddDialogOpen,
  handleExport,
  isEditPumpStationOpen,
  setIsEditPumpStationOpen,
  setEditingPumpStation,
  editingPumpStation,
  handleEditPumpStation, // Re-added to props destructuring
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
  selectedSite,
  handleEditPump, // Added handleEditPump to destructuring
}: PumpStationTableProps) {
    const [pumpReadings, setPumpReadings] = useState<{ time: number; flow: number }[]>([]);
    const [readingDateTime, setReadingDateTime] = useState<Date | undefined>();
    const [readingDate, setReadingDate] = useState<Date | undefined>();
    const [recordNumber, setRecordNumber] = useState<number>(0);
    const [timePerHour, setTimePerHour] = useState<number>(0);

    const [editActivePumpsCount, setEditActivePumpsCount] = useState<number>(0);
    const [editReadingDate, setEditReadingDate] = useState<Date | undefined>();
    const [editRecordNumber, setEditRecordNumber] = useState<number>(0);
    const [editTimePerHour, setEditTimePerHour] = useState<number>(0);
    const [editPumpReadings, setEditPumpReadings] = useState<{ time: number; flow: number }[]>([]);
    const [isSubmittingAdd, setIsSubmittingAdd] = useState(false); // New state for add dialog submission
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false); // New state for edit dialog submission

    const [isPumpDetailsOpen, setIsPumpDetailsOpen] = useState(false); // Added local state for pump details dialog
    const [selectedReading, setSelectedReading] = useState<PumpStationReading | null>(null); // Added local state for selected reading

    // Extracted values for clearer conditional rendering
    const shouldShowUSLevel = selectedSite?.hasUS ?? false;
    const shouldShowDS1Level = selectedSite?.hasDS1 ?? false;
    const shouldShowDS2Level = selectedSite?.hasDS2 ?? false;
    const numberOfPumps = selectedSite?.numPumps ?? 0;

    useEffect(() => {
      console.log('useEffect (selectedSite?.numPumps) triggered. selectedSite.numPumps:', selectedSite?.numPumps);
      if (selectedSite?.numPumps) {
        setPumpReadings(Array.from({ length: selectedSite.numPumps }, () => ({ time: 0, flow: 0 })));
      } else {
        setPumpReadings([]);
      }
    }, [selectedSite?.numPumps]);

    useEffect(() => {
      if (!isAddDialogOpen) { // Reset form when dialog closes
        setReadingDate(undefined);
        setRecordNumber(0);
        setTimePerHour(0);
        setPumpReadings(Array.from({ length: selectedSite?.numPumps || 0 }, () => ({ time: 0, flow: 0 })));
      }
    }, [isAddDialogOpen, selectedSite?.numPumps]);

    useEffect(() => {
      if (!isAddDialogOpen) {
        setIsSubmittingAdd(false); // Reset submitting state when dialog closes
      }
    }, [isAddDialogOpen]);

    useEffect(() => {
      if (isEditPumpStationOpen && editingPumpStation) {
        setEditReadingDate(editingPumpStation.timestamp ? new Date(editingPumpStation.timestamp) : undefined);
        setEditRecordNumber(editingPumpStation.recordNumber || 0); // Safeguard against undefined
        setEditTimePerHour(editingPumpStation.timePerHour || 0); // Safeguard against undefined
        setEditPumpReadings(editingPumpStation.pumps || []); // Safeguard against undefined
      }
    }, [isEditPumpStationOpen, editingPumpStation]);

    useEffect(() => {
      if (!isEditPumpStationOpen) {
        setIsSubmittingEdit(false); // Reset submitting state when dialog closes
      }
    }, [isEditPumpStationOpen]);

    const handlePumpInputChange = (index: number, field: 'time' | 'flow', value: string) => {
      const newPumpReadings = [...pumpReadings];
      newPumpReadings[index] = { ...newPumpReadings[index], [field]: parseFloat(value) || 0 };
      setPumpReadings(newPumpReadings);
    };

    const handleEditPumpInputChange = (index: number, field: 'time' | 'flow', value: string) => {
      const newEditPumpReadings = [...editPumpReadings];
      newEditPumpReadings[index] = { ...newEditPumpReadings[index], [field]: parseFloat(value) || 0 };
      setEditPumpReadings(newEditPumpReadings);
    };

    const handleAddReading = async () => {
      if (!selectedSiteId || !readingDate || !timePerHour) {
        // You might want to show a toast error here
        return;
      }

      setIsSubmittingAdd(true); // Set submitting state to true
      const dateTime = new Date(readingDate);
      dateTime.setHours(Number(timePerHour), 0, 0, 0); // Use timePerHour for hours

      const formattedTimestamp = dateTime.toISOString(); // Use toISOString() directly

      const totalUptime = pumpReadings.reduce((sum, pump) => sum + pump.time, 0);
      const totalFlow = pumpReadings.reduce((sum, pump) => sum + pump.flow, 0);

      // Initialize all pump data fields up to p10_Flow with 0
      const pumpData: { [key: string]: number } = {};
      for (let i = 1; i <= 10; i++) {
        pumpData[`p${i}_Time`] = 0;
        pumpData[`p${i}_Flow`] = 0;
      }

      // Overwrite with actual pumpReadings data
      pumpReadings.forEach((pump, index) => {
        if (index < 10) { // Ensure we don't go beyond p10
          pumpData[`p${index + 1}_Time`] = pump.time;
          pumpData[`p${index + 1}_Flow`] = pump.flow;
        }
      });

      const requestBody: CreatePumpStationReadingRequest = {
        siteId: Number(selectedSiteId),
        timestamp: formattedTimestamp,
        timePerHour: Number(timePerHour), // Map timePerHour directly
        recordNumber: Number(recordNumber || 0),
        ...pumpData as {
          p1_Time: number; p1_Flow: number; p2_Time: number; p2_Flow: number; 
          p3_Time: number; p3_Flow: number; p4_Time: number; p4_Flow: number; 
          p5_Time: number; p5_Flow: number; p6_Time: number; p6_Flow: number; 
          p7_Time: number; p7_Flow: number; p8_Time: number; p8_Flow: number; 
          p9_Time: number; p9_Flow: number; p10_Time: number; p10_Flow: number;
        },
        totalUptime,
        totalFlow,
        isManual: true,
      };

      try {
        await createPumpStationReading(requestBody);
        setIsAddDialogOpen(false);
        // Optionally refetch readings
        fetchPumpStationReadings(Number(selectedSiteId), startDate ? formatDateTimeForAPI(startDate) : undefined, endDate ? formatDateTimeForAPI(endDate, true) : undefined);
      } catch (error) {
        console.error("Failed to create pump station reading:", error);
      } finally {
        setIsSubmittingAdd(false); // Ensure this is correctly set
      }
    };

    const handleSaveEditPumpStation = async () => {
      if (!editingPumpStation || !editReadingDate) {
        return;
      }

      const siteId = Number(editingPumpStation.siteId); // Site cannot be changed for existing readings
      if (!siteId || Number.isNaN(siteId)) {
        return;
      }

      const dateTime = new Date(editReadingDate);
      dateTime.setHours(Number(editTimePerHour), 0, 0, 0);

      const totalUptime = editPumpReadings.reduce((sum, pump) => sum + pump.time, 0);
      const totalFlow = editPumpReadings.reduce((sum, pump) => sum + pump.flow, 0);

      // Initialize all pump data fields up to p10_Flow with 0
      const pumpData: { [key: string]: number } = {};
      for (let i = 1; i <= 10; i++) {
        pumpData[`p${i}_Time`] = 0;
        pumpData[`p${i}_Flow`] = 0;
      }

      // Overwrite with actual editPumpReadings data
      editPumpReadings.forEach((pump, index) => {
        if (index < 10) { // Ensure we don't go beyond p10
          pumpData[`p${index + 1}_Time`] = pump.time;
          pumpData[`p${index + 1}_Flow`] = pump.flow;
        }
      });

      setIsSubmittingEdit(true); // Set submitting state to true
      try {
        await updatePumpStationReading({
          id: editingPumpStation.id,
          siteId: siteId,
          timestamp: formatDateTimeForAPI(dateTime),
          timePerHour: Number(editTimePerHour) || 0,
          recordNumber: Number(editRecordNumber) || 0,
          ...pumpData as {
            p1_Time: number; p1_Flow: number; p2_Time: number; p2_Flow: number; 
            p3_Time: number; p3_Flow: number; p4_Time: number; p4_Flow: number; 
            p5_Time: number; p5_Flow: number; p6_Time: number; p6_Flow: number; 
            p7_Time: number; p7_Flow: number; p8_Time: number; p8_Flow: number; 
            p9_Time: number; p9_Flow: number; p10_Time: number; p10_Flow: number;
          },
          totalUptime,
          totalFlow,
          isManual: editingPumpStation.isManual ?? true,
        });

        setEditingPumpStation(null);
        setIsEditPumpStationOpen(false);
        // Optionally refetch readings
        fetchPumpStationReadings(Number(selectedSiteId), startDate ? formatDateTimeForAPI(startDate) : undefined, endDate ? formatDateTimeForAPI(endDate, true) : undefined);
      } catch (error) {
        console.error("Failed to update pump station reading:", error);
      } finally {
        setIsSubmittingEdit(false); // Reset submitting state to false
      }
    };

    // Handlers
    const handleViewDetailsClick = (reading: PumpStationReading) => {
      setSelectedReading(reading);
      setIsPumpDetailsOpen(true);
    };

    const getAlarmColor = (reading: PumpStationReading, fieldName: string) => {
      const relevantAlarms = reading.alarms?.filter(alarm => alarm.fieldName === fieldName);
      if (!relevantAlarms || relevantAlarms.length === 0) return undefined;

      // Prioritize red alarms
      const hasRedAlarm = relevantAlarms.some(alarm => getColorCategory(alarm.colorCode) === 'red');
      if (hasRedAlarm) return relevantAlarms.find(alarm => getColorCategory(alarm.colorCode) === 'red')?.colorCode;

      // Then consider yellow alarms
      const hasYellowAlarm = relevantAlarms.some(alarm => getColorCategory(alarm.colorCode) === 'yellow');
      if (hasYellowAlarm) return relevantAlarms.find(alarm => getColorCategory(alarm.colorCode) === 'yellow')?.colorCode;

      return undefined;
    };
    
    // Determine number of pumps based on first reading's pumps array or site configuration
    const firstReading = readings.length > 0 ? readings[0] : null;
    const totalPumps = firstReading?.pumps?.length || selectedSite?.numPumps || 0;
    
    // Calculate total column count for colSpan (site, timestamp, US, DS1, DS2, pumps*2, totalUptime, totalFlow, actions)
    let totalColumns = 2; // Site and Timestamp
    if (selectedSite?.hasUS) totalColumns += 1;
    if (selectedSite?.hasDS1) totalColumns += 1;
    if (selectedSite?.hasDS2) totalColumns += 1;
    totalColumns += (totalPumps * 2) + 3; // Pumps (time + flow), totalUptime, totalFlow, actions
    
    console.log('PumpStationTable - Rendering with:', {
      selectedSite,
      shouldShowUSLevel,
      shouldShowDS1Level,
      shouldShowDS2Level,
      numberOfPumps,
      isAddDialogOpen,
    });

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
              <div key={selectedSiteId} className="space-y-4 py-4">
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
                        {sites.map(site => (
                          <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>
                        ))}
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
                {/* Removed USWL, DSWL, Battery, Record Number, Time Per Hour fields as per user request */}
                {/* {shouldShowUSLevel && (
                  <div className="space-y-2">
                    <Label>المستوى العلوي (US)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={usLevel === '' ? '' : usLevel}
                      onChange={(e) => setUsLevel(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    />
                  </div>
                )} */}
                {/* {shouldShowDS1Level && (
                  <div className="space-y-2">
                    <Label>المستوى السفلي 1 (DS1)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={ds1Level === '' ? '' : ds1Level}
                      onChange={(e) => setDs1Level(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    />
                  </div>
                )} */}
                {/* {shouldShowDS2Level && (
                  <div className="space-y-2">
                    <Label>المستوى السفلي 2 (DS2)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={ds2Level === '' ? '' : ds2Level}
                      onChange={(e) => setDs2Level(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    />
                  </div>
                )} */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>رقم السجل</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={recordNumber}
                      onChange={(e) => setRecordNumber(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الساعة</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={timePerHour}
                      onChange={(e) => setTimePerHour(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {numberOfPumps > 0 && Array.from({ length: numberOfPumps }).map((_, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>مضخة {index + 1} وقت التشغيل (ساعة)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={pumpReadings[index]?.time === undefined ? '' : pumpReadings[index].time}
                        onChange={(e) => handlePumpInputChange(index, 'time', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>مضخة {index + 1} التدفق (م³/س)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={pumpReadings[index]?.flow === undefined ? '' : pumpReadings[index].flow}
                        onChange={(e) => handlePumpInputChange(index, 'flow', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddReading} disabled={isSubmittingAdd || !readingDate || !timePerHour} loadingText="جاري الحفظ..." isLoading={isSubmittingAdd}>
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
                    <Select dir="rtl" value={editingPumpStation?.siteId?.toString() || ""} onValueChange={(value) => {
                      if (editingPumpStation) {
                        setEditingPumpStation(prev => prev ? { ...prev, siteId: Number(value) } : null);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الموقع" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites.map(site => (
                          <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>
                        ))}
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>رقم السجل</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={editRecordNumber.toString()}
                      onChange={(e) => setEditRecordNumber(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الساعة  </Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={editTimePerHour.toString()}
                      onChange={(e) => setEditTimePerHour(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                
               

                {numberOfPumps > 0 && Array.from({ length: numberOfPumps }).map((_, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>مضخة {index + 1} وقت التشغيل (ساعة)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={editPumpReadings[index]?.time?.toString() || ''}
                        onChange={(e) => handleEditPumpInputChange(index, 'time', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>مضخة {index + 1} التدفق (م³/س)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={editPumpReadings[index]?.flow?.toString() || ''}
                        onChange={(e) => handleEditPumpInputChange(index, 'flow', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditPumpStationOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleSaveEditPumpStation} disabled={isSubmittingEdit || !editingPumpStation || !editReadingDate} loadingText="جاري الحفظ..." isLoading={isSubmittingEdit}>
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
          <Table  className="" dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الموقع</TableHead>
                <TableHead className="text-right">التاريخ والوقت</TableHead>
                {/* Removed US, DS1, DS2 table headers */}
                {/* {selectedSite?.hasUS && <TableHead className="text-right">المستوى العلوي (US)</TableHead>} */}
                {/* {selectedSite?.hasDS1 && <TableHead className="text-right">المستوى السفلي 1 (DS1)</TableHead>} */}
                {/* {selectedSite?.hasDS2 && <TableHead className="text-right">المستوى السفلي 2 (DS2)</TableHead>} */}
                {/* {totalPumps > 0 && Array.from({ length: totalPumps }).map((_, i) => (
                  <React.Fragment key={i}>
                    <TableHead className="text-right">مضخة {i + 1} وقت التشغيل</TableHead>
                    <TableHead className="text-right">مضخة {i + 1} التدفق</TableHead>
                  </React.Fragment>
                ))} */}
                <TableHead className="text-right">إجمالي وقت التشغيل</TableHead>
                <TableHead className="text-right">إجمالي التدفق</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={totalColumns} className="text-center py-6 text-gray-500">
                    جاري تحميل البيانات...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && error && (
                <TableRow>
                  <TableCell colSpan={totalColumns} className="text-center py-6 text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !error && readings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={totalColumns} className="text-center py-6 text-gray-500">
                    لا توجد قراءات لعرضها
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !error && readings.map((reading) => {
                return (
                <TableRow key={reading.id}>
                  <TableCell className="text-right font-medium">{reading.site}</TableCell>
                  <TableCell className="text-right">{reading.timestamp}</TableCell>
                  {/* Removed US, DS1, DS2 table cells */}
                  {/* {selectedSite?.hasUS && <TableCell className="text-right">{reading.usLevel?.toFixed(1) || 'N/A'}</TableCell>} */}
                  {/* {selectedSite?.hasDS1 && <TableCell className="text-right">{reading.ds1Level?.toFixed(1) || 'N/A'}</TableCell>} */}
                  {/* {selectedSite?.hasDS2 && <TableCell className="text-right">{reading.ds2Level?.toFixed(1) || 'N/A'}</TableCell>} */}
                  {/* {totalPumps > 0 && Array.from({ length: totalPumps }).map((_, i) => {
                    const pump = reading.pumps?.[i];
                    return (
                      <React.Fragment key={i}>
                        <TableCell className="text-right">{pump?.time?.toFixed(1) || 'N/A'} ساعة</TableCell>
                        <TableCell className="text-right">{pump?.flow?.toFixed(1) || 'N/A'} م³/س</TableCell>
                      </React.Fragment>
                    );
                  })} */}
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
                        onClick={() => handleViewDetailsClick(reading)}
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
      {/* Pump Details Dialog */}
      <Dialog open={isPumpDetailsOpen} onOpenChange={setIsPumpDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">تفاصيل قراءات المرفعات</DialogTitle>
            <DialogDescription className="text-right">
              {selectedReading?.site} - {selectedReading?.timestamp}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم المرفعة</TableHead>
                  <TableHead className="text-right">وقت التشغيل (ساعة)</TableHead>
                  <TableHead className="text-right">التدفق (م³/س)</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedReading?.pumps.map((pump, index) => {
                  const pumpTimeColor = getAlarmColor(selectedReading, `P${index + 1}_Time`);
                  const pumpFlowColor = getAlarmColor(selectedReading, `P${index + 1}_Flow`);
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>مرفعة {index + 1}</TableCell>
                      <TableCell style={{ color: pumpTimeColor }}>{pump.time.toFixed(1)}</TableCell>
                      <TableCell style={{ color: pumpFlowColor }}>{pump.flow.toFixed(1)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditPump(index, selectedReading as PumpStationReading)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
    </Card>
  );
}
