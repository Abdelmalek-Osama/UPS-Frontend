import React, { useState, useEffect } from 'react';
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
import type { PumpStationReading } from '../types';
import { DatePicker } from '../../../components/ui/datepicker';
import Loader from '../../../components/ui/Loader';
import { formatDateTimeForAPI } from '../utils/utils';

export function ReadingsManagement() {
  const [activeTab, setActiveTab] = useState('waterLevel');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const {
    handleExport,
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
    isLoading, // Use the consolidated isLoading state
    waterLevelError,
    pumpStationError,
    fetchPumpStationReadings,
    createPumpStationReading,
    updatePumpStationReading,
    selectedSite,
  } = useReadingsData(selectedSiteId);

  useEffect(() => {
    if (sites.length > 0 && !selectedSiteId) {
      setSelectedSiteId(String(sites[0].id));
    }
  }, [sites, selectedSiteId]);

  const formatDate = (date?: Date) => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  
  const [fromDate, setFromDate] = useState<Date | undefined>(() => {
    const storedFromDate = localStorage.getItem('fromDate');
    return storedFromDate ? new Date(storedFromDate) : undefined;
  });
  const [toDate, setToDate] = useState<Date | undefined>(() => {
    const storedToDate = localStorage.getItem('toDate');
    return storedToDate ? new Date(storedToDate) : undefined;
  });

  useEffect(() => {
    if (fromDate) {
      localStorage.setItem('fromDate', fromDate.toISOString());
    } else {
      localStorage.removeItem('fromDate');
    }
    if (toDate) {
      localStorage.setItem('toDate', toDate.toISOString());
    } else {
      localStorage.removeItem('toDate');
    }
  }, [fromDate, toDate]);

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
    fetchWaterLevelReadings(siteNumericId, fromDate ? formatDate(fromDate) : undefined, toDate ? formatDate(toDate) : undefined);
  }, [selectedSiteId, fromDate, toDate, fetchWaterLevelReadings]);

  // Added useEffect for fetching pump station readings
  useEffect(() => {
    if (!selectedSiteId) {
      return;
    }
    const siteNumericId = Number(selectedSiteId);
    if (Number.isNaN(siteNumericId)) {
      return;
    }

    let apiFromDate = fromDate;
    let apiToDate = toDate;

    if (apiFromDate === undefined || apiToDate === undefined) {
      // If both are undefined, use the default 10-hour range for the API call
      apiToDate = new Date();
      apiFromDate = new Date();
      apiFromDate.setHours(apiFromDate.getHours() - 10);
    }

    fetchPumpStationReadings(
      siteNumericId,
      apiFromDate ? formatDateTimeForAPI(apiFromDate) : undefined,
      apiToDate ? formatDateTimeForAPI(apiToDate, true) : undefined
    );
  }, [selectedSiteId, fromDate, toDate, fetchPumpStationReadings]);


  // const handleViewPumpDetails = (reading: PumpStationReading) => {
  //   setSelectedReading(reading);
  //   setIsPumpDetailsOpen(true);
  // };

  const handleResetDates = () => {
    setFromDate(undefined);
    setToDate(undefined);
    localStorage.removeItem('fromDate');
    localStorage.removeItem('toDate');
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
          <Loader />
        </div>
      )} */}
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة القراءات</h2>
          <p className="text-gray-500 mt-1">عرض وتحرير قراءات المواقع</p>
        </div>
        
        
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الموقع" />
              </SelectTrigger>
              <SelectContent>
                {sites.map(site => (
                  <SelectItem key={site.id} value={String(site.id)}>{site.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <DatePicker
                placeholder="من تاريخ"
                value={fromDate}
                onChange={setFromDate}
                maxDate={toDate}
              />
              <DatePicker
                placeholder="الى تاريخ"
                value={toDate}
                onChange={setToDate}
                minDate={fromDate}
              />
              {(fromDate || toDate) && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleResetDates}
                  title="إعادة تعيين التواريخ"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="waterLevel">قراءات القناطر</TabsTrigger>
          <TabsTrigger 
            value="pumpStation" 
            disabled={selectedSite?.data?.numPumps === 0}
          >قراءات محطات رفع</TabsTrigger>
        </TabsList>

        <TabsContent value="waterLevel" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader />
            </div>
          ) : (
            <WaterLevelTable 
              readings={waterLevelReadings} 
              isAddDialogOpen={isAddDialogOpen} 
              setIsAddDialogOpen={setIsAddDialogOpen}
              sites={sites}
              handleExport={handleExport}
              isEditWaterLevelOpen={isEditWaterLevelOpen}
              setIsEditWaterLevelOpen={setIsEditWaterLevelOpen}
              editingWaterLevel={editingWaterLevel}
              handleEditWaterLevel={handleEditWaterLevel}
              isLoading={isLoading}
              error={waterLevelError}
              createWaterLevelReading={createWaterLevelReading}
              updateWaterLevelReading={updateWaterLevelReading}
              selectedSiteId={selectedSiteId}
              fetchWaterLevelReadings={fetchWaterLevelReadings}
              fromDate={fromDate}
              toDate={toDate}
            />
          )}

        </TabsContent>


        <TabsContent value="pumpStation" className="mt-6">
          {isLoading ? (
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
              handleExport={handleExport}
              isEditPumpStationOpen={isEditPumpStationOpen}
              setIsEditPumpStationOpen={setIsEditPumpStationOpen}
              editingPumpStation={editingPumpStation}
              setEditingPumpStation={setEditingPumpStation}
              handleEditPumpStation={handleEditPumpStation}
              selectedSiteId={selectedSiteId}
              startDate={fromDate ?? undefined}
              endDate={toDate ?? undefined}
              isLoading={isLoading}
              error={pumpStationError}
              fetchPumpStationReadings={fetchPumpStationReadings}
              createPumpStationReading={createPumpStationReading}
              updatePumpStationReading={updatePumpStationReading}
              selectedSite={selectedSite?.data ?? null}
              handleEditPump={handleEditPump} // Pass handleEditPump from useReadingsData
            />
          )}
        </TabsContent>
      </Tabs>
      
    
      {/* Pump Details Dialog */}
      {/* <Dialog open={isPumpDetailsOpen} onOpenChange={setIsPumpDetailsOpen}>
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
                {selectedReading?.pumps.map((pump, index) => (
                  <TableRow key={index}>
                    <TableCell>مرفعة {index + 1}</TableCell>
                    <TableCell>{pump.time.toFixed(1)}</TableCell>
                    <TableCell>{pump.flow.toFixed(1)}</TableCell>
                    <TableCell>
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