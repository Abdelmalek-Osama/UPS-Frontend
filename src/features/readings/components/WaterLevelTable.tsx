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
import { Edit, Download, Plus } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { DatePicker } from '../../../components/ui/datepicker';
import type { SiteLookupOption, WaterLevelReading } from '../types';
import { getColorCategory, formatDateTimeForAPI } from '../utils/utils';

interface SiteConfiguration {
  id: number;
  code: string;
  name: string;
  siteType: string;
  canal: string;
  longitude: number;
  latitude: number;
  directorateName: string;
  hasUS: boolean;
  hasDS1: boolean;
  hasDS2: boolean;
  numPumps: number;
}

interface WaterLevelTableProps {
  readings: WaterLevelReading[];
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sites: SiteLookupOption[];
  handleExport: () => void;
  isEditWaterLevelOpen: boolean;
  setIsEditWaterLevelOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingWaterLevel: WaterLevelReading | null;
  handleEditWaterLevel: (reading: WaterLevelReading) => void;
  isLoading: boolean;
  error?: string | null;
  createWaterLevelReading: (data: {
    siteId: number;
    timestamp: string;
    timePerHour: number;
    recordNumber: number;
    uswl: number;
    dswL1: number;
    dswL2: number;
    battery: number;
    isManual: boolean;
  }) => Promise<any>;
  updateWaterLevelReading: (data: {
    id: number;
    siteId: number;
    timestamp: string;
    timePerHour: number;
    recordNumber: number;
    uswl: number;
    dswL1: number;
    dswL2: number;
    battery: number;
    isManual: boolean;
  }) => Promise<any>;
  selectedSiteId: string;
  fetchWaterLevelReadings: (siteId: number, startDate?: string, endDate?: string) => Promise<void>;
  fromDate?: Date;
  toDate?: Date;
}

