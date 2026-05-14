import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../shared/contexts/AuthContext';
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
import { Download, Edit, FileText, Plus, CalendarIcon, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
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
  fetchPumpStationReadings: (siteId: number, startDate?: string, endDate?: string, pageNumber?: number, pageSize?: number) => Promise<void>;
  createPumpStationReading: (data: CreatePumpStationReadingRequest) => Promise<any>;
  updatePumpStationReading: (data: CreatePumpStationReadingRequest & { id: number }) => Promise<any>;
  deletePumpStationReading: (id: number) => Promise<any>;
  selectedSite: Site | null;
  handleEditPumpStation: (reading: PumpStationReading) => void;
  handleEditPump: (pumpIndex: number, reading: PumpStationReading) => void; // Added handleEditPump prop
  pageNumber: number;
  setPageNumber: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  totalCount: number;
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
  pageNumber,
  setPageNumber,
  pageSize,
  setPageSize,
  totalPages,
  totalCount,
  deletePumpStationReading,
}: PumpStationTableProps) {
    const { t } = useTranslation();
    const { currentUser } = useAuth();
    const isOperator = currentUser?.role === 'Operator';
    const [pumpReadings, setPumpReadings] = useState<{ time: number | null; flow: number | null; timeError?: string | null; flowError?: string | null }[]>([]);
    const [readingDateTime, setReadingDateTime] = useState<Date | undefined>();
    const [readingDate, setReadingDate] = useState<Date | undefined>();
    const [timePerHour, setTimePerHour] = useState<number | undefined>(undefined);

    const [editActivePumpsCount, setEditActivePumpsCount] = useState<number>(0);
    const [editReadingDate, setEditReadingDate] = useState<Date | undefined>();
    const [editTimePerHour, setEditTimePerHour] = useState<number | undefined>(undefined);
    const [editPumpReadings, setEditPumpReadings] = useState<{ time: number | null; flow: number | null; timeError?: string | null; flowError?: string | null }[]>([]);
    const [isSubmittingAdd, setIsSubmittingAdd] = useState(false); // New state for add dialog submission
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false); // New state for edit dialog submission

    const [isPumpDetailsOpen, setIsPumpDetailsOpen] = useState(false); // Added local state for pump details dialog
    const [selectedReading, setSelectedReading] = useState<PumpStationReading | null>(null); // Added local state for selected reading
    const [addError, setAddError] = useState<string | null>(null); // New state for add dialog error
    const [editError, setEditError] = useState<string | null>(null); // New state for edit dialog error
    const [isDeletePumpStationDialogOpen, setIsDeletePumpStationDialogOpen] = useState(false);
    const [pumpStationReadingToDelete, setPumpStationReadingToDelete] = useState<PumpStationReading | null>(null);

    // Refs for auto-scrolling in dialogs
    const addDialogScrollRef = useRef<HTMLDivElement>(null);
    const editDialogScrollRef = useRef<HTMLDivElement>(null);

    // Extracted values for clearer conditional rendering
    const shouldShowUSLevel = selectedSite?.hasUS ?? false;
    const shouldShowDS1Level = selectedSite?.hasDS1 ?? false;
    const shouldShowDS2Level = selectedSite?.hasDS2 ?? false;
    const numberOfPumps = selectedSite?.numPumps ?? 0;

    // Helper function to get site name based on language
    const getSiteName = useCallback((siteId?: number, fallbackName?: string) => {
      if (!siteId) return fallbackName || '-';
      const site = sites.find(s => s.id === siteId);
      if (!site) return fallbackName || '-';
      return t('_rtl') === 'rtl' ? site.arabicName || '-' : site.name;
    }, [sites, t]);

    useEffect(() => {
      console.log('useEffect (selectedSite?.numPumps) triggered. selectedSite.numPumps:', selectedSite?.numPumps);
      if (selectedSite?.numPumps) {
        setPumpReadings(Array.from({ length: selectedSite.numPumps }, () => ({ time: null, flow: null, timeError: null, flowError: null })));
      } else {
        setPumpReadings([]);
      }
    }, [selectedSite?.numPumps]);

    useEffect(() => {
      if (!isAddDialogOpen) { // Reset form when dialog closes
        setReadingDate(undefined);
        setTimePerHour(undefined);
        setPumpReadings(Array.from({ length: selectedSite?.numPumps || 0 }, () => ({ time: null, flow: null, timeError: null, flowError: null })));
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
        setEditTimePerHour(editingPumpStation.timePerHour === undefined ? undefined : editingPumpStation.timePerHour); // Set to undefined if no time, otherwise use the number
        setEditPumpReadings(editingPumpStation.pumps.map(pump => ({ time: pump.time ?? null, flow: pump.flow ?? null, timeError: null, flowError: null })) || []); // Map to new type with error fields
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

    // Auto-scroll to bottom when pump readings are added in Add dialog
    useEffect(() => {
      if (addDialogScrollRef.current && pumpReadings.length > 0) {
        const scrollContainer = addDialogScrollRef.current;
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }, [pumpReadings.length]);

    // Auto-scroll to bottom when pump readings are added in Edit dialog
    useEffect(() => {
      if (editDialogScrollRef.current && editPumpReadings.length > 0) {
        const scrollContainer = editDialogScrollRef.current;
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }, [editPumpReadings.length]);

    const handleDeletePumpStation = (reading: PumpStationReading) => {
      setPumpStationReadingToDelete(reading);
      setIsDeletePumpStationDialogOpen(true);
    };

    const confirmDeletePumpStation = async () => {
      if (pumpStationReadingToDelete) {
        try {
          await deletePumpStationReading(pumpStationReadingToDelete.id);
          setIsDeletePumpStationDialogOpen(false);
          setPumpStationReadingToDelete(null);

          // Refresh readings after deletion
          const siteNumericId = Number(selectedSiteId);
          if (!Number.isNaN(siteNumericId)) {
            let apiFromDate = startDate;
            let apiToDate = endDate;

            const bothUnset = startDate === undefined && endDate === undefined;
            if (bothUnset) {
              apiFromDate = new Date();
              apiFromDate.setHours(0, 0, 0, 0);
              apiToDate = new Date();
              apiToDate.setHours(23, 59, 59, 999);
            }

            await fetchPumpStationReadings(
              siteNumericId,
              apiFromDate ? formatDateTimeForAPI(apiFromDate) : undefined,
              apiToDate ? formatDateTimeForAPI(apiToDate, true) : undefined,
              pageNumber,
              pageSize
            );
          }
        } catch (error) {
          console.error("Failed to delete pump station reading:", error);
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

    const handlePumpInputChange = (index: number, field: 'time' | 'flow', value: string) => {
      const newPumpReadings = [...pumpReadings];
      const numValue = parseFloat(value);
      
      if (value === '') {
        newPumpReadings[index] = { 
          ...newPumpReadings[index], 
          [field]: null,
          [`${field}Error`]: null
        };
      } else if (isNaN(numValue)) {
        newPumpReadings[index] = { 
          ...newPumpReadings[index], 
          [field]: null,
          [`${field}Error`]: t('readings.enterValidNumber')
        };
      } else if (numValue < 0) {
        newPumpReadings[index] = { 
          ...newPumpReadings[index], 
          [field]: numValue,
          [`${field}Error`]: t('readings.mustBePositive')
        };
      } else {
        newPumpReadings[index] = { 
          ...newPumpReadings[index], 
          [field]: numValue,
          [`${field}Error`]: null
        };
      }
      
      setPumpReadings(newPumpReadings);
    };

    const handleEditPumpInputChange = (index: number, field: 'time' | 'flow', value: string) => {
      const newEditPumpReadings = [...editPumpReadings];
      const numValue = parseFloat(value);
      
      if (value === '') {
        newEditPumpReadings[index] = { 
          ...newEditPumpReadings[index], 
          [field]: null,
          [`${field}Error`]: null
        };
      } else if (isNaN(numValue)) {
        newEditPumpReadings[index] = { 
          ...newEditPumpReadings[index], 
          [field]: null,
          [`${field}Error`]: t('readings.enterValidNumber')
        };
      } else if (numValue < 0) {
        newEditPumpReadings[index] = { 
          ...newEditPumpReadings[index], 
          [field]: numValue,
          [`${field}Error`]: t('readings.mustBePositive')
        };
      } else {
        newEditPumpReadings[index] = { 
          ...newEditPumpReadings[index], 
          [field]: numValue,
          [`${field}Error`]: null
        };
      }
      
      setEditPumpReadings(newEditPumpReadings);
    };

    const handleAddReading = async () => {
      setAddError(null); // Clear previous errors
      if (!selectedSiteId || !readingDate || timePerHour === undefined) {
        setAddError(t('readings.fillAllFields'));
        return;
      }

      // Validate that all pump fields are filled
      const hasEmptyPumpFields = pumpReadings.some(pump => 
        pump.time === null || pump.flow === null
      );

      if (hasEmptyPumpFields) {
        setAddError(t('readings.fillAllPumpFields'));
        setIsSubmittingAdd(false);
        return;
      }

      // Validate pump readings for non-negative values
      const hasInvalidPumpValue = pumpReadings.some(pump => 
        (pump.time !== null && pump.time < 0) || (pump.flow !== null && pump.flow < 0)
      );

      if (hasInvalidPumpValue || pumpReadings.some(pump => pump.timeError || pump.flowError)) {
        setAddError(t('readings.pumpValuesPositive'));
        setIsSubmittingAdd(false);
        return;
      }

      setIsSubmittingAdd(true); // Set submitting state to true
      const dateTime = new Date(readingDate);
      dateTime.setHours(timePerHour, 0, 0, 0); // Use timePerHour for hours

      // Validate that the combined datetime is not in the future
      const now = new Date();
      if (dateTime.getTime() > now.getTime()) {
        setAddError(t('readings.cannotAddFutureReading'));
        setIsSubmittingAdd(false);
        return;
      }

      const formattedTimestamp = formatDateTimeForAPI(dateTime); // Use toISOString() directly

      const totalUptime = pumpReadings.reduce((sum, pump) => sum + (pump.time ?? 0), 0);
      const totalFlow = pumpReadings.reduce((sum, pump) => sum + (pump.flow ?? 0), 0);

      // Initialize all pump data fields up to numberOfPumps with null
      const pumpData: { [key: string]: number } = {}; // Change type to number
      for (let i = 1; i <= numberOfPumps; i++) {
        pumpData[`p${i}_Time`] = 0; // Initialize with 0 instead of null
        pumpData[`p${i}_Flow`] = 0; // Initialize with 0 instead of null
      }

      // Overwrite with actual pumpReadings data, using 0 for undefined values
      pumpReadings.forEach((pump, index) => {
        if (index < numberOfPumps) { // Ensure we don't go beyond the actual number of pumps
          pumpData[`p${index + 1}_Time`] = pump.time ?? 0; // Use 0 instead of null
          pumpData[`p${index + 1}_Flow`] = pump.flow ?? 0; // Use 0 instead of null
        }
      });

      const requestBody: CreatePumpStationReadingRequest = {
        siteId: Number(selectedSiteId),
        timestamp: formattedTimestamp,
        timePerHour: timePerHour, // Map timePerHour directly
        recordNumber: 1,
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
            formatDateTimeForAPI(endDate, true),
            pageNumber,
            pageSize
          );
        } else {
          const today = new Date();
          const startOfToday = new Date(today.setHours(0, 0, 0, 0));
          const endOfToday = new Date(today.setHours(23, 59, 59, 999));
          fetchPumpStationReadings(
            Number(selectedSiteId),
            formatDateTimeForAPI(startOfToday),
            formatDateTimeForAPI(endOfToday, true),
            pageNumber,
            pageSize
          );
        }
      } catch (error: any) {
        setAddError(error.message || t('readings.failedToAddReading'));
      } finally {
        setIsSubmittingAdd(false); // Ensure this is correctly set
      }
    };

    const handleSaveEditPumpStation = async () => {
      setEditError(null); // Clear previous errors
      if (!editingPumpStation || !editReadingDate || editTimePerHour === undefined) {
        setEditError(t('readings.fillAllFields'));
        return;
      }

      const siteId = Number(editingPumpStation.siteId); // Site cannot be changed for existing readings
      if (!siteId || Number.isNaN(siteId)) {
        setEditError(t('readings.invalidSite'));
        return;
      }

      const dateTime = new Date(editReadingDate);
      dateTime.setHours(editTimePerHour, 0, 0, 0);

      // Validate that the combined datetime is not in the future
      const now = new Date();
      if (dateTime.getTime() > now.getTime()) {
        setEditError(t('readings.cannotAddFutureReading'));
        return;
      }

      // Validate that all pump fields are filled
      const hasEmptyPumpFields = editPumpReadings.some(pump => 
        pump.time === null || pump.flow === null
      );

      if (hasEmptyPumpFields) {
        setEditError(t('readings.fillAllPumpFields'));
        setIsSubmittingEdit(false);
        return;
      }

      // Validate pump readings for non-negative values and errors
      const hasInvalidPumpValue = editPumpReadings.some(pump => 
        (pump.time !== null && pump.time < 0) || (pump.flow !== null && pump.flow < 0)
      );

      if (hasInvalidPumpValue || editPumpReadings.some(pump => pump.timeError || pump.flowError)) {
        setEditError(t('readings.pumpValuesPositive'));
        setIsSubmittingEdit(false);
        return;
      }

      const totalUptime = editPumpReadings.reduce((sum, pump) => sum + (pump.time ?? 0), 0);
      const totalFlow = editPumpReadings.reduce((sum, pump) => sum + (pump.flow ?? 0), 0);

      // Initialize all pump data fields up to numberOfPumps with null
      const pumpData: { [key: string]: number } = {}; // Change type to number
      for (let i = 1; i <= numberOfPumps; i++) {
        pumpData[`p${i}_Time`] = 0; // Initialize with 0 instead of null
        pumpData[`p${i}_Flow`] = 0; // Initialize with 0 instead of null
      }

      // Overwrite with actual editPumpReadings data, using 0 for undefined values
      editPumpReadings.forEach((pump, index) => {
        if (index < numberOfPumps) { // Ensure we don't go beyond the actual number of pumps
          pumpData[`p${index + 1}_Time`] = pump.time ?? 0; // Use 0 instead of null
          pumpData[`p${index + 1}_Flow`] = pump.flow ?? 0; // Use 0 instead of null
        }
      });

      setIsSubmittingEdit(true); // Set submitting state to true
      try {
        await updatePumpStationReading({
          id: editingPumpStation.id,
          siteId: siteId,
          timestamp: formatDateTimeForAPI(dateTime),
          timePerHour: editTimePerHour || 0,
          recordNumber: 1,
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
        // Conditionally refetch readings based on existing date range or current day
        if (startDate && endDate) {
          fetchPumpStationReadings(Number(selectedSiteId), formatDateTimeForAPI(startDate), formatDateTimeForAPI(endDate, true), pageNumber, pageSize);
        } else {
          const today = new Date();
          const startOfToday = new Date(today.setHours(0, 0, 0, 0));
          const endOfToday = new Date(today.setHours(23, 59, 59, 999));
          fetchPumpStationReadings(
            Number(selectedSiteId),
            formatDateTimeForAPI(startOfToday),
            formatDateTimeForAPI(endOfToday, true),
            pageNumber,
            pageSize
          );
        }
      } catch (error: any) {
        setEditError(error.message || t('readings.failedToUpdateReading'));
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
    
    const getAlarmStatus = (reading: PumpStationReading, fieldName: string) => {
      const relevantAlarms = reading.alarms?.filter(alarm => alarm.fieldName === fieldName);
      if (!relevantAlarms || relevantAlarms.length === 0) return { colorCode: undefined, hasAlarm: false };

      // Prioritize red alarms
      const hasRedAlarm = relevantAlarms.some(alarm => getColorCategory(alarm.colorCode) === 'red');
      if (hasRedAlarm) return { colorCode: relevantAlarms.find(alarm => getColorCategory(alarm.colorCode) === 'red')?.colorCode, hasAlarm: true };

      // Then consider yellow alarms
      const hasYellowAlarm = relevantAlarms.some(alarm => getColorCategory(alarm.colorCode) === 'yellow');
      if (hasYellowAlarm) return { colorCode: relevantAlarms.find(alarm => getColorCategory(alarm.colorCode) === 'yellow')?.colorCode, hasAlarm: true };

      return { colorCode: undefined, hasAlarm: false };
    };
    
    const hasAlarmForField = (reading: PumpStationReading, fieldName: string) => {
      return getAlarmStatus(reading, fieldName).hasAlarm;
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

    // Style objects for dialogs (matching AddThresholdAlarmDialog pattern)
    const dialogContentStyle: React.CSSProperties = {
      width: '95vw',
      maxWidth: '600px',
      height: '80vh',
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      padding: 0,
      overflow: 'hidden',
      direction: 'rtl'
    };

    const headerContainerStyle: React.CSSProperties = {
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
      paddingTop: '1.5rem',
      paddingBottom: '1rem',
      flexShrink: 0,
      borderBottom: '1px solid hsl(var(--border))'
    };

    const titleStyle: React.CSSProperties = {
      textAlign: 'right'
    };

    const descriptionStyle: React.CSSProperties = {
      textAlign: 'right'
    };

    const errorTextStyle: React.CSSProperties = {
      color: '#dc2626',
      fontSize: '0.875rem',
      textAlign: 'right',
      marginTop: '0.5rem'
    };

    const scrollContainerStyle: React.CSSProperties = {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
      paddingTop: '1rem',
      paddingBottom: '1rem',
      minHeight: 0,
      WebkitOverflowScrolling: 'touch',
      height: 0
    };

    const contentWrapperStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    };

    const gridContainerStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '1rem'
    };

    const fieldContainerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    };

    const footerContainerStyle: React.CSSProperties = {
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
      paddingTop: '1rem',
      paddingBottom: '1.5rem',
      flexShrink: 0,
      borderTop: '1px solid hsl(var(--border))'
    };

    const footerStyle: React.CSSProperties = {
      marginTop: 0
    };

    const footerButtonsContainerStyle: React.CSSProperties = {
      width: '100%',
      display: 'flex',
      justifyContent: 'flex-start',
      gap: '0.5rem'
    };

  return (
    <Card >
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>{t('readings.pumpStation')} ({readings.length})</CardTitle>
            <div className="flex gap-2 justify-end">
            
          <Button variant="outline" onClick={handleExport}>
            <Download className="ml-2 h-4 w-4" />
            {t('common.export')}
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                {t('readings.addManualReading')}
              </Button>
            </DialogTrigger>
            <DialogContent style={dialogContentStyle} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
              <div style={headerContainerStyle}>
                <DialogHeader>
                  <DialogTitle style={titleStyle}>{t('readings.addManualReading')}</DialogTitle>
                  <DialogDescription style={descriptionStyle}>
                    {t('readings.enterReadingData')}
                  </DialogDescription>
                </DialogHeader>
                {addError && (
                  <p style={{ ...errorTextStyle, marginTop: '0.5rem' }}>{addError}</p>
                )}
              </div>
              <div ref={addDialogScrollRef} style={scrollContainerStyle}>
                <div key={selectedSiteId} style={contentWrapperStyle}>
                <div style={gridContainerStyle}>
                  <div style={fieldContainerStyle}>
                    <Label>{t('readings.selectSite')}</Label>
                    <Select dir="rtl" value={selectedSiteId || ''} disabled>
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
                  <div style={fieldContainerStyle}>
                    <Label>{t('common.date')}</Label>
                    <DatePicker 
                    placeholder={t('readings.selectDate')}
                    value={readingDate}
                    onChange={(date) => setReadingDate(date ?? undefined)}
                    maxDate={new Date()} // Disable dates after today
                    />
                  </div>
                </div>
                {/* Removed USWL, DSWL, Battery, Record Number, Time Per Hour fields as per user request */}
                {/* {shouldShowUSLevel && (
                  <div style={fieldContainerStyle}>
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
                  <div style={fieldContainerStyle}>
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
                  <div style={fieldContainerStyle}>
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
                <div style={fieldContainerStyle}>
                  <Label>{t('common.time')}</Label>
                  <Select
                    dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                    value={timePerHour?.toString().padStart(2, '0') || ''}
                    onValueChange={(value) => setTimePerHour(value === '' ? undefined : parseFloat(value))}
                  >
                    <SelectTrigger className="rtl:flex-row-reverse">
                      <SelectValue placeholder={t('readings.selectHour')} />
                    </SelectTrigger>
                    <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
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

                {numberOfPumps > 0 && Array.from({ length: numberOfPumps }).map((_, index) => (
                  <div key={index} style={gridContainerStyle}>
                    <div style={fieldContainerStyle}>
                      <Label>{t('readings.pumpNumber')} {index + 1} {t('readings.pumpUptime')}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder={t('common.zero')}
                        value={pumpReadings[index]?.time ?? ''}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const input = e.currentTarget;
                          if (input.validity.badInput) {
                            const newPumpReadings = [...pumpReadings];
                            newPumpReadings[index] = { 
                              ...newPumpReadings[index], 
                              timeError: t('readings.enterValidNumber')
                            };
                            setPumpReadings(newPumpReadings);
                          }
                        }}
                        onChange={(e) => handlePumpInputChange(index, 'time', e.target.value)}
                      />
                      {pumpReadings[index]?.timeError && (
                        <p style={errorTextStyle}>{pumpReadings[index].timeError}</p>
                      )}
                    </div>
                    <div style={fieldContainerStyle}>
                      <Label>{t('readings.pumpNumber')} {index + 1} {t('readings.pumpFlow')}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder={t('common.zero')}
                        value={pumpReadings[index]?.flow ?? ''}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const input = e.currentTarget;
                          if (input.validity.badInput) {
                            const newPumpReadings = [...pumpReadings];
                            newPumpReadings[index] = { 
                              ...newPumpReadings[index], 
                              flowError: t('readings.enterValidNumber')
                            };
                            setPumpReadings(newPumpReadings);
                          }
                        }}
                        onChange={(e) => handlePumpInputChange(index, 'flow', e.target.value)}
                      />
                      {pumpReadings[index]?.flowError && (
                        <p style={errorTextStyle}>{pumpReadings[index].flowError}</p>
                      )}
                    </div>
                  </div>
                ))}
                </div>
              </div>
              <div style={footerContainerStyle}>
                <DialogFooter style={footerStyle}>
                  <div style={footerButtonsContainerStyle}>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={handleAddReading} disabled={
                      isSubmittingAdd || 
                      !readingDate || 
                      timePerHour === undefined || 
                      pumpReadings.some(pump => pump.timeError || pump.flowError) ||
                      pumpReadings.some(pump => pump.time === null || pump.flow === null)
                    } loadingText={t('readings.saving')} isLoading={isSubmittingAdd}>
                      {t('readings.saveReading')}
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditPumpStationOpen} onOpenChange={setIsEditPumpStationOpen}>
            <DialogContent style={dialogContentStyle} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
              <div style={headerContainerStyle}>
                <DialogHeader>
                  <DialogTitle style={titleStyle}>{t('readings.editReading')}</DialogTitle>
                  <DialogDescription style={descriptionStyle}>
                    {t('readings.editReadingData')}
                  </DialogDescription>
                </DialogHeader>
                {editError && (
                  <p style={{ ...errorTextStyle, marginTop: '0.5rem' }}>{editError}</p>
                )}
              </div>
              <div ref={editDialogScrollRef} style={scrollContainerStyle}>
                <div style={contentWrapperStyle}>
                <div style={gridContainerStyle}>
                  <div style={fieldContainerStyle}>
                    <Label>{t('readings.selectSite')}</Label>
                    <Select dir="rtl" value={editingPumpStation?.siteId?.toString() || ""} disabled>
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
                  <div style={fieldContainerStyle}>
                    <Label>{t('common.date')}</Label>
                    <DatePicker 
                    placeholder={t('readings.selectDate')}
                    value={editReadingDate}
                    onChange={(date) => setEditReadingDate(date ?? undefined)}
                    maxDate={new Date()} // Disable dates after today
                    disabled={isOperator}
                    />
                  </div>
                </div>
                
                <div style={fieldContainerStyle}>
                  <Label>{t('common.time')}</Label>
                  <Select
                    dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                    value={editTimePerHour?.toString().padStart(2, '0') || ''}
                    onValueChange={(value) => setEditTimePerHour(value === '' ? undefined : parseFloat(value))}
                    disabled={isOperator}
                  >
                    <SelectTrigger className="rtl:flex-row-reverse">
                      <SelectValue placeholder={t('readings.selectHour')} />
                    </SelectTrigger>
                    <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
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
                
                
               

                {numberOfPumps > 0 && Array.from({ length: numberOfPumps }).map((_, index) => (
                  <div key={index} style={gridContainerStyle}>
                    <div style={fieldContainerStyle}>
                      <Label>{t('readings.pumpNumber')} {index + 1} {t('readings.pumpUptime')}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder={t('common.zero')}
                        value={editPumpReadings[index]?.time ?? ''}
                        disabled={isOperator}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const input = e.currentTarget;
                          if (input.validity.badInput) {
                            const newEditPumpReadings = [...editPumpReadings];
                            newEditPumpReadings[index] = { 
                              ...newEditPumpReadings[index], 
                              timeError: t('readings.enterValidNumber')
                            };
                            setEditPumpReadings(newEditPumpReadings);
                          }
                        }}
                        onChange={(e) => handleEditPumpInputChange(index, 'time', e.target.value)}
                      />
                      {editPumpReadings[index]?.timeError && (
                        <p style={errorTextStyle}>{editPumpReadings[index].timeError}</p>
                      )}
                    </div>
                    <div style={fieldContainerStyle}>
                      <Label>{t('readings.pumpNumber')} {index + 1} {t('readings.pumpFlow')}</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder={t('common.zero')}
                        value={editPumpReadings[index]?.flow ?? ''}
                        disabled={isOperator}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const input = e.currentTarget;
                          if (input.validity.badInput) {
                            const newEditPumpReadings = [...editPumpReadings];
                            newEditPumpReadings[index] = { 
                              ...newEditPumpReadings[index], 
                              flowError: t('readings.enterValidNumber')
                            };
                            setEditPumpReadings(newEditPumpReadings);
                          }
                        }}
                        onChange={(e) => handleEditPumpInputChange(index, 'flow', e.target.value)}
                      />
                      {editPumpReadings[index]?.flowError && (
                        <p style={errorTextStyle}>{editPumpReadings[index].flowError}</p>
                      )}
                    </div>
                  </div>
                ))}
                </div>
              </div>
              <div style={footerContainerStyle}>
                <DialogFooter style={footerStyle}>
                  <div style={footerButtonsContainerStyle}>
                    <Button variant="outline" onClick={() => setIsEditPumpStationOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSaveEditPumpStation} disabled={
                      isOperator ||
                      isSubmittingEdit || 
                      !editingPumpStation || 
                      !editReadingDate || 
                      editTimePerHour === undefined || 
                      editPumpReadings.some(pump => pump.timeError || pump.flowError) ||
                      editPumpReadings.some(pump => pump.time === null || pump.flow === null)
                    } loadingText={t('readings.saving')} isLoading={isSubmittingEdit}>
                      {t('readings.saveChanges')}
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeletePumpStationDialogOpen} onOpenChange={setIsDeletePumpStationDialogOpen}>
            <DialogContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
              <DialogHeader>
                <DialogTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.confirmDelete')}</DialogTitle>
                <DialogDescription className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                  {t('readings.deleteConfirmationMessage', { site: pumpStationReadingToDelete?.site, timestamp: formatTimestamp(pumpStationReadingToDelete?.timestamp || '') })}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeletePumpStationDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button variant="destructive" onClick={confirmDeletePumpStation}>
                  {t('common.delete')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
            </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-hidden">
        <div className="overflow-x-auto" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
          <Table className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
            <TableHeader>
              <TableRow>
                <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.site')}</TableHead>
                <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.dateTime')}</TableHead>
                {/* Removed US, DS1, DS2 table headers */}
                {/* {selectedSite?.hasUS && <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.usLevel')}</TableHead>} */}
                {/* {selectedSite?.hasDS1 && <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.ds1Level')}</TableHead>} */}
                {/* {selectedSite?.hasDS2 && <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.ds2Level')}</TableHead>} */}
                {/* {totalPumps > 0 && Array.from({ length: totalPumps }).map((_, i) => (
                  <React.Fragment key={i}>
                    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.pumpNumber')} {i + 1} {t('readings.pumpUptime')}</TableHead>
                    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.pumpNumber')} {i + 1} {t('readings.pumpFlow')}</TableHead>
                  </React.Fragment>
                ))} */}
                <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.totalUptime')}</TableHead>
                <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.totalFlow')}</TableHead>
                <TableHead className="text-center">{t('common.actions')}</TableHead>
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
                const hasAlarms = reading.alarms && reading.alarms.length > 0;
                return (
                <TableRow key={reading.id} >
                  <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} style={{fontWeight: 'normal'}}>{getSiteName(reading.siteId, reading.site)}</TableCell>
                  <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{formatTimestamp(reading.timestamp)}</TableCell>
                  {/* Removed US, DS1, DS2 table cells */}
                  {/* {selectedSite?.hasUS && <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{reading.usLevel?.toFixed(2) || 'N/A'}</TableCell>} */}
                  {/* {selectedSite?.hasDS1 && <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{reading.ds1Level?.toFixed(2) || 'N/A'}</TableCell>} */}
                  {/* {selectedSite?.hasDS2 && <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{reading.ds2Level?.toFixed(2) || 'N/A'}</TableCell>} */}
                  <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} style={{ color: getAlarmColor(reading, 'TotalUptime'), fontWeight: getAlarmColor(reading, 'TotalUptime') ? 'bold' : 'normal' }}>{reading.totalUptime.toFixed(2)} {t('readings.hour')}</TableCell>
                  <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} style={{ color: getAlarmColor(reading, 'Total_flow'), fontWeight: getAlarmColor(reading, 'Total_flow') ? 'bold' : 'normal' }}>{reading.totalFlow.toFixed(2)} {t('readings.flowUnit')}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {!isOperator && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditPumpStation(reading)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDetailsClick(reading)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {currentUser?.role === 'Admin' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeletePumpStation(reading)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
               );
               })}
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
      {/* Pump Details Dialog */}
      <Dialog open={isPumpDetailsOpen} onOpenChange={setIsPumpDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.pumpReadingDetails')}</DialogTitle>
            <DialogDescription className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
              {selectedReading?.site} - {selectedReading?.timestamp}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
              <TableHeader>
                <TableRow>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.pumpNumber')}</TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.pumpUptime')}</TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.pumpFlow')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedReading?.pumps.map((pump, index) => {
                  const pumpTimeAlarmStatus = getAlarmStatus(selectedReading, `P${index + 1}_time`);
                  const pumpFlowAlarmStatus = getAlarmStatus(selectedReading, `P${index + 1}_flow`);
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.pumpNumber')} {index + 1}</TableCell>
                      <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} style={{ color: pumpTimeAlarmStatus.colorCode, fontWeight: pumpTimeAlarmStatus.hasAlarm ? 'bold' : 'normal' }}>{pump.time !== null && pump.time !== undefined ? pump.time.toFixed(2) : 'N/A'}</TableCell>
                      <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} style={{ color: pumpFlowAlarmStatus.colorCode, fontWeight: pumpFlowAlarmStatus.hasAlarm ? 'bold' : 'normal' }}>{pump.flow !== null && pump.flow !== undefined ? pump.flow.toFixed(2) : 'N/A'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                  <p className="text-sm text-gray-600">{t('readings.totalUptime')}</p>
                  <p className="text-xl mt-1">{selectedReading?.totalUptime.toFixed(2)} {t('readings.hour')}</p>
                </div>
                <div className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                  <p className="text-sm text-gray-600">{t('readings.totalFlow')}</p>
                  <p className="text-xl mt-1">{selectedReading?.totalFlow.toFixed(2)} {t('readings.flowUnit')}</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPumpDetailsOpen(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
