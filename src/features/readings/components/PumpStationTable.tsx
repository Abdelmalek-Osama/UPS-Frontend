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
    const [pumpReadings, setPumpReadings] = useState<{ time: number | null; flow: number | null }[]>([]);
    const [readingDateTime, setReadingDateTime] = useState<Date | undefined>();
    const [readingDate, setReadingDate] = useState<Date | undefined>();
    const [recordNumber, setRecordNumber] = useState<number>(0);
    const [timePerHour, setTimePerHour] = useState<number | undefined>(undefined);

    const [editActivePumpsCount, setEditActivePumpsCount] = useState<number>(0);
    const [editReadingDate, setEditReadingDate] = useState<Date | undefined>();
    const [editRecordNumber, setEditRecordNumber] = useState<number>(0);
    const [editTimePerHour, setEditTimePerHour] = useState<number | undefined>(undefined);
    const [editPumpReadings, setEditPumpReadings] = useState<{ time: number | null; flow: number | null }[]>([]);
    const [isSubmittingAdd, setIsSubmittingAdd] = useState(false); // New state for add dialog submission
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false); // New state for edit dialog submission

    const [isPumpDetailsOpen, setIsPumpDetailsOpen] = useState(false); // Added local state for pump details dialog
    const [selectedReading, setSelectedReading] = useState<PumpStationReading | null>(null); // Added local state for selected reading
    const [addError, setAddError] = useState<string | null>(null); // New state for add dialog error
    const [editError, setEditError] = useState<string | null>(null); // New state for edit dialog error

    // Extracted values for clearer conditional rendering
    const shouldShowUSLevel = selectedSite?.hasUS ?? false;
    const shouldShowDS1Level = selectedSite?.hasDS1 ?? false;
    const shouldShowDS2Level = selectedSite?.hasDS2 ?? false;
    const numberOfPumps = selectedSite?.numPumps ?? 0;

    useEffect(() => {
      console.log('useEffect (selectedSite?.numPumps) triggered. selectedSite.numPumps:', selectedSite?.numPumps);
      if (selectedSite?.numPumps) {
        setPumpReadings(Array.from({ length: selectedSite.numPumps }, () => ({ time: null, flow: null })));
      } else {
        setPumpReadings([]);
      }
    }, [selectedSite?.numPumps]);

    useEffect(() => {
      if (!isAddDialogOpen) { // Reset form when dialog closes
        setReadingDate(undefined);
        setRecordNumber(0);
        setTimePerHour(undefined);
        setPumpReadings(Array.from({ length: selectedSite?.numPumps || 0 }, () => ({ time: null, flow: null })));
        setAddError(null); // Clear error on dialog close
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
        setEditRecordNumber(editingPumpStation.recordNumber ?? 0); // Use nullish coalescing for safety
        setEditTimePerHour(editingPumpStation.timePerHour === undefined ? undefined : editingPumpStation.timePerHour); // Set to undefined if no time, otherwise use the number
        setEditPumpReadings(editingPumpStation.pumps.map(pump => ({ time: pump.time ?? null, flow: pump.flow ?? null })) || []); // Map to new type
      } else if (!isEditPumpStationOpen) {
        setEditError(null); // Clear error on dialog close
      }
    }, [isEditPumpStationOpen, editingPumpStation]);

    useEffect(() => {
      if (!isEditPumpStationOpen) {
        setIsSubmittingEdit(false); // Reset submitting state when dialog closes
      }
    }, [isEditPumpStationOpen]);

    useEffect(() => {
      if (readingDate !== undefined && timePerHour !== undefined) {
        const now = new Date();
        const isToday = readingDate.toDateString() === now.toDateString();
        if (isToday && timePerHour > now.getHours()) {
          setTimePerHour(undefined); // Reset if selected hour is in the future on the current day
        }
      }
    }, [readingDate, timePerHour]);

    useEffect(() => {
      if (editReadingDate !== undefined && editTimePerHour !== undefined) {
        const now = new Date();
        const isToday = editReadingDate.toDateString() === now.toDateString();
        if (isToday && editTimePerHour > now.getHours()) {
          setEditTimePerHour(undefined); // Reset if selected hour is in the future on the current day
        }
      }
    }, [editReadingDate, editTimePerHour]);

    const formatTimestamp = (value: string) => {
      if (!value) return '--';
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        return value;
      }
      return parsed.toLocaleString('en-GB', { hour12: false });
    };

    const handlePumpInputChange = (index: number, field: 'time' | 'flow', value: string) => {
      const newPumpReadings = [...pumpReadings];
      newPumpReadings[index] = { ...newPumpReadings[index], [field]: value === '' ? null : parseFloat(value) };
      setPumpReadings(newPumpReadings);
    };

    const handleEditPumpInputChange = (index: number, field: 'time' | 'flow', value: string) => {
      const newEditPumpReadings = [...editPumpReadings];
      newEditPumpReadings[index] = { ...newEditPumpReadings[index], [field]: value === '' ? null : parseFloat(value) };
      setEditPumpReadings(newEditPumpReadings);
    };

    const handleAddReading = async () => {
      setAddError(null); // Clear previous errors
      if (!selectedSiteId || !readingDate || timePerHour === undefined) {
        setAddError('الرجاء تعبئة جميع الحقول المطلوبة.');
        return;
      }

      // Validate record number - must be positive and greater than zero
      if (recordNumber <= 0 || Number.isNaN(recordNumber)) {
        setAddError('رقم السجل يجب أن يكون أكبر من صفر.');
        return;
      }

      setIsSubmittingAdd(true); // Set submitting state to true
      const dateTime = new Date(readingDate);
      dateTime.setHours(timePerHour, 0, 0, 0); // Use timePerHour for hours

      const formattedTimestamp = formatDateTimeForAPI(dateTime); // Use toISOString() directly

      const totalUptime = pumpReadings.reduce((sum, pump) => sum + (pump.time ?? 0), 0);
      const totalFlow = pumpReadings.reduce((sum, pump) => sum + (pump.flow ?? 0), 0);

      // Initialize all pump data fields up to numberOfPumps with null
      const pumpData: { [key: string]: number | null } = {};
      for (let i = 1; i <= numberOfPumps; i++) {
        pumpData[`p${i}_Time`] = null;
        pumpData[`p${i}_Flow`] = null;
      }

      // Overwrite with actual pumpReadings data, using null for undefined values
      pumpReadings.forEach((pump, index) => {
        if (index < numberOfPumps) { // Ensure we don't go beyond the actual number of pumps
          pumpData[`p${index + 1}_Time`] = pump.time ?? null;
          pumpData[`p${index + 1}_Flow`] = pump.flow ?? null;
        }
      });

      const requestBody: CreatePumpStationReadingRequest = {
        siteId: Number(selectedSiteId),
        timestamp: formattedTimestamp,
        timePerHour: timePerHour, // Map timePerHour directly
        recordNumber: recordNumber === 0 ? null : recordNumber,
        ...pumpData as {
          p1_Time: number | null; p1_Flow: number | null; p2_Time: number | null; p2_Flow: number | null; 
          p3_Time: number | null; p3_Flow: number | null; p4_Time: number | null; p4_Flow: number | null; 
          p5_Time: number | null; p5_Flow: number | null; p6_Time: number | null; p6_Flow: number | null; 
          p7_Time: number | null; p7_Flow: number | null; p8_Time: number | null; p8_Flow: number | null; 
          p9_Time: number | null; p9_Flow: number | null; p10_Time: number | null; p10_Flow: number | null;
        },
        totalUptime,
        totalFlow,
        isManual: true,
      };

      try {
        await createPumpStationReading(requestBody);
        setIsAddDialogOpen(false);
        // Conditionally refetch readings based on existing date range or current day
        if (startDate && endDate) {
          fetchPumpStationReadings(
            Number(selectedSiteId),
            formatDateTimeForAPI(startDate),
            formatDateTimeForAPI(endDate, true)
          );
        } else {
          const today = new Date();
          const startOfToday = new Date(today.setHours(0, 0, 0, 0));
          const endOfToday = new Date(today.setHours(23, 59, 59, 999));
          fetchPumpStationReadings(
            Number(selectedSiteId),
            formatDateTimeForAPI(startOfToday),
            formatDateTimeForAPI(endOfToday, true)
          );
        }
      } catch (error: any) {
        setAddError(error.message || 'فشل في إضافة قراءة محطة الرفع.');
      } finally {
        setIsSubmittingAdd(false); // Ensure this is correctly set
      }
    };

    const handleSaveEditPumpStation = async () => {
      setEditError(null); // Clear previous errors
      if (!editingPumpStation || !editReadingDate || editTimePerHour === undefined) {
        setEditError('الرجاء تعبئة جميع الحقول المطلوبة.');
        return;
      }

      const siteId = Number(editingPumpStation.siteId); // Site cannot be changed for existing readings
      if (!siteId || Number.isNaN(siteId)) {
        setEditError('الموقع المحدد غير صالح.');
        return;
      }

      // Validate record number - must be positive and greater than zero
      if (editRecordNumber <= 0 || Number.isNaN(editRecordNumber)) {
        setEditError('رقم السجل يجب أن يكون أكبر من صفر.');
        return;
      }

      const dateTime = new Date(editReadingDate);
      dateTime.setHours(editTimePerHour, 0, 0, 0);

      const totalUptime = editPumpReadings.reduce((sum, pump) => sum + (pump.time ?? 0), 0);
      const totalFlow = editPumpReadings.reduce((sum, pump) => sum + (pump.flow ?? 0), 0);

      // Initialize all pump data fields up to numberOfPumps with null
      const pumpData: { [key: string]: number | null } = {};
      for (let i = 1; i <= numberOfPumps; i++) {
        pumpData[`p${i}_Time`] = null;
        pumpData[`p${i}_Flow`] = null;
      }

      // Overwrite with actual editPumpReadings data, using null for undefined values
      editPumpReadings.forEach((pump, index) => {
        if (index < numberOfPumps) { // Ensure we don't go beyond the actual number of pumps
          pumpData[`p${index + 1}_Time`] = pump.time ?? null;
          pumpData[`p${index + 1}_Flow`] = pump.flow ?? null;
        }
      });

      setIsSubmittingEdit(true); // Set submitting state to true
      try {
        await updatePumpStationReading({
          id: editingPumpStation.id,
          siteId: siteId,
          timestamp: formatDateTimeForAPI(dateTime),
          timePerHour: editTimePerHour || 0,
          recordNumber: editRecordNumber === 0 ? null : editRecordNumber,
          ...pumpData as {
            p1_Time: number | null; p1_Flow: number | null; p2_Time: number | null; p2_Flow: number | null; 
            p3_Time: number | null; p3_Flow: number | null; p4_Time: number | null; p4_Flow: number | null; 
            p5_Time: number | null; p5_Flow: number | null; p6_Time: number | null; p6_Flow: number | null; 
            p7_Time: number | null; p7_Flow: number | null; p8_Time: number | null; p8_Flow: number | null; 
            p9_Time: number | null; p9_Flow: number | null; p10_Time: number | null; p10_Flow: number | null;
          },
          totalUptime,
          totalFlow,
          isManual: editingPumpStation.isManual ?? true,
        });

        setEditingPumpStation(null);
        setIsEditPumpStationOpen(false);
        // Optionally refetch readings
        fetchPumpStationReadings(Number(selectedSiteId), startDate ? formatDateTimeForAPI(startDate) : undefined, endDate ? formatDateTimeForAPI(endDate, true) : undefined);
      } catch (error: any) {
        setEditError(error.message || 'فشل في تحديث قراءة محطة الرفع.');
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

    const getAvailableHours = (selectedDate?: Date) => {
      const now = new Date();
      const currentHour = now.getHours();
      const hours = Array.from({ length: 24 }, (_, i) => i);

      if (!selectedDate) {
        return hours; // If no date is selected, all hours are theoretically available for selection
      }

      const isToday = selectedDate.toDateString() === now.toDateString();

      if (isToday) {
        return hours.filter(hour => hour <= currentHour);
      } else if (selectedDate.getTime() > now.getTime()) {
        return []; // Future date, no hours should be selectable
      }

      return hours; // Past date, all hours are available
    };

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
              {addError && (
                <p className="text-red-600 text-right text-sm px-6 -mt-2">{addError}</p>
              )}
              <div key={selectedSiteId} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الموقع</Label>
                    <Select dir="rtl" value={selectedSiteId || ''} disabled>
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
                    maxDate={new Date()} // Disable dates after today
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
                      min="1"
                      placeholder="0"
                      value={recordNumber}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string, but prevent zero and negative values
                        if (value === '') {
                          setRecordNumber(0);
                        } else {
                          const num = parseFloat(value);
                          if (!Number.isNaN(num) && num > 0) {
                            setRecordNumber(num);
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الوقت</Label>
                    <Select
                      dir="rtl"
                      value={timePerHour?.toString().padStart(2, '0') || ''}
                      onValueChange={(value) => setTimePerHour(value === '' ? undefined : parseFloat(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الساعة" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableHours(readingDate).map((hourNum) => {
                          const hour = hourNum.toString().padStart(2, '0');
                          return (
                            <SelectItem key={hour} value={hour}>
                              {`${hour}:00`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
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
                        value={pumpReadings[index]?.time ?? ''}
                        onChange={(e) => handlePumpInputChange(index, 'time', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>مضخة {index + 1} التدفق (م³/س)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={pumpReadings[index]?.flow ?? ''}
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
                <Button onClick={handleAddReading} disabled={isSubmittingAdd || !readingDate || timePerHour === undefined} loadingText="جاري الحفظ..." isLoading={isSubmittingAdd}>
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
              {editError && (
                <p className="text-red-600 text-right text-sm px-6 -mt-2">{editError}</p>
              )}
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الموقع</Label>
                    <Select dir="rtl" value={editingPumpStation?.siteId?.toString() || ""} disabled>
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
                    maxDate={new Date()} // Disable dates after today
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>رقم السجل</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="0"
                      value={editRecordNumber.toString()}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string, but prevent zero and negative values
                        if (value === '') {
                          setEditRecordNumber(0);
                        } else {
                          const num = parseFloat(value);
                          if (!Number.isNaN(num) && num > 0) {
                            setEditRecordNumber(num);
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الوقت</Label>
                    <Select
                      dir="rtl"
                      value={editTimePerHour?.toString().padStart(2, '0') || ''}
                      onValueChange={(value) => setEditTimePerHour(value === '' ? undefined : parseFloat(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الساعة" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableHours(editReadingDate).map((hourNum) => {
                          const hour = hourNum.toString().padStart(2, '0');
                          return (
                            <SelectItem key={hour} value={hour}>
                              {`${hour}:00`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
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
                        value={editPumpReadings[index]?.time ?? ''}
                        onChange={(e) => handleEditPumpInputChange(index, 'time', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>مضخة {index + 1} التدفق (م³/س)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={editPumpReadings[index]?.flow ?? ''}
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
                <Button onClick={handleSaveEditPumpStation} disabled={isSubmittingEdit || !editingPumpStation || !editReadingDate || editTimePerHour === undefined} loadingText="جاري الحفظ..." isLoading={isSubmittingEdit}>
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
                  <TableCell className="text-right">{formatTimestamp(reading.timestamp)}</TableCell>
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
                      <TableCell style={{ color: pumpTimeColor }}>{pump.time ?? 'N/A'}</TableCell>
                      <TableCell style={{ color: pumpFlowColor }}>{pump.flow ?? 'N/A'}</TableCell>
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
