import { useState, useEffect, useCallback } from 'react';
import type { WaterLevelReading, PumpStationReading, SiteLookupOption, WaterLevelReadingApiResponse } from '../types';
import { toast } from 'react-toastify';
import apiService, { ApiResponse } from '../../../shared/utils/apiService';

export function useReadingsData() {
  const [selectedReading, setSelectedReading] = useState<PumpStationReading | null>(null);
  const [selectedPumpIndex, setSelectedPumpIndex] = useState<number | null>(null); 
  const [isPumpDetailsOpen, setIsPumpDetailsOpen] = useState(false);
  const [isPumpEditOpen, setIsPumpEditOpen] = useState(false);
  
  const [sites, setSites] = useState<SiteLookupOption[]>([]);
  const [sitesError, setSitesError] = useState<string | null>(null);

  const [waterLevelReadings, setWaterLevelReadings] = useState<WaterLevelReading[]>([]);
  const [waterLevelLoading, setWaterLevelLoading] = useState<boolean>(false);
  const [waterLevelError, setWaterLevelError] = useState<string | null>(null);
  
  const [pumpStationLoading, setPumpStationLoading] = useState<boolean>(false);
  const [pumpStationError, setPumpStationError] = useState<string | null>(null);

  // Edit dialog states
  const [isEditPumpStationOpen, setIsEditPumpStationOpen] = useState(false);
  const [editingPumpStation, setEditingPumpStation] = useState<PumpStationReading | null>(null);
  const [isEditWaterLevelOpen, setIsEditWaterLevelOpen] = useState(false);
  const [editingWaterLevel, setEditingWaterLevel] = useState<WaterLevelReading | null>(null);

  const [pumpStationReadings, setPumpStationReadings] = useState<PumpStationReading[]>([
    { 
      id: 1, 
      site: 'محطة رفع - الجيزة 01', 
      timestamp: '2025-11-03 11:00',
      pumps: [
        { time: 3.5, flow: 45.2 },
        { time: 4.2, flow: 48.1 },
        { time: 0, flow: 0 },
      ],
      totalUptime: 7.7,
      totalFlow: 93.3,
      hasAlarm: false
    },
    { 
      id: 2, 
      site: 'محطة رفع - الدقهلية 02', 
      timestamp: '2025-11-03 11:00',
      pumps: [
        { time: 5.0, flow: 52.3 },
        { time: 4.8, flow: 50.1 },
        { time: 3.2, flow: 38.5 },
      ],
      totalUptime: 13.0,
      totalFlow: 140.9,
      hasAlarm: false
    },
  ]);

  const handleViewPumpDetails = (reading: PumpStationReading) => {
    setSelectedReading(reading);
    setIsPumpDetailsOpen(true);
  };
  const handleEditPump = (pumpIndex: number) => {
    setSelectedPumpIndex(pumpIndex);
    setIsPumpEditOpen(true);
    setIsPumpDetailsOpen(false);
  };
  
  const handleEditPumpStation = (reading: PumpStationReading) => {
    setEditingPumpStation(reading);
    setIsEditPumpStationOpen(true);
  };
  
  const handleEditWaterLevel = (reading: WaterLevelReading) => {
    setEditingWaterLevel(reading);
    setIsEditWaterLevelOpen(true);
  };
  
  const handleExport = () => {
    toast.info('سيتم تصدير البيانات إلى ملف Excel');
  };

  interface CreateWaterLevelReadingRequest {
    siteId: number;
    timestamp: string;
    timePerHour: number;
    recordNumber: number;
    uswl: number;
    dswL1: number;
    dswL2: number;
    battery: number;
    isManual: boolean;
  }

  interface CreatePumpStationReadingRequest {
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
  }

  const createWaterLevelReading = useCallback(
    async (data: CreateWaterLevelReadingRequest) => {
      try {
        const response = await apiService.post<ApiResponse<any>>(
          '/v1/readings/water-level',
          data
        );
        toast.success('تم إضافة القراءة بنجاح');
        return response;
      } catch (error: any) {
        console.error('Error creating water level reading', error);
        const errorMessage = error?.message || 'حدث خطأ أثناء إضافة القراءة';
        toast.error(errorMessage);
        throw error;
      }
    },
    []
  );

  interface UpdateWaterLevelReadingRequest extends CreateWaterLevelReadingRequest {
    id: number;
  }

  interface UpdatePumpStationReadingRequest extends CreatePumpStationReadingRequest {
    id: number;
  }

  const updateWaterLevelReading = useCallback(
    async (data: UpdateWaterLevelReadingRequest) => {
      try {
        const response = await apiService.put<ApiResponse<any>>(
          `/v1/readings/water-level/${data.id}`,
          data
        );
        toast.success('تم تحديث القراءة بنجاح');
        return response;
      } catch (error: any) {
        console.error('Error updating water level reading', error);
        const errorMessage = error?.message || 'حدث خطأ أثناء تحديث القراءة';
        toast.error(errorMessage);
        throw error;
      }
    },
    []
  );

  const createPumpStationReading = useCallback(
    async (data: CreatePumpStationReadingRequest) => {
      try {
        const response = await apiService.post<ApiResponse<any>>(
          '/v1/readings/pump-station',
          data
        );
        toast.success('تم إضافة قراءة محطة الرفع بنجاح');
        return response;
      } catch (error: any) {
        console.error('Error creating pump station reading', error);
        const errorMessage = error?.message || 'حدث خطأ أثناء إضافة قراءة محطة الرفع';
        toast.error(errorMessage);
        throw error;
      }
    },
    []
  );

  const updatePumpStationReading = useCallback(
    async (data: UpdatePumpStationReadingRequest) => {
      try {
        const response = await apiService.put<ApiResponse<any>>(
          `/v1/readings/pump-station/${data.id}`,
          data
        );
        toast.success('تم تحديث قراءة محطة الرفع بنجاح');
        return response;
      } catch (error: any) {
        console.error('Error updating pump station reading', error);
        const errorMessage = error?.message || 'حدث خطأ أثناء تحديث قراءة محطة الرفع';
        toast.error(errorMessage);
        throw error;
      }
    },
    []
  );

  const fetchSitesLookup = useCallback(async () => {
    try {
      setSitesError(null);
      const response = await apiService.get<SiteLookupOption[] | { data: SiteLookupOption[] }>('/v1/Lookups/Lookup/Sites');
      setSites(Array.isArray(response) ? response : (response as { data: SiteLookupOption[] }).data ?? []);
    } catch (error) {
      console.error('Error fetching lookup sites', error);
      setSitesError('تعذر تحميل قائمة المواقع');
    }
  }, []);

  const mapReading = (reading: WaterLevelReadingApiResponse): WaterLevelReading => ({
    id: reading.id,
    siteId: reading.siteId,
    site: reading.siteName,
    timestamp: reading.timestamp,
    uswl: reading.uswl,
    dswl: reading.dswL1,
    battery: reading.battery,
    calculatedFlow: reading.calculatedFlow,
    hasAlarm: false,
    recordNumber: reading.recordNumber,
    isManual: reading.isManual,
    siteConfiguration: reading.siteConfiguration,
  });

  const fetchWaterLevelReadings = useCallback(
    async (siteId?: number, startDate?: string, endDate?: string) => {
      if (!siteId) {
        setWaterLevelReadings([]);
        return;
      }

      const params = new URLSearchParams();
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }
      const query = params.toString();
      const endpoint = `/v1/readings/water-level/site/${siteId}/date-range${query ? `?${query}` : ''}`;

      setWaterLevelLoading(true);
      setWaterLevelError(null);

      try {
        const response = await apiService.get<ApiResponse<WaterLevelReadingApiResponse[]> | WaterLevelReadingApiResponse[]>(endpoint);

        const payload = Array.isArray(response)
          ? response
          : Array.isArray(response.data)
            ? response.data
            : [];

        setWaterLevelReadings(payload.map(mapReading));
      } catch (error: any) {
        console.error('Error fetching water level readings', error);
        setWaterLevelError(error?.message || 'حدث خطأ أثناء جلب القراءات');
        setWaterLevelReadings([]);
      } finally {
        setWaterLevelLoading(false);
      }
    },
    []
  );

  const fetchPumpStationReadings = useCallback(
    async (siteId?: number, startDate?: string, endDate?: string) => {
      if (!siteId) {
        setPumpStationReadings([]);
        return;
      }

      const params = new URLSearchParams();
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }
      const query = params.toString();
      const endpoint = `/v1/readings/pump-station/site/${siteId}/date-range${query ? `?${query}` : ''}`;

      setPumpStationLoading(true);
      setPumpStationError(null);

      try {
        const response = await apiService.get<ApiResponse<PumpStationReading[]> | PumpStationReading[]>(endpoint);

        const payload = Array.isArray(response)
          ? response
          : Array.isArray(response.data)
            ? response.data
            : [];

        setPumpStationReadings(payload);
      } catch (error: any) {
        console.error('Error fetching pump station readings', error);
        setPumpStationError(error?.message || 'حدث خطأ أثناء جلب قراءات محطات الرفع');
        setPumpStationReadings([]);
      } finally {
        setPumpStationLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSitesLookup();
  }, [fetchSitesLookup]);

  return {
    waterLevelReadings,
    waterLevelLoading,
    waterLevelError,
    fetchWaterLevelReadings,
    createWaterLevelReading,
    updateWaterLevelReading,
    pumpStationReadings,
    setPumpStationReadings,
    pumpStationLoading,
    pumpStationError,
    fetchPumpStationReadings,
    createPumpStationReading,
    updatePumpStationReading,
    sites,
    setSites,
    sitesError,
    handleViewPumpDetails,
    handleEditPump,
    handleExport,
    // Edit dialog state and handlers
    isEditPumpStationOpen,
    setIsEditPumpStationOpen,
    editingPumpStation,
    setEditingPumpStation,
    handleEditPumpStation,
    isEditWaterLevelOpen,
    setIsEditWaterLevelOpen,
    editingWaterLevel,
    setEditingWaterLevel,
    handleEditWaterLevel,
  };
}
