import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
import { Edit, Download, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { DatePicker } from '../../../components/ui/datepicker';
import type { SiteLookupOption, WaterLevelReading } from '../types';
import { getColorCategory, formatDateTimeForAPI } from '../utils/utils';
import apiService, { ApiResponse } from '../../../shared/utils/apiService';

interface SiteConfiguration {
  id: number;
  code: string;
  name: string;
  siteType: string;
  canal: string;
  longitude: number;
  latitude: number;
  directorateName: string;
  directorateArabicName: string;
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
  deleteWaterLevelReading: (id: number) => Promise<any>;
  selectedSiteId: string;
  fetchWaterLevelReadings: (siteId: number, startDate?: string, endDate?: string, pageNumber?: number, pageSize?: number) => Promise<void>;
  fromDate?: Date;
  toDate?: Date;
  pageNumber: number;
  setPageNumber: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  totalCount: number;
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
  pageNumber,
  setPageNumber,
  pageSize,
  setPageSize,
  totalPages,
  totalCount,
  deleteWaterLevelReading,
}: WaterLevelTableProps) {
  const { t } = useTranslation();
  const [readingDate, setReadingDate] = useState<Date | undefined>();
  const [readingTime, setReadingTime] = useState<string>('');
  const [uswl, setUswl] = useState<string>('');
  const [uswlError, setUswlError] = useState<string | null>(null); // New state for USWL error
  const [dswl, setDswl] = useState<string>('');
  const [dswlError, setDswlError] = useState<string | null>(null); // New state for DSWL1 error
  const [dswl2, setDswl2] = useState<string>('');
  const [dswl2Error, setDswl2Error] = useState<string | null>(null); // New state for DSWL2 error
  const [battery, setBattery] = useState<string>('');
  const [batteryError, setBatteryError] = useState<string | null>(null); // New state for battery error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSiteForAdd, setSelectedSiteForAdd] = useState<string>('');
  const [selectedSiteData, setSelectedSiteData] = useState<SiteConfiguration | null>(null);
  const [editReadingDate, setEditReadingDate] = useState<Date | undefined>();
  const [editReadingTime, setEditReadingTime] = useState<string>('');
  const [editSelectedSiteId, setEditSelectedSiteId] = useState<string>('');
  const [editUswl, setEditUswl] = useState<string>('');
  const [editUswlError, setEditUswlError] = useState<string | null>(null); // New state for edit USWL error
  const [editDswl, setEditDswl] = useState<string>('');
  const [editDswlError, setEditDswlError] = useState<string | null>(null); // New state for edit DSWL1 error
  const [editDswl2, setEditDswl2] = useState<string>('');
  const [editDswl2Error, setEditDswl2Error] = useState<string | null>(null); // New state for edit DSWL2 error
  const [editBattery, setEditBattery] = useState<string>('');
  const [editBatteryError, setEditBatteryError] = useState<string | null>(null); // New state for edit battery error
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [addSiteDataError, setAddSiteDataError] = useState<string | null>(null);
  const [editSiteDataError, setEditSiteDataError] = useState<string | null>(null);
  const prevDialogOpenRef = useRef(false);
  const [editSelectedSiteData, setEditSelectedSiteData] = useState<SiteConfiguration | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState<WaterLevelReading | null>(null);

  // Helper function to get site name based on language
  const getSiteName = useCallback((siteId?: number, fallbackName?: string) => {
    if (!siteId) return fallbackName || '-';
    const site = sites.find(s => s.id === siteId);
    if (!site) return fallbackName || '-';
    return t('_rtl') === 'rtl' ? site.arabicName || '-' : site.name;
  }, [sites, t]);

  // Initialize selectedSiteForAdd only when dialog first opens (not on every render)
  useEffect(() => {
    const wasClosed = !prevDialogOpenRef.current;
    const isNowOpen = isAddDialogOpen;

    if (isNowOpen && wasClosed && !selectedSiteForAdd) {
      // Dialog just opened - initialize with selectedSiteId if available, otherwise first site
      if (selectedSiteId) {
        setSelectedSiteForAdd(selectedSiteId);
      } else if (sites.length > 0) {
        setSelectedSiteForAdd(String(sites[0].id));
      }
    }

    prevDialogOpenRef.current = isAddDialogOpen;
  }, [isAddDialogOpen, selectedSiteId, sites, selectedSiteForAdd]);

  useEffect(() => {
    const fetchSiteData = async () => {
      if (selectedSiteForAdd) {
        try {
          const response = await apiService.get<ApiResponse<SiteConfiguration>>(`/v1/Sites/${selectedSiteForAdd}`);
          setSelectedSiteData(response.data);
          setAddSiteDataError(null);
        } catch (error) {
          console.error("Failed to fetch site data:", error);
          setSelectedSiteData(null);
          setAddSiteDataError((error as Error).message);
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
      setAddSiteDataError(null); // Clear site data error on dialog close
      setUswlError(null);
      setDswlError(null);
      setDswl2Error(null);
      setBatteryError(null);
      // Reset selectedSiteForAdd when dialog closes so it can be initialized fresh next time
      setSelectedSiteForAdd('');
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
      setEditSiteDataError(null); // Clear site data error on dialog close
      setEditUswlError(null);
      setEditDswlError(null);
      setEditDswl2Error(null);
      setEditBatteryError(null);
    }
  }, [isEditWaterLevelOpen, editingWaterLevel, sites]);

  useEffect(() => {
    if (isEditWaterLevelOpen && editingWaterLevel) {
      if (editingWaterLevel.uswl != null && editingWaterLevel.uswl < 0) {
        setEditUswlError(t('readings.valueCannotBeLessThanZero'));
      } else {
        setEditUswlError(null);
      }

      if (editingWaterLevel.dswL1 != null && editingWaterLevel.dswL1 < 0) {
        setEditDswlError(t('readings.valueCannotBeLessThanZero'));
      } else {
        setEditDswlError(null);
      }

      if (editingWaterLevel.dswL2 != null && editingWaterLevel.dswL2 < 0) {
        setEditDswl2Error(t('readings.valueCannotBeLessThanZero'));
      } else {
        setEditDswl2Error(null);
      }

      if (editingWaterLevel.battery != null && editingWaterLevel.battery <= 0) {
        setEditBatteryError(t('readings.batteryMustBeGreaterThanZero'));
      } else {
        setEditBatteryError(null);
      }
    }
  }, [isEditWaterLevelOpen, editingWaterLevel]);

  useEffect(() => {
    const fetchEditSiteData = async () => {
      if (isEditWaterLevelOpen && editSelectedSiteId) {
        try {
          const response = await apiService.get<ApiResponse<SiteConfiguration>>(`/v1/Sites/${editSelectedSiteId}`);
          setEditSelectedSiteData(response.data);
          setEditSiteDataError(null);
        } catch (error) {
          console.error("Failed to fetch edit site data:", error);
          setEditSelectedSiteData(null);
          setEditSiteDataError((error as Error).message);
        }
      } else if (!isEditWaterLevelOpen) {
        setEditSelectedSiteData(null); // Clear data when dialog closes
      }
    };
    fetchEditSiteData();
  }, [isEditWaterLevelOpen, editSelectedSiteId]);

  useEffect(() => {
    if (!isEditWaterLevelOpen) {
      setIsSubmittingEdit(false);
    }
  }, [isEditWaterLevelOpen]);

  const handleDeleteWaterLevel = (reading: WaterLevelReading) => {
    setReadingToDelete(reading);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteWaterLevel = async () => {
    if (readingToDelete) {
      try {
        await deleteWaterLevelReading(readingToDelete.id);
        setIsDeleteDialogOpen(false);
        setReadingToDelete(null);

        // Refresh readings after deletion
        const siteNumericId = Number(selectedSiteId);
        if (!Number.isNaN(siteNumericId)) {
          let apiFromDate = fromDate;
          let apiToDate = toDate;

          const bothUnset = fromDate === undefined && toDate === undefined;
          if (bothUnset) {
            apiFromDate = new Date();
            apiFromDate.setHours(0, 0, 0, 0);
            apiToDate = new Date();
            apiToDate.setHours(23, 59, 59, 999);
          }

          await fetchWaterLevelReadings(
            siteNumericId,
            apiFromDate ? formatDateTimeForAPI(apiFromDate) : undefined,
            apiToDate ? formatDateTimeForAPI(apiToDate, true) : undefined,
            pageNumber,
            pageSize
          );
        }
      } catch (error) {
        console.error("Failed to delete water level reading:", error);
      }
    }
  };

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

  /**
   * Get available hours based on selected date
   * For today's date: filter to only hours up to the current hour
   * For past dates: all 24 hours available
   * For future dates: no hours available (but DatePicker prevents this)
   */
  const getAvailableHours = (selectedDate?: Date) => {
    const now = new Date();
    const currentHour = now.getHours();
    const hours = Array.from({ length: 24 }, (_, i) => i);

    if (!selectedDate) {
      return hours; // If no date selected, theoretically all hours available
    }

    // Compare dates at midnight to avoid timezone issues
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const selectedMidnight = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0);

    if (selectedMidnight.getTime() === todayMidnight.getTime()) {
      // Today: only allow hours up to and including the current hour
      return hours.filter(hour => hour <= currentHour);
    } else if (selectedMidnight.getTime() > todayMidnight.getTime()) {
      // Future date: no hours should be selectable
      return [];
    }

    // Past date: all hours are available
    return hours;
  };

  const handleAddReading = async () => {
    setAddError(null); // Clear previous errors
    if (!readingDate || !readingTime || !selectedSiteForAdd) {
      setAddError(t('readings.fillAllFields'));
      return;
    }

    const siteId = Number(selectedSiteForAdd);
    if (Number.isNaN(siteId)) {
      setAddError(t('readings.invalidSite'));
      return;
    }

    // Validate battery voltage - must be positive and greater than zero
    if (batteryError) {
      setAddError(batteryError); // Use the specific batteryError message
      return;
    }

    // Combine date and time into ISO timestamp
    const [hours] = readingTime.split(':');
    const dateTime = new Date(readingDate);
    dateTime.setHours(Number(hours), 0, 0, 0);

    // Validate that the combined datetime is not in the future
    const now = new Date();
    if (dateTime.getTime() > now.getTime()) {
      setAddError(t('readings.cannotAddFutureReading'));
      return;
    }

    setIsSubmitting(true);
    try {
      await createWaterLevelReading({
        siteId,
        timestamp: formatDateTimeForAPI(dateTime),
        timePerHour: 0,
        // Ensure recordNumber is at least 1 for new readings
        recordNumber: 1,
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
        let apiFromDate = fromDate;
        let apiToDate = toDate;

        // If both dates are unset, default to today's range
        const bothUnset = fromDate === undefined && toDate === undefined;
        if (bothUnset) {
          apiFromDate = new Date();
          apiFromDate.setHours(0, 0, 0, 0);
          apiToDate = new Date();
          apiToDate.setHours(23, 59, 59, 999);
        }

        await fetchWaterLevelReadings(
          siteNumericId,
          apiFromDate ? formatDateTimeForAPI(apiFromDate) : undefined,
          apiToDate ? formatDateTimeForAPI(apiToDate, true) : undefined,
          pageNumber,
          pageSize
        );
      }
    } catch (error: any) {
      setAddError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReading = async () => {
    setEditError(null); // Clear previous errors
    if (!editingWaterLevel || !editReadingDate || !editReadingTime) {
      setEditError(t('readings.fillAllFields'));
      return;
    }

    const siteId = Number(editSelectedSiteId || editingWaterLevel.siteId);
    if (!siteId || Number.isNaN(siteId)) {
      setEditError(t('readings.invalidSite'));
      return;
    }

    // Validate battery voltage - must be positive and greater than zero
    if (editBatteryError) {
      setEditError(editBatteryError); // Use the specific editBatteryError message
      return;
    }

    const [hours] = editReadingTime.split(':');
    const dateTime = new Date(editReadingDate);
    dateTime.setHours(Number(hours), 0, 0, 0);

    // Validate that the combined datetime is not in the future
    const now = new Date();
    if (dateTime.getTime() > now.getTime()) {
      setEditError(t('readings.cannotAddFutureReading'));
      return;
    }

    setIsSubmittingEdit(true);
    try {
      await updateWaterLevelReading({
        id: editingWaterLevel.id,
        siteId,
        timestamp: formatDateTimeForAPI(dateTime),
        timePerHour: 0,
        // Ensure recordNumber is at least 1 when updating
        recordNumber: Math.max(1, editingWaterLevel.recordNumber ?? 1),
        uswl: editUswl === '' ? 0 : Number(editUswl),
        dswL1: editDswl === '' ? 0 : Number(editDswl),
        dswL2: editDswl2 === '' ? 0 : Number(editDswl2),
        battery: editBattery === '' ? 0 : Number(editBattery),
        isManual: editingWaterLevel.isManual ?? true,
      });

      setIsEditWaterLevelOpen(false);

      const siteNumericId = Number(selectedSiteId);
      if (!Number.isNaN(siteNumericId)) {
        let apiFromDate = fromDate;
        let apiToDate = toDate;

        // If both dates are unset, default to today's range
        const bothUnset = fromDate === undefined && toDate === undefined;
        if (bothUnset) {
          apiFromDate = new Date();
          apiFromDate.setHours(0, 0, 0, 0);
          apiToDate = new Date();
          apiToDate.setHours(23, 59, 59, 999);
        }

        await fetchWaterLevelReadings(
          siteNumericId,
          apiFromDate ? formatDateTimeForAPI(apiFromDate) : undefined,
          apiToDate ? formatDateTimeForAPI(apiToDate, true) : undefined,
          pageNumber,
          pageSize
        );
      }
    } catch (error: any) {
      setEditError((error as Error).message);
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

  const getAlarmStatus = (reading: WaterLevelReading, fieldName: string) => {
    const relevantAlarms = reading.alarms?.filter(alarm => alarm.fieldName === fieldName);
    if (!relevantAlarms || relevantAlarms.length === 0) return { colorCode: undefined, hasAlarm: false };

    const hasRedAlarm = relevantAlarms.some(alarm => getColorCategory(alarm.colorCode) === 'red');
    if (hasRedAlarm) return { colorCode: relevantAlarms.find(alarm => getColorCategory(alarm.colorCode) === 'red')?.colorCode, hasAlarm: true };

    const hasYellowAlarm = relevantAlarms.some(alarm => getColorCategory(alarm.colorCode) === 'yellow');
    if (hasYellowAlarm) return { colorCode: relevantAlarms.find(alarm => getColorCategory(alarm.colorCode) === 'yellow')?.colorCode, hasAlarm: true };

    return { colorCode: undefined, hasAlarm: false };
  };

  const hasAlarmForField = (reading: WaterLevelReading, fieldName: string) => {
    return getAlarmStatus(reading, fieldName).hasAlarm;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('readings.waterLevelReadings')} ({readings.length})</CardTitle>
          <div className="flex gap-2 justify-end">

            <Button variant="outline" onClick={handleExport}>
              <Download className="ml-2 h-4 w-4" />
              {t('common.export')}
            </Button>

            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              if (!open && (addError || addSiteDataError)) {
                return;
              }
              setIsAddDialogOpen(open);
              setIsSubmitting(false); // Unconditionally reset submitting state when dialog opens or closes
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  {t('readings.addManualReading')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <DialogHeader>
                  <DialogTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.addManualReading')}</DialogTitle>
                  <DialogDescription className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                    {t('readings.enterReadingData')}
                  </DialogDescription>
                </DialogHeader>
                {(addError || addSiteDataError) && (
                  <p className="text-red-600 text-right text-sm px-6 -mt-2">{addError || addSiteDataError}</p>
                )}
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('readings.selectSite')}</Label>
                      <Select dir="rtl" value={selectedSiteForAdd} onValueChange={setSelectedSiteForAdd} disabled>
                        <SelectTrigger>
                          <SelectValue placeholder={t('readings.selectSite')} />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map(site => (
                            <SelectItem key={site.id} value={String(site.id)}>{t('_rtl') === 'rtl' ? site.arabicName : site.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('common.date')}</Label>
                      <DatePicker
                        placeholder={t('readings.selectDate')}
                        value={readingDate}
                        onChange={setReadingDate}
                        maxDate={new Date()} // Disable dates after today
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.time')}</Label>
                    <Select dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'} value={readingTime} onValueChange={setReadingTime}>
                      <SelectTrigger className="w-1/2 rtl:flex-row-reverse">
                        <SelectValue placeholder={t('readings.selectHour')} />
                      </SelectTrigger>
                      <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                        {getAvailableHours(readingDate).map((hourNum) => {
                          const hour = hourNum.toString().padStart(2, '0');
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
                        <Label>USWL ({t('readings.flowUnit')})</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="125.4"
                          value={uswl}
                          onInput={(e: React.FormEvent<HTMLInputElement>) => {
                            const input = e.currentTarget;
                            // Check if browser detected invalid input (e.g., "1-2", "abc")
                            if (input.validity.badInput) {
                              setUswlError(t('readings.enterValidNumber'));
                            }
                          }}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            const parsedValue = parseFloat(inputValue);

                            if (inputValue === '') {
                              setUswl('');
                              setUswlError(null);
                            } else if (isNaN(parsedValue)) {
                              setUswl(inputValue);
                              setUswlError(t('readings.enterValidNumber'));
                            } else if (parsedValue < 0) {
                              setUswl(inputValue);
                              setUswlError(t('readings.valueCannotBeLessThanZero'));
                            } else {
                              setUswl(inputValue);
                              setUswlError(null);
                            }
                          }}
                        />
                        {uswlError && (
                          <p className="text-red-600 text-sm text-right mt-1">{uswlError}</p>
                        )}
                      </div>
                    )}
                    {(selectedSiteData?.hasDS1) && (
                      <div className="space-y-2">
                        <Label>DSWL1 ({t('readings.flowUnit')})</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="122.1"
                          value={dswl}
                          onInput={(e: React.FormEvent<HTMLInputElement>) => {
                            const input = e.currentTarget;
                            if (input.validity.badInput) {
                              setDswlError(t('readings.enterValidNumber'));
                            }
                          }}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            const parsedValue = parseFloat(inputValue);

                            if (inputValue === '') {
                              setDswl('');
                              setDswlError(null);
                            } else if (isNaN(parsedValue)) {
                              setDswl(inputValue);
                              setDswlError(t('readings.enterValidNumber'));
                            } else if (parsedValue < 0) {
                              setDswl(inputValue);
                              setDswlError(t('readings.valueCannotBeLessThanZero'));
                            } else {
                              setDswl(inputValue);
                              setDswlError(null);
                            }
                          }}
                        />
                        {dswlError && (
                          <p className="text-red-600 text-sm text-right mt-1">{dswlError}</p>
                        )}
                      </div>
                    )}
                    {(selectedSiteData?.hasDS2) && (
                      <div className="space-y-2">
                        <Label>DSWL2 ({t('readings.flowUnit')})</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="122.1"
                          value={dswl2}
                          onInput={(e: React.FormEvent<HTMLInputElement>) => {
                            const input = e.currentTarget;
                            if (input.validity.badInput) {
                              setDswl2Error(t('readings.enterValidNumber'));
                            }
                          }}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            const parsedValue = parseFloat(inputValue);

                            if (inputValue === '') {
                              setDswl2('');
                              setDswl2Error(null);
                            } else if (isNaN(parsedValue)) {
                              setDswl2(inputValue);
                              setDswl2Error(t('readings.enterValidNumber'));
                            } else if (parsedValue < 0) {
                              setDswl2(inputValue);
                              setDswl2Error(t('readings.valueCannotBeLessThanZero'));
                            } else {
                              setDswl2(inputValue);
                              setDswl2Error(null);
                            }
                          }}
                        />
                        {dswl2Error && (
                          <p className="text-red-600 text-sm text-right mt-1">{dswl2Error}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{t('readings.battery')} ({t('readings.voltUnit')})</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="12.8"
                      value={battery}
                      onInput={(e: React.FormEvent<HTMLInputElement>) => {
                        const input = e.currentTarget;
                        if (input.validity.badInput) {
                          setBatteryError(t('readings.enterValidNumber'));
                        }
                      }}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        const parsedValue = parseFloat(inputValue);

                        if (inputValue === '') {
                          setBattery('');
                          setBatteryError(null);
                        } else if (isNaN(parsedValue)) {
                          setBattery(inputValue);
                          setBatteryError(t('readings.enterValidNumber'));
                        } else if (parsedValue <= 0) {
                          setBattery(inputValue);
                          setBatteryError(t('readings.batteryMustBeGreaterThanZero'));
                        } else {
                          setBattery(inputValue);
                          setBatteryError(null);
                        }
                      }}
                    />
                    {batteryError && (
                      <p className="text-red-600 text-sm text-right mt-1">{batteryError}</p>
                    )}
                  </div>

                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                    {t('common.cancel')}
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
                      battery === '' ||
                      !!uswlError || !!dswlError || !!dswl2Error || !!batteryError
                    }
                    loadingText={t('readings.saving')}
                    isLoading={isSubmitting}>
                    {t('readings.saveReading')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditWaterLevelOpen} onOpenChange={(open) => {
              if (!open && (editError || editSiteDataError)) {
                return;
              }
              setIsEditWaterLevelOpen(open);
            }}>
              <DialogContent className="sm:max-w-[600px]" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">{t('readings.editWaterLevelReading')}</DialogTitle>
                  <DialogDescription className="text-right">
                    {t('readings.editReadingData')}
                  </DialogDescription>
                </DialogHeader>
                {(editError || editSiteDataError) && (
                  <p className="text-red-600 text-right text-sm px-6 -mt-2">{editError || editSiteDataError}</p>
                )}
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('readings.selectSite')}</Label>
                      <Select dir="rtl" value={editSelectedSiteId} onValueChange={setEditSelectedSiteId} disabled>
                        <SelectTrigger>
                          <SelectValue placeholder={t('readings.selectSite')} />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map(site => (
                            <SelectItem key={site.id} value={String(site.id)}>{t('_rtl') === 'rtl' ? site.arabicName : site.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('common.date')}</Label>
                      <DatePicker
                        placeholder={t('readings.selectDate')}
                        value={editReadingDate}
                        onChange={setEditReadingDate}
                        maxDate={new Date()} // Disable dates after today
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('common.time')}</Label>
                    <Select dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'} value={editReadingTime} onValueChange={setEditReadingTime}>
                      <SelectTrigger className="w-1/2 rtl:flex-row-reverse">
                        <SelectValue placeholder={t('readings.selectHour')} />
                      </SelectTrigger>
                      <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                        {getAvailableHours(editReadingDate).map((hourNum) => {
                          const hour = hourNum.toString().padStart(2, '0');
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
                    {editSelectedSiteData?.hasUS && (
                      <div className="space-y-2">
                        <Label>USWL ({t('readings.flowUnit')})</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="125.4"
                          value={editUswl}
                          onInput={(e: React.FormEvent<HTMLInputElement>) => {
                            const input = e.currentTarget;
                            if (input.validity.badInput) {
                              setEditUswlError(t('readings.enterValidNumber'));
                            }
                          }}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            const parsedValue = parseFloat(inputValue);

                            if (inputValue === '') {
                              setEditUswl('');
                              setEditUswlError(null);
                            } else if (isNaN(parsedValue)) {
                              setEditUswl(inputValue);
                              setEditUswlError(t('readings.enterValidNumber'));
                            } else if (parsedValue < 0) {
                              setEditUswl(inputValue);
                              setEditUswlError(t('readings.valueCannotBeLessThanZero'));
                            } else {
                              setEditUswl(inputValue);
                              setEditUswlError(null);
                            }
                          }}
                        />
                        {editUswlError && (
                          <p className="text-red-600 text-sm text-right mt-1">{editUswlError}</p>
                        )}
                      </div>
                    )}
                    {(editSelectedSiteData?.hasDS1) && (
                      <div className="space-y-2">
                        <Label>DSWL1 ({t('readings.flowUnit')})</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="122.1"
                          value={editDswl}
                          onInput={(e: React.FormEvent<HTMLInputElement>) => {
                            const input = e.currentTarget;
                            if (input.validity.badInput) {
                              setEditDswlError(t('readings.enterValidNumber'));
                            }
                          }}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            const parsedValue = parseFloat(inputValue);

                            if (inputValue === '') {
                              setEditDswl('');
                              setEditDswlError(null);
                            } else if (isNaN(parsedValue)) {
                              setEditDswl(inputValue);
                              setEditDswlError(t('readings.enterValidNumber'));
                            } else if (parsedValue < 0) {
                              setEditDswl(inputValue);
                              setEditDswlError(t('readings.valueCannotBeLessThanZero'));
                            } else {
                              setEditDswl(inputValue);
                              setEditDswlError(null);
                            }
                          }}
                        />
                        {editDswlError && (
                          <p className="text-red-600 text-sm text-right mt-1">{editDswlError}</p>
                        )}
                      </div>
                    )}
                    {(editSelectedSiteData?.hasDS2) && (
                      <div className="space-y-2">
                        <Label>DSWL2 ({t('readings.flowUnit')})</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="122.1"
                          value={editDswl2}
                          onInput={(e: React.FormEvent<HTMLInputElement>) => {
                            const input = e.currentTarget;
                            if (input.validity.badInput) {
                              setEditDswl2Error(t('readings.enterValidNumber'));
                            }
                          }}
                          onChange={(e) => {
                            const inputValue = e.target.value;
                            const parsedValue = parseFloat(inputValue);

                            if (inputValue === '') {
                              setEditDswl2('');
                              setEditDswl2Error(null);
                            } else if (isNaN(parsedValue)) {
                              setEditDswl2(inputValue);
                              setEditDswl2Error(t('readings.enterValidNumber'));
                            } else if (parsedValue < 0) {
                              setEditDswl2(inputValue);
                              setEditDswl2Error(t('readings.valueCannotBeLessThanZero'));
                            } else {
                              setEditDswl2(inputValue);
                              setEditDswl2Error(null);
                            }
                          }}
                        />
                        {editDswl2Error && (
                          <p className="text-red-600 text-sm text-right mt-1">{editDswl2Error}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{t('readings.battery')} ({t('readings.voltUnit')})</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="12.8"
                      value={editBattery}
                      onInput={(e: React.FormEvent<HTMLInputElement>) => {
                        const input = e.currentTarget;
                        if (input.validity.badInput) {
                          setEditBatteryError(t('readings.enterValidNumber'));
                        }
                      }}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        const parsedValue = parseFloat(inputValue);

                        if (inputValue === '') {
                          setEditBattery('');
                          setEditBatteryError(null);
                        } else if (isNaN(parsedValue)) {
                          setEditBattery(inputValue);
                          setEditBatteryError(t('readings.enterValidNumber'));
                        } else if (parsedValue <= 0) {
                          setEditBattery(inputValue);
                          setEditBatteryError(t('readings.batteryMustBeGreaterThanZero'));
                        } else {
                          setEditBattery(inputValue);
                          setEditBatteryError(null);
                        }
                      }}
                    />
                    {editBatteryError && (
                      <p className="text-red-600 text-sm text-right mt-1">{editBatteryError}</p>
                    )}
                  </div>

                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditWaterLevelOpen(false)} disabled={isSubmittingEdit}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    onClick={handleUpdateReading}
                    disabled={
                      isSubmittingEdit ||
                      !editingWaterLevel ||
                      !editReadingDate ||
                      !editReadingTime ||
                      !editSelectedSiteId ||
                      (editSelectedSiteData?.hasUS && editUswl === '') ||
                      (editSelectedSiteData?.hasDS1 && editDswl === '') ||
                      (editSelectedSiteData?.hasDS2 && editDswl2 === '') ||
                      editBattery === '' ||
                      !!editUswlError || !!editDswlError || !!editDswl2Error || !!editBatteryError
                    }
                    loadingText={t('readings.saving')}
                    isLoading={isSubmittingEdit}
                  >
                    {t('readings.saveChanges')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <DialogHeader>
                  <DialogTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.confirmDelete')}</DialogTitle>
                  <DialogDescription className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                    {t('readings.deleteConfirmationMessage', { site: readingToDelete?.site, timestamp: formatTimestamp(readingToDelete?.timestamp || '') })}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button variant="destructive" onClick={confirmDeleteWaterLevel}>
                    {t('common.delete')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
          <Table className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
            <TableHeader>
              <TableRow>
                <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.site')}</TableHead>
                <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.dateAndTime')}</TableHead>
                {showUSWL && <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>USWL ({t('readings.meter')})</TableHead>}
                {showDSWL1 && <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>DSWL1 ({t('readings.meter')})</TableHead>}
                {showDSWL2 && <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>DSWL2 ({t('readings.meter')})</TableHead>}
                <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.battery')} (V)</TableHead>
                <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.calculatedFlow')}</TableHead>
                <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={totalColumns} className="text-center py-6 text-gray-500">
                    {t('common.loadingData')}
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
                    {t('readings.noDataToDisplay')}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !error && readings.map((reading) => {
                return (
                <TableRow key={reading.id}>
                  <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} style={{fontWeight: 'normal'}}>{getSiteName(reading.siteId, reading.site)}</TableCell>
                  <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{formatTimestamp(reading.timestamp)}</TableCell>
                  {showUSWL && (
                    <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} style={{ color: getAlarmStatus(reading, 'USWL').colorCode, fontWeight: hasAlarmForField(reading, 'USWL') ? 'bold' : 'normal' }}>{reading.uswl?.toFixed(2) ?? ''}</TableCell>
                  )}
                  {showDSWL1 && (
                    <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} style={{ color: getAlarmStatus(reading, 'DSWL1').colorCode, fontWeight: hasAlarmForField(reading, 'DSWL1') ? 'bold' : 'normal' }}>{reading.dswL1?.toFixed(2)}</TableCell>
                  )}
                  {showDSWL2 && (
                    <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} style={{ color: getAlarmStatus(reading, 'DSWL2').colorCode, fontWeight: hasAlarmForField(reading, 'DSWL2') ? 'bold' : 'normal' }}>{reading.dswL2?.toFixed(2)}</TableCell>
                  )}
                  <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} style={{ color: getAlarmStatus(reading, 'Battery').colorCode, fontWeight: hasAlarmForField(reading, 'Battery') ? 'bold' : 'normal' }}>
                    {reading.battery?.toFixed(2) ?? ''}
                  </TableCell>
                  <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} style={{ color: getAlarmStatus(reading, 'Calculated_flow').colorCode, fontWeight: hasAlarmForField(reading, 'Calculated_flow') ? 'bold' : 'normal' }}>
                    <div className="flex items-center justify-start gap-2">
                      <span>{reading.calculatedFlow.toFixed(2)} {t('readings.flowUnit')}</span>
                    </div>
                  </TableCell>
                  <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditWaterLevel(reading)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWaterLevel(reading)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Pagination Controls */}
      {!isLoading && !error && readings.length > 0 && totalPages > 0 && (
        <CardContent className="pt-6 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">{t('common.recordsPerPage')}</Label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPageNumber(1); // Reset to first page when page size changes
                }}
                dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pagination Info */}
            <div className="text-sm text-gray-600">
              {t('common.showing')} {((pageNumber - 1) * pageSize) + 1} - {Math.min(pageNumber * pageSize, totalCount)} {t('common.of')} {totalCount} {t('common.results')}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPageNumber(pageNumber - 1)}
                  disabled={pageNumber === 1}
                  className="h-9 w-9"
                  aria-label={t('common.previousPage')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pageNumber <= 3) {
                    pageNum = i + 1;
                  } else if (pageNumber >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = pageNumber - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pageNumber ? "default" : "outline"}
                      size="icon"
                      onClick={() => setPageNumber(pageNum)}
                      className="h-9 w-9"
                      aria-label={`${t('common.page')} ${pageNum}`}
                      aria-current={pageNum === pageNumber ? 'page' : undefined}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                {totalPages > 5 && pageNumber < totalPages - 2 && (
                  <span className="px-2 text-gray-500">...</span>
                )}

                {totalPages > 5 && pageNumber < totalPages - 2 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPageNumber(totalPages)}
                    className="h-9 w-9"
                    aria-label={`${t('common.page')} ${totalPages}`}
                  >
                    {totalPages}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPageNumber(pageNumber + 1)}
                  disabled={pageNumber === totalPages}
                  className="h-9 w-9"
                  aria-label={t('common.nextPage')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
