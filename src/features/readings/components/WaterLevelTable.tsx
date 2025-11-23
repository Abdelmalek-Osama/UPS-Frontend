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
import { getColorCategory } from '../utils/utils';

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
    const [battery, setBattery] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedSiteForAdd, setSelectedSiteForAdd] = useState<string>('');
    const [editReadingDate, setEditReadingDate] = useState<Date | undefined>();
    const [editReadingTime, setEditReadingTime] = useState<string>('');
    const [editSelectedSiteId, setEditSelectedSiteId] = useState<string>('');
    const [editUswl, setEditUswl] = useState<string>('');
    const [editDswl, setEditDswl] = useState<string>('');
    const [editBattery, setEditBattery] = useState<string>('');
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

    useEffect(() => {
      if (selectedSiteId) {
        setSelectedSiteForAdd(selectedSiteId);
      } else if (sites.length > 0 && !selectedSiteForAdd) {
        setSelectedSiteForAdd(String(sites[0].id));
      }
    }, [sites, selectedSiteForAdd, selectedSiteId]);

    useEffect(() => {
      if (!isAddDialogOpen) {
        // Reset form when dialog closes
        setReadingDate(undefined);
        setReadingTime('');
        setUswl('');
        setDswl('');
        setBattery('');
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
        setEditDswl(editingWaterLevel.dswl?.toString() ?? '');
        setEditBattery(editingWaterLevel.battery?.toString() ?? '');
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
      if (!readingDate || !readingTime || !selectedSiteForAdd) {
        return;
      }

      const siteId = Number(selectedSiteForAdd);
      if (Number.isNaN(siteId)) {
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
          timestamp: dateTime.toISOString(),
          timePerHour: 0,
          recordNumber: 0,
          uswl: Number(uswl) || 0,
          dswL1: Number(dswl) || 0,
          dswL2: 0,
          battery: Number(battery) || 0,
          isManual: true,
        });

        // Reset form
        setReadingDate(undefined);
        setReadingTime('');
        setUswl('');
        setDswl('');
        setBattery('');
        setIsAddDialogOpen(false);

        // Refresh readings
        const siteNumericId = Number(selectedSiteId);
        if (!Number.isNaN(siteNumericId)) {
          await fetchWaterLevelReadings(siteNumericId, formatDate(fromDate), formatDate(toDate));
        }
      } catch (error) {
        // Error is already handled in createWaterLevelReading
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleUpdateReading = async () => {
      if (!editingWaterLevel || !editReadingDate || !editReadingTime) {
        return;
      }

      const siteId = Number(editSelectedSiteId || editingWaterLevel.siteId);
      if (!siteId || Number.isNaN(siteId)) {
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
          timestamp: dateTime.toISOString(),
          timePerHour: 0,
          recordNumber: editingWaterLevel.recordNumber ?? 0,
          uswl: Number(editUswl) || 0,
          dswL1: Number(editDswl) || 0,
          dswL2: 0,
          battery: Number(editBattery) || 0,
          isManual: editingWaterLevel.isManual ?? true,
        });

        setIsEditWaterLevelOpen(false);

        const siteNumericId = Number(selectedSiteId);
        if (!Number.isNaN(siteNumericId)) {
          await fetchWaterLevelReadings(siteNumericId, formatDate(fromDate), formatDate(toDate));
        }
      } catch (error) {
        // handled inside update function
      } finally {
        setIsSubmittingEdit(false);
      }
    };

    // Determine column visibility based on siteConfiguration
    const firstReading = readings.length > 0 ? readings[0] : null;
    const showUSWL = firstReading?.siteConfiguration?.hasUS ?? true;
    const showDSWL = firstReading?.siteConfiguration?.hasDS1 ?? true;
    
    // Calculate total column count for colSpan
    const totalColumns = 5 + (showUSWL ? 1 : 0) + (showDSWL ? 1 : 0);

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
                            <Label>USWL (متر)</Label>
                            <Input 
                              type="number" 
                              step="0.1" 
                              placeholder="125.4"
                              value={uswl}
                              onChange={(e) => setUswl(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>DSWL (متر)</Label>
                            <Input 
                              type="number" 
                              step="0.1" 
                              placeholder="122.1"
                              value={dswl}
                              onChange={(e) => setDswl(e.target.value)}
                            />
                        </div>
                        </div>
                        <div className="space-y-2">
                        <Label>البطارية (فولت)</Label>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="12.8"
                          value={battery}
                          onChange={(e) => setBattery(e.target.value)}
                        />
                        </div>
                        <div className="bg-gray-50 border rounded-lg p-4">
                        <Label className="text-sm text-gray-600" >التدفق المحسوب</Label>
                        <p className="text-2xl mt-1">34.5 م³/س</p>
                        <p className="text-xs text-gray-500 mt-1">يتم الحساب تلقائياً بناءً على المعادلة المعرفة للموقع</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                        إلغاء
                        </Button>
                        <Button onClick={handleAddReading} disabled={isSubmitting || !readingDate || !readingTime || !selectedSiteForAdd}>
                        {isSubmitting ? 'جاري الحفظ...' : 'حفظ القراءة'}
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
                            <Label>USWL (متر)</Label>
                            <Input 
                              type="number" 
                              step="0.1" 
                              value={editUswl}
                              onChange={(e) => setEditUswl(e.target.value)}
                              placeholder="125.4" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>DSWL (متر)</Label>
                            <Input 
                              type="number" 
                              step="0.1" 
                              value={editDswl}
                              onChange={(e) => setEditDswl(e.target.value)}
                              placeholder="122.1" 
                            />
                        </div>
                        </div>
                        <div className="space-y-2">
                        <Label>البطارية (فولت)</Label>
                        <Input 
                          type="number" 
                          step="0.1" 
                          value={editBattery}
                          onChange={(e) => setEditBattery(e.target.value)}
                          placeholder="12.8" 
                        />
                        </div>
                        <div className="bg-gray-50 border rounded-lg p-4">
                        <Label className="text-sm text-gray-600" >التدفق المحسوب</Label>
                        <p className="text-2xl mt-1">{editingWaterLevel?.calculatedFlow.toFixed(1) || '0.0'} م³/س</p>
                        <p className="text-xs text-gray-500 mt-1">يتم الحساب تلقائياً بناءً على المعادلة المعرفة للموقع</p>
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
                            !editSelectedSiteId
                          }
                        >
                        {isSubmittingEdit ? 'جاري الحفظ...' : 'حفظ التعديلات'}
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
                {showDSWL && <TableHead className="text-right">DSWL (م)</TableHead>}
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
                    <TableCell className="text-right" style={{ color: getAlarmColor(reading, 'USWL') }}>{reading.uswl.toFixed(2)}</TableCell>
                  )}
                  {showDSWL && (
                    <TableCell className="text-right" style={{ color: getAlarmColor(reading, 'DSWL') }}>{reading.dswl.toFixed(2)}</TableCell>
                  )}
                  <TableCell className="text-right" style={{ color: getAlarmColor(reading, 'Battery') }}>
                    {reading.battery.toFixed(2)}
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