export function WaterLevelTable({
  readings,
  isAddDialogOpen,
  setIsAddDialogOpen,
  sites,
  handleExport,
  isEditWaterLevelOpen,
  setIsEditWaterLevelOpen,
  editingWaterLevel,
  handleEditWaterLevel,
  isLoading,
  error,
  createWaterLevelReading,
  updateWaterLevelReading,
  selectedSiteId,
  fetchWaterLevelReadings,
  fromDate,
  toDate,
}: WaterLevelTableProps) {
  const [readingDate, setReadingDate] = useState<Date | undefined>();
  const [readingTime, setReadingTime] = useState<string>('');
  const [uswl, setUswl] = useState<string>('');
  const [dswl, setDswl] = useState<string>('');
  const [dswl2, setDswl2] = useState<string>('');
  const [battery, setBattery] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSiteForAdd, setSelectedSiteForAdd] = useState<string>('');
  const [selectedSiteData, setSelectedSiteData] = useState<SiteConfiguration | null>(null);
  const [editReadingDate, setEditReadingDate] = useState<Date | undefined>();
  const [editReadingTime, setEditReadingTime] = useState<string>('');
  const [editSelectedSiteId, setEditSelectedSiteId] = useState<string>('');
  const [editUswl, setEditUswl] = useState<string>('');
  const [editDswl, setEditDswl] = useState<string>('');
  const [editDswl2, setEditDswl2] = useState<string>('');
  const [editBattery, setEditBattery] = useState<string>('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSiteId) {
      setSelectedSiteForAdd(selectedSiteId);
    } else if (sites.length > 0 && !selectedSiteForAdd) {
      setSelectedSiteForAdd(String(sites[0].id));
    }
  }, [sites, selectedSiteForAdd, selectedSiteId]);

  useEffect(() => {
    const fetchSiteData = async () => {
      if (selectedSiteForAdd) {
        try {
          const response = await fetch(`https://localhost:7123/api/v1/Sites/${selectedSiteForAdd}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setSelectedSiteData(data.data);
        } catch (error) {
          console.error("Failed to fetch site data:", error);
          setSelectedSiteData(null);
        }
      }
    };
    fetchSiteData();
  }, [selectedSiteForAdd, sites]);

  useEffect(() => {
    if (!isAddDialogOpen) {
      // Reset form and errors when dialog closes
      setReadingDate(undefined);
      setReadingTime('');
      setUswl('');
      setDswl('');
      setDswl2('');
      setBattery('');
      setAddError(null); // Clear error on dialog close
    }
  }, [isAddDialogOpen]);

  useEffect(() => {
    if (isEditWaterLevelOpen && editingWaterLevel) {
      const siteFromReading =
        editingWaterLevel.siteId
          ? String(editingWaterLevel.siteId)
          : (sites.find(site => site.name === editingWaterLevel.site)?.id?.toString() ?? '');
      setEditSelectedSiteId(siteFromReading);

      const timestampDate = editingWaterLevel.timestamp ? new Date(editingWaterLevel.timestamp) : undefined;
      setEditReadingDate(timestampDate);
      setEditReadingTime(
        timestampDate ? `${timestampDate.getHours().toString().padStart(2, '0')}:00` : ''
      );
      setEditUswl(editingWaterLevel.uswl?.toString() ?? '');
      setEditDswl(editingWaterLevel.dswL1?.toString() ?? '');
      setEditDswl2(editingWaterLevel.dswL2?.toString() ?? '');
      setEditBattery(editingWaterLevel.battery?.toString() ?? '');
    } else if (!isEditWaterLevelOpen) {
      setEditError(null); // Clear error on dialog close
    }
  }, [isEditWaterLevelOpen, editingWaterLevel, sites]);

  useEffect(() => {
    if (!isEditWaterLevelOpen) {
      setIsSubmittingEdit(false);
    }
  }, [isEditWaterLevelOpen]);

  const formatTimestamp = (value: string) => {
    if (!value) return '--';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleString('en-GB', { hour12: false });
  };

  const formatDate = (date?: Date) => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleAddReading = async () => {
    setAddError(null); // Clear previous errors
    if (!readingDate || !readingTime || !selectedSiteForAdd) {
      setAddError('الرجاء تعبئة جميع الحقول المطلوبة.');
      return;
    }

    const siteId = Number(selectedSiteForAdd);
    if (Number.isNaN(siteId)) {
      setAddError('الموقع المحدد غير صالح.');
      return;
    }

    // Validate battery voltage - must be positive and greater than zero
    if (battery !== '' && (Number(battery) <= 0 || Number.isNaN(Number(battery)))) {
      setAddError('قيمة البطارية يجب أن تكون أكبر من صفر.');
      return;
    }

    // Combine date and time into ISO timestamp
    const [hours] = readingTime.split(':');
    const dateTime = new Date(readingDate);
    dateTime.setHours(Number(hours), 0, 0, 0);

    setIsSubmitting(true);
    try {
      await createWaterLevelReading({
        siteId,
        timestamp: formatDateTimeForAPI(dateTime),
        timePerHour: 0,
        recordNumber: 0,
        uswl: uswl === '' ? 0 : Number(uswl),
        dswL1: dswl === '' ? 0 : Number(dswl),
        dswL2: dswl2 === '' ? 0 : Number(dswl2),
        battery: battery === '' ? 0 : Number(battery),
        isManual: true,
      });

      // Reset form
      setReadingDate(undefined);
      setReadingTime('');
      setUswl('');
      setDswl('');
      setDswl2('');
      setBattery('');
      setIsAddDialogOpen(false);

      // Refresh readings
      const siteNumericId = Number(selectedSiteId);
      if (!Number.isNaN(siteNumericId)) {
        await fetchWaterLevelReadings(siteNumericId, formatDate(fromDate), formatDate(toDate));
      }
    } catch (error: any) {
      setAddError(error.message || 'فشل في إضافة القراءة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReading = async () => {
    setEditError(null); // Clear previous errors
    if (!editingWaterLevel || !editReadingDate || !editReadingTime) {
      setEditError('الرجاء تعبئة جميع الحقول المطلوبة.');
      return;
    }

    const siteId = Number(editSelectedSiteId || editingWaterLevel.siteId);
    if (!siteId || Number.isNaN(siteId)) {
      setEditError('الموقع المحدد غير صالح.');
      return;
    }

    // Validate battery voltage - must be positive and greater than zero
    if (editBattery !== '' && (Number(editBattery) <= 0 || Number.isNaN(Number(editBattery)))) {
      setEditError('قيمة البطارية يجب أن تكون أكبر من صفر.');
      return;
    }

    const [hours] = editReadingTime.split(':');
    const dateTime = new Date(editReadingDate);
    dateTime.setHours(Number(hours), 0, 0, 0);

    setIsSubmittingEdit(true);
    try {
      await updateWaterLevelReading({
        id: editingWaterLevel.id,
        siteId,
        timestamp: formatDateTimeForAPI(dateTime),
        timePerHour: 0,
        recordNumber: editingWaterLevel.recordNumber ?? 0,
        uswl: editUswl === '' ? 0 : Number(editUswl),
        dswL1: editDswl === '' ? 0 : Number(editDswl),
        dswL2: editDswl2 === '' ? 0 : Number(editDswl2),
        battery: editBattery === '' ? 0 : Number(editBattery),
        isManual: editingWaterLevel.isManual ?? true,
      });

      setIsEditWaterLevelOpen(false);

      const siteNumericId = Number(selectedSiteId);
      if (!Number.isNaN(siteNumericId)) {
        await fetchWaterLevelReadings(siteNumericId, formatDate(fromDate), formatDate(toDate));
      }
    } catch (error: any) {
      setEditError(error.message || 'فشل في تحديث القراءة.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Determine column visibility based on siteConfiguration
  const firstReading = readings.length > 0 ? readings[0] : null;
  const showUSWL = firstReading?.siteConfiguration?.hasUS ?? true;
  const showDSWL1 = firstReading?.siteConfiguration?.hasDS1 ?? true;
  const showDSWL2 = firstReading?.siteConfiguration?.hasDS2 ?? false;

  // Calculate total column count for colSpan
  const totalColumns = 5 + (showUSWL ? 1 : 0) + (showDSWL1 ? 1 : 0) + (showDSWL2 ? 1 : 0);

  const getAlarmColor = (reading: WaterLevelReading, fieldName: string) => {
    const relevantAlarms = reading.alarms?.filter(alarm => alarm.fieldName === fieldName);
    if (!relevantAlarms || relevantAlarms.length === 0) return undefined;

    const hasRedAlarm = relevantAlarms.some(alarm => getColorCategory(alarm.colorCode) === 'red');
    if (hasRedAlarm) return relevantAlarms.find(alarm => getColorCategory(alarm.colorCode) === 'red')?.colorCode;

    const hasYellowAlarm = relevantAlarms.some(alarm => getColorCategory(alarm.colorCode) === 'yellow');
    if (hasYellowAlarm) return relevantAlarms.find(alarm => getColorCategory(alarm.colorCode) === 'yellow')?.colorCode;

    return undefined;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>قراءات القناطر ({readings.length})</CardTitle>
          <div className="flex gap-2 justify-end">

            <Button variant="outline" onClick={handleExport}>
              <Download className="ml-2 h-4 w-4" />
              تصدير
            </Button>

            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              setIsSubmitting(false); // Unconditionally reset submitting state when dialog opens or closes
            }}>
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
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الموقع</Label>
                      <Select dir="rtl" value={selectedSiteForAdd} onValueChange={setSelectedSiteForAdd}>
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
                        onChange={setReadingDate}
                        maxDate={new Date()} // Disable dates after today
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
                    {selectedSiteData?.hasUS && (
                      <div className="space-y-2">
                        <Label>USWL (متر)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="125.4"
                          value={uswl}
                          onChange={(e) => setUswl(e.target.value)}
                        />
                      </div>
                    )}
                    {(selectedSiteData?.hasDS1) && (
                      <div className="space-y-2">
                        <Label>DSWL1 (متر)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="122.1"
                          value={dswl}
                          onChange={(e) => setDswl(e.target.value)}
                        />
                      </div>
                    )}
                    {(selectedSiteData?.hasDS2) && (
                      <div className="space-y-2">
                        <Label>DSWL2 (متر)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="122.1"
                          value={dswl2}
                          onChange={(e) => setDswl2(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>البطارية (فولت)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="12.8"
                      value={battery}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string, but prevent negative values and zero
                        if (value === '' || (Number(value) > 0 && !Number.isNaN(Number(value)))) {
                          setBattery(value);
                        }
                      }}
                    />
                  </div>

                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                    إلغاء
                  </Button>
                  <Button onClick={handleAddReading}
                    disabled={
                      isSubmitting ||
                      !readingDate ||
                      !readingTime ||
                      !selectedSiteForAdd ||
                      (selectedSiteData?.hasUS && uswl === '') ||
                      (selectedSiteData?.hasDS1 && dswl === '') ||
                      (selectedSiteData?.hasDS2 && dswl2 === '') ||
                      battery === ''
                    }
                    loadingText="جاري الحفظ..."
                    isLoading={isSubmitting}>
                    حفظ القراءة
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditWaterLevelOpen} onOpenChange={setIsEditWaterLevelOpen}>
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
                      <Select dir="rtl" value={editSelectedSiteId} onValueChange={setEditSelectedSiteId}>
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
                        onChange={setEditReadingDate}
                        maxDate={new Date()} // Disable dates after today
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
                    {selectedSiteData?.hasUS && (
                      <div className="space-y-2">
                        <Label>USWL (متر)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="125.4"
                          value={editUswl}
                          onChange={(e) => setEditUswl(e.target.value)}
                        />
                      </div>
                    )}
                    {(selectedSiteData?.hasDS1) && (
                      <div className="space-y-2">
                        <Label>DSWL1 (متر)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="122.1"
                          value={editDswl}
                          onChange={(e) => setEditDswl(e.target.value)}
                        />
                      </div>
                    )}
                    {(selectedSiteData?.hasDS2) && (
                      <div className="space-y-2">
                        <Label>DSWL2 (متر)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="122.1"
                          value={editDswl2}
                          onChange={(e) => setEditDswl2(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>البطارية (فولت)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="12.8"
                      value={editBattery}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow empty string, but prevent negative values and zero
                        if (value === '' || (Number(value) > 0 && !Number.isNaN(Number(value)))) {
                          setEditBattery(value);
                        }
                      }}
                    />
                  </div>

                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditWaterLevelOpen(false)} disabled={isSubmittingEdit}>
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleUpdateReading}
                    disabled={
                      isSubmittingEdit ||
                      !editingWaterLevel ||
                      !editReadingDate ||
                      !editReadingTime ||
                      !editSelectedSiteId ||
                      (selectedSiteData?.hasUS && editUswl === '') ||
                      (selectedSiteData?.hasDS1 && editDswl === '') ||
                      (selectedSiteData?.hasDS2 && editDswl2 === '') ||
                      editBattery === ''
                    }
                    loadingText="جاري الحفظ..."
                    isLoading={isSubmittingEdit}
                  >
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
                {showUSWL && <TableHead className="text-right">USWL (م)</TableHead>}
                {showDSWL1 && <TableHead className="text-right">DSWL1 (م)</TableHead>}
                {showDSWL2 && <TableHead className="text-right">DSWL2 (م)</TableHead>}
                <TableHead className="text-right">البطارية (V)</TableHead>
                <TableHead className="text-right">التدفق المحسوب</TableHead>
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

              {!isLoading && !error && readings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell className="text-right font-medium">{reading.site}</TableCell>
                  <TableCell className="text-right">{formatTimestamp(reading.timestamp)}</TableCell>
                  {showUSWL && (
                    <TableCell className="text-right" style={{ color: getAlarmColor(reading, 'USWL') }}>{reading.uswl?.toFixed(2) ?? ''}</TableCell>
                  )}
                  {showDSWL1 && (
                    <TableCell className="text-right" style={{ color: getAlarmColor(reading, 'DSWL1') }}>{reading.dswL1?.toFixed(2)}</TableCell>
                  )}
                  {showDSWL2 && (
                    <TableCell className="text-right" style={{ color: getAlarmColor(reading, 'DSWL2') }}>{reading.dswL2?.toFixed(2)}</TableCell>
                  )}
                  <TableCell className="text-right" style={{ color: getAlarmColor(reading, 'Battery') }}>
                    {reading.battery?.toFixed(2) ?? ''}
                  </TableCell>
                  <TableCell className="text-right" style={{ color: getAlarmColor(reading, 'CalculatedFlow') }}>
                    <div className="flex items-center justify-start gap-2">
                      <span>{reading.calculatedFlow.toFixed(2)} م³/س</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditWaterLevel(reading)}
                      >
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
  );
}
