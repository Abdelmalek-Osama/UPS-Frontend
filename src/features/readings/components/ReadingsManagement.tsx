import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../../../components/ui/table';
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
import {
  Plus,
  Download,
  Upload,
  CalendarIcon,
  AlertCircle,
  Edit,
  X
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
import type { PumpStationReading, WaterLevelReading } from '../types';
import { DatePicker } from '../../../components/ui/datepicker';
import Loader from '../../../components/ui/Loader';
import { formatDateTimeForAPI } from '../utils/utils';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

export function ReadingsManagement() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('waterLevel');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const {
    waterLevelReadings,
    pumpStationReadings,
    sites,
    handleEditPump,
    isEditWaterLevelOpen,
    setIsEditWaterLevelOpen,
    editingWaterLevel,
    handleEditWaterLevel,
    isEditPumpStationOpen,
    setIsEditPumpStationOpen,
    editingPumpStation,
    setEditingPumpStation, // This was added for PumpStationTable to allow siteName changes
    handleEditPumpStation,
    fetchWaterLevelReadings,
    createWaterLevelReading,
    updateWaterLevelReading,
    isLoading, // For create/update operations
    isLoadingWaterLevel, // For water level readings fetch
    isLoadingPumpStation, // For pump station readings fetch
    isLoadingSites, // For sites lookup
    waterLevelError,
    pumpStationError,
    fetchPumpStationReadings,
    createPumpStationReading,
    updatePumpStationReading,
    selectedSite,
    // Pagination state for water level readings
    waterLevelPageNumber,
    setWaterLevelPageNumber,
    waterLevelPageSize,
    setWaterLevelPageSize,
    waterLevelTotalPages,
    waterLevelTotalCount,
    // Pagination state for pump station readings
    pumpStationPageNumber,
    setPumpStationPageNumber,
    pumpStationPageSize,
    setPumpStationPageSize,
    pumpStationTotalPages,
    pumpStationTotalCount,
  } = useReadingsData(selectedSiteId);

  useEffect(() => {
    if (sites.length > 0 && !selectedSiteId) {
      setSelectedSiteId(String(sites[0].id));
    }
  }, [sites, selectedSiteId]);

  useEffect(() => {
    if (selectedSite && selectedSite.data) {
      const site = selectedSite.data;

      const supportsWaterLevel = site.siteType === 'WaterLevel' || site.hasUS || site.hasDS1 || site.hasDS2;
      const supportsPumpStation = site.siteType === 'Pumps' || (site.numPumps && site.numPumps > 0);

      if (activeTab === 'pumpStation' && !supportsPumpStation) {
        if (supportsWaterLevel) {
          setActiveTab('waterLevel');
        } else {
          // If pumpStation is not supported and waterLevel is also not supported,
          // we don't force a switch, as there's no valid alternative. The table will likely be empty.
        }
      } else if (activeTab === 'waterLevel' && !supportsWaterLevel) {
        if (supportsPumpStation) {
          setActiveTab('pumpStation');
        } else {
          // If waterLevel is not supported and pumpStation is also not supported,
          // we don't force a switch, as there's no valid alternative. The table will likely be empty.
        }
      }
      // If the activeTab IS supported, or if the site supports both, do nothing (allow manual switch)
    }
  }, [selectedSite, activeTab]);

  // Show loader if sites are loading or if we don't have a selected site yet (initial load)
  const isInitialLoading = isLoadingSites || (sites.length === 0 && !selectedSiteId);

  const formatDate = (date?: Date) => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  // const [isPumpDetailsOpen, setIsPumpDetailsOpen] = useState(false);
  // const [selectedReading, setSelectedReading] = useState<PumpStationReading | null>(null);

  useEffect(() => {
    if (!selectedSiteId) {
      return;
    }
    const siteNumericId = Number(selectedSiteId);
    if (Number.isNaN(siteNumericId)) {
      return;
    }

    // Only fetch when:
    // - both fromDate and toDate are undefined (initial/default load), OR
    // - both fromDate and toDate are set and fromDate <= toDate
    const bothUnset = fromDate === undefined && toDate === undefined;
    const bothSetAndValid = fromDate !== undefined && toDate !== undefined && fromDate.getTime() <= toDate.getTime();

    if (!bothUnset && !bothSetAndValid) {
      // Do not trigger API call when only one of the dates is selected or dates are invalid
      return;
    }

    let apiFromDate = fromDate;
    let apiToDate = toDate;

    // If both dates are unset, default to today's range
    if (bothUnset) {
      apiFromDate = new Date();
      apiFromDate.setHours(0, 0, 0, 0);
      apiToDate = new Date();
      apiToDate.setHours(23, 59, 59, 999);
    }

    fetchWaterLevelReadings(
      siteNumericId,
      apiFromDate ? formatDateTimeForAPI(apiFromDate) : undefined,
      apiToDate ? formatDateTimeForAPI(apiToDate, true) : undefined,
      waterLevelPageNumber,
      waterLevelPageSize
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSiteId, fromDate, toDate, waterLevelPageNumber, waterLevelPageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (waterLevelPageNumber !== 1) {
      setWaterLevelPageNumber(1);
    }
  }, [selectedSiteId, fromDate, toDate, waterLevelPageSize]);

  // Added useEffect for fetching pump station readings
  useEffect(() => {
    // Only fetch when pump station tab is active
    if (activeTab !== 'pumpStation' || !selectedSiteId) {
      return;
    }
    const siteNumericId = Number(selectedSiteId);
    if (Number.isNaN(siteNumericId)) {
      return;
    }

    // Only fetch when both dates are unset (initial load) or both are set and valid
    const bothUnset = fromDate === undefined && toDate === undefined;
    const bothSetAndValid = fromDate !== undefined && toDate !== undefined && fromDate.getTime() <= toDate.getTime();

    if (!bothUnset && !bothSetAndValid) {
      return;
    }

    let apiFromDate = fromDate;
    let apiToDate = toDate;

    if (bothUnset) {
      apiFromDate = new Date();
      apiFromDate.setHours(0, 0, 0, 0);
      apiToDate = new Date();
      apiToDate.setHours(23, 59, 59, 999);
    }

    fetchPumpStationReadings(
      siteNumericId,
      apiFromDate ? formatDateTimeForAPI(apiFromDate) : undefined,
      apiToDate ? formatDateTimeForAPI(apiToDate, true) : undefined,
      pumpStationPageNumber,
      pumpStationPageSize
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedSiteId, fromDate, toDate, pumpStationPageNumber, pumpStationPageSize]);

  // Reset to page 1 when filters change for pump station readings
  useEffect(() => {
    if (activeTab === 'pumpStation' && pumpStationPageNumber !== 1) {
      setPumpStationPageNumber(1);
    }
  }, [activeTab, selectedSiteId, fromDate, toDate, pumpStationPageSize]);


  // const handleViewPumpDetails = (reading: PumpStationReading) => {
  //   setSelectedReading(reading);
  //   setIsPumpDetailsOpen(true);
  // };

  const handleResetDates = () => {
    setFromDate(undefined);
    setToDate(undefined);
  };

  // Client-side Excel export functions (no API calls)
  const handleWaterLevelExport = () => {
    if (!selectedSiteId) {
      toast.error(t('readings.selectSiteFirst'));
      return;
    }

    if (!waterLevelReadings || waterLevelReadings.length === 0) {
      toast.error(t('readings.noData'));
      return;
    }

    try {
      // Prepare water level readings data for Excel
      const worksheetData = waterLevelReadings.map((reading: WaterLevelReading) => ({
        [t('readings.selectSite')]: reading.site || '',
        [t('readings.dateAndTime')]: reading.timestamp ? new Date(reading.timestamp).toLocaleString() : '',
        'USWL': reading.uswl ?? '',
        'DSWL1': reading.dswL1 ?? '',
        'DSWL2': reading.dswL2 ?? '',
        [t('readings.battery')]: reading.battery ?? '',
        [t('readings.calculatedFlow')]: reading.calculatedFlow ?? '',
        [t('readings.isManual')]: reading.isManual ? t('common.yes') : t('common.no'),
      }));

      // Generate filename
      const siteNumericId = Number(selectedSiteId);
      const dateSuffix = fromDate && toDate
        ? `_${fromDate.toISOString().split('T')[0]}_to_${toDate.toISOString().split('T')[0]}`
        : fromDate
          ? `_from_${fromDate.toISOString().split('T')[0]}`
          : toDate
            ? `_to_${toDate.toISOString().split('T')[0]}`
            : '';
      const filename = `water_level_readings_site_${siteNumericId}${dateSuffix}.xlsx`;

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, t('readings.waterLevel'));

      // Generate Excel file and download (client-side, no API call)
      XLSX.writeFile(workbook, filename);
      toast.success(t('readings.exportSuccess'));
    } catch (error: any) {
      console.error('Error exporting water level data', error);
      toast.error(t('readings.exportError'));
    }
  };

  const handlePumpStationExport = () => {
    if (!selectedSiteId) {
      toast.error(t('readings.selectSiteFirst'));
      return;
    }

    if (!pumpStationReadings || pumpStationReadings.length === 0) {
      toast.error(t('readings.noData'));
      return;
    }

    try {
      // Prepare pump station readings data for Excel
      const worksheetData = pumpStationReadings.map((reading: PumpStationReading) => {
        const pumpData: any = {
          [t('readings.selectSite')]: reading.site || '',
          [t('readings.dateAndTime')]: reading.timestamp ? new Date(reading.timestamp).toLocaleString('ar-SA') : '',
          [t('readings.usLevel')]: reading.usLevel ?? '',
          [t('readings.ds1Level')]: reading.ds1Level ?? '',
          [t('readings.ds2Level')]: reading.ds2Level ?? '',
          [t('readings.totalUptime')]: reading.totalUptime ?? '',
          [t('readings.totalFlow')]: reading.totalFlow ?? '',
          [t('readings.recordNumber')]: reading.recordNumber ?? '',
          [t('readings.isManual')]: reading.isManual ? t('common.yes') : t('common.no'),
        };

        // Add pump data for each pump
        reading.pumps.forEach((pump, index) => {
          pumpData[`${t('readings.pumpNumber')} ${index + 1} - ${t('readings.pumpUptime')}`] = pump.time ?? '';
          pumpData[`${t('readings.pumpNumber')} ${index + 1} - ${t('readings.pumpFlow')}`] = pump.flow ?? '';
        });

        return pumpData;
      });

      // Generate filename
      const siteNumericId = Number(selectedSiteId);
      const dateSuffix = fromDate && toDate
        ? `_${fromDate.toISOString().split('T')[0]}_to_${toDate.toISOString().split('T')[0]}`
        : fromDate
          ? `_from_${fromDate.toISOString().split('T')[0]}`
          : toDate
            ? `_to_${toDate.toISOString().split('T')[0]}`
            : '';
      const filename = `pump_station_readings_site_${siteNumericId}${dateSuffix}.xlsx`;

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, t('readings.pumpStation'));

      // Generate Excel file and download (client-side, no API call)
      XLSX.writeFile(workbook, filename);
      toast.success(t('readings.exportSuccess'));
    } catch (error: any) {
      console.error('Error exporting pump station data', error);
      toast.error(t('readings.exportError'));
    }
  };

  return (
    <div className="space-y-6" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
      {/* {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
          <Loader />
        </div>
      )} */}
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('readings.title')}</h2>
          <p className="text-gray-500 mt-1">{t('readings.subtitle')}</p>
        </div>


      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedSiteId} onValueChange={setSelectedSiteId} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
              <SelectTrigger className="rtl:flex-row-reverse">
                <SelectValue placeholder={t('readings.selectSite')} />
              </SelectTrigger>
              <SelectContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                {sites.map(site => (
                  <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <DatePicker
                placeholder={t('readings.fromDate')}
                value={fromDate}
                onChange={setFromDate}
                maxDate={toDate}
              />
              <DatePicker
                placeholder={t('readings.toDate')}
                value={toDate}
                onChange={setToDate}
                minDate={fromDate}
              />
              {(fromDate || toDate) && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleResetDates}
                  title={t('readings.resetDates')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="waterLevel" className="cursor-pointer">
      {t('readings.waterLevel')}
    </TabsTrigger>
    <TabsTrigger
      value="pumpStation"
      disabled={selectedSite?.data ? !(selectedSite.data.siteType === 'Pumps' || (selectedSite.data.numPumps && selectedSite.data.numPumps > 0)) : false}
      className="cursor-pointer"
    >
      {t('readings.pumpStation')}
    </TabsTrigger>
  </TabsList>

  <TabsContent value="waterLevel" className="mt-6">
    {isInitialLoading || isLoadingWaterLevel ? (
      <div className="flex justify-center items-center h-48">
        <Loader />
      </div>
    ) : (
      <WaterLevelTable
        readings={waterLevelReadings}
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        sites={sites}
        handleExport={handleWaterLevelExport}
        isEditWaterLevelOpen={isEditWaterLevelOpen}
        setIsEditWaterLevelOpen={setIsEditWaterLevelOpen}
        editingWaterLevel={editingWaterLevel}
        handleEditWaterLevel={handleEditWaterLevel}
        isLoading={isLoading || isLoadingWaterLevel}
        error={waterLevelError}
        createWaterLevelReading={createWaterLevelReading}
        updateWaterLevelReading={updateWaterLevelReading}
        selectedSiteId={selectedSiteId}
        fetchWaterLevelReadings={fetchWaterLevelReadings}
        fromDate={fromDate}
        toDate={toDate}
        pageNumber={waterLevelPageNumber}
        setPageNumber={setWaterLevelPageNumber}
        pageSize={waterLevelPageSize}
        setPageSize={setWaterLevelPageSize}
        totalPages={waterLevelTotalPages}
        totalCount={waterLevelTotalCount}
      />
    )}
  </TabsContent>

  <TabsContent value="pumpStation" className="mt-6">
    {isInitialLoading || isLoadingPumpStation ? (
      <div className="flex justify-center items-center h-48">
        <Loader />
      </div>
    ) : (
      <PumpStationTable
        readings={pumpStationReadings}
        // onViewDetails={handleViewPumpDetails} // Removed, now handled internally by PumpStationTable
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        sites={sites}
        handleExport={handlePumpStationExport}
        isEditPumpStationOpen={isEditPumpStationOpen}
        setIsEditPumpStationOpen={setIsEditPumpStationOpen}
        editingPumpStation={editingPumpStation}
        setEditingPumpStation={setEditingPumpStation}
        handleEditPumpStation={handleEditPumpStation}
        selectedSiteId={selectedSiteId}
        startDate={fromDate ?? undefined}
        endDate={toDate ?? undefined}
        isLoading={isLoading || isLoadingPumpStation}
        error={pumpStationError}
        fetchPumpStationReadings={fetchPumpStationReadings}
        createPumpStationReading={createPumpStationReading}
        updatePumpStationReading={updatePumpStationReading}
        selectedSite={selectedSite?.data ?? null}
        handleEditPump={handleEditPump} // Pass handleEditPump from useReadingsData
        pageNumber={pumpStationPageNumber}
        setPageNumber={setPumpStationPageNumber}
        pageSize={pumpStationPageSize}
        setPageSize={setPumpStationPageSize}
        totalPages={pumpStationTotalPages}
        totalCount={pumpStationTotalCount}
      />
    )}
  </TabsContent>
</Tabs>


      {/* Pump Details Dialog */}
      {/* <Dialog open={isPumpDetailsOpen} onOpenChange={setIsPumpDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]" dir="rtlI">
          <DialogHeader>
            <DialogTitle className="text-right">تفاصيل قراءات المرفعات</DialogTitle>
            <DialogDescription className="text-right">
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
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedReading?.pumps.map((pump, index) => (
                  <TableRow key={index}>
                    <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('readings.pumpNumber')} {index + 1}</TableCell>
                    <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{pump.time.toFixed(1)}</TableCell>
                    <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{pump.flow.toFixed(1)}</TableCell>
                    <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
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
      </Dialog> */}
    </div>
  );
}