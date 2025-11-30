import { useState, useEffect, useCallback } from 'react';
import type { WaterLevelReading, PumpStationReading, SiteLookupOption, WaterLevelReadingApiResponse, PumpStationApiResponse, CreatePumpStationReadingRequest } from '../types';
import { toast } from 'react-toastify';
import apiService, { ApiResponse } from '../../../shared/utils/apiService';
import type { Site } from '../../sites/types';

export function useReadingsData(selectedSiteId: string) {
  const [selectedReading, setSelectedReading] = useState<PumpStationReading | null>(null);
  const [selectedPumpIndex, setSelectedPumpIndex] = useState<number | null>(null);
  const [isPumpDetailsOpen, setIsPumpDetailsOpen] = useState(false);
  const [isPumpEditOpen, setIsPumpEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // General loading state for data operations (create/update/export)
  const [isLoadingSites, setIsLoadingSites] = useState(false); // Separate loading state for sites lookup
  const [isLoadingWaterLevel, setIsLoadingWaterLevel] = useState(false); // Loading state for water level readings
  const [isLoadingPumpStation, setIsLoadingPumpStation] = useState(false); // Loading state for pump station readings

  const [sites, setSites] = useState<SiteLookupOption[]>([]);
  const [sitesError, setSitesError] = useState<string | null>(null);

  const [waterLevelReadings, setWaterLevelReadings] = useState<WaterLevelReading[]>([]);
  const [waterLevelError, setWaterLevelError] = useState<string | null>(null);

  const [pumpStationError, setPumpStationError] = useState<string | null>(null);

  // Edit dialog states
  const [isEditPumpStationOpen, setIsEditPumpStationOpen] = useState(false);
  const [editingPumpStation, setEditingPumpStation] = useState<PumpStationReading | null>(null);
  const [isEditWaterLevelOpen, setIsEditWaterLevelOpen] = useState(false);
  const [editingWaterLevel, setEditingWaterLevel] = useState<WaterLevelReading | null>(null);
  const [selectedSite, setSelectedSite] = useState<ApiResponse<Site> | null>(null);

  const [pumpStationReadings, setPumpStationReadings] = useState<PumpStationReading[]>([]);

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


  const createWaterLevelReading = useCallback(
    async (data: CreateWaterLevelReadingRequest) => {
      setIsLoading(true); // Start loading
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
      } finally {
        setIsLoading(false); // End loading
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
      setIsLoading(true); // Start loading
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
      } finally {
        setIsLoading(false); // End loading
      }
    },
    []
  );

  const createPumpStationReading = useCallback(
    async (data: CreatePumpStationReadingRequest) => {
      setIsLoading(true); // Start loading
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
      } finally {
        setIsLoading(false); // End loading
      }
    },
    []
  );

  const updatePumpStationReading = useCallback(
    async (data: UpdatePumpStationReadingRequest) => {
      setIsLoading(true); // Start loading
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
      } finally {
        setIsLoading(false); // End loading
      }
    },
    []
  );

  const fetchSitesLookup = useCallback(async () => {
    setIsLoadingSites(true); // Use separate loading state for sites
    try {
      setSitesError(null);
      const response = await apiService.get<SiteLookupOption[] | { data: SiteLookupOption[] }>('/v1/Lookups/Lookup/Sites');
      setSites(Array.isArray(response) ? response : (response as { data: SiteLookupOption[] }).data ?? []);
    } catch (error) {
      console.error('Error fetching lookup sites', error);
      setSitesError('تعذر تحميل قائمة المواقع');
    } finally {
      setIsLoadingSites(false); // End loading
    }
  }, []);

  const mapReading = (reading: WaterLevelReadingApiResponse): WaterLevelReading => ({
    id: reading.id,
    siteId: reading.siteId,
    site: reading.siteName,
    timestamp: reading.timestamp,
    uswl: reading.uswl,
    dswL1: reading.dswL1,
    dswL2: reading.dswL2,
    battery: reading.battery,
    calculatedFlow: reading.calculatedFlow,
    hasAlarm: false,
    recordNumber: reading.recordNumber,
    isManual: reading.isManual,
    siteConfiguration: reading.siteConfiguration,
    alarms: reading.alarms, // Include alarms in mapping
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

      setIsLoadingWaterLevel(true); // Use separate loading state
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
        setIsLoadingWaterLevel(false); // End loading
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

      setIsLoadingPumpStation(true); // Use separate loading state
      setPumpStationError(null);

      try {
        const response = await apiService.get<ApiResponse<PumpStationApiResponse[]> | PumpStationApiResponse[]>(endpoint);

        const payload = Array.isArray(response)
          ? response
          : Array.isArray(response.data)
            ? response.data
            : [];

        setPumpStationReadings(payload.map((reading: PumpStationApiResponse) => ({
          id: reading.id,
          site: reading.siteName,
          siteId: reading.siteId, // Include siteId in mapping
          timestamp: reading.timestamp,
          timePerHour: reading.timePerHour, // Include timePerHour in mapping
          recordNumber: reading.recordNumber, // Include recordNumber in mapping
          usLevel: reading.usLevel,
          ds1Level: reading.ds1Level,
          ds2Level: reading.ds2Level,
          pumps: [
            { time: reading.p1_Time, flow: reading.p1_Flow },
            { time: reading.p2_Time, flow: reading.p2_Flow },
            { time: reading.p3_Time, flow: reading.p3_Flow },
            { time: reading.p4_Time, flow: reading.p4_Flow },
            { time: reading.p5_Time, flow: reading.p5_Flow },
            { time: reading.p6_Time, flow: reading.p6_Flow },
            { time: reading.p7_Time, flow: reading.p7_Flow },
            { time: reading.p8_Time, flow: reading.p8_Flow },
            { time: reading.p9_Time, flow: reading.p9_Flow },
            { time: reading.p10_Time, flow: reading.p10_Flow },
          ].filter(pump => pump.time > 0 || pump.flow > 0),
          totalUptime: reading.totalUptime,
          totalFlow: reading.totalFlow,
          hasAlarm: false, // Assuming no alarm status in API for now
          isManual: reading.isManual, // Include isManual in mapping
          alarms: reading.alarms, // Include alarms in mapping
        })));
      } catch (error: any) {
        console.error('Error fetching pump station readings', error);
        setPumpStationError(error?.message || 'حدث خطأ أثناء جلب قراءات محطات الرفع');
        setPumpStationReadings([]);
      } finally {
        setIsLoadingPumpStation(false); // End loading
      }
    },
    []
  );

  useEffect(() => {
    fetchSitesLookup();
  }, [fetchSitesLookup]);

  useEffect(() => {
    const fetchSelectedSiteDetails = async () => {
      if (selectedSiteId) {
        try {
          const response = await apiService.get<ApiResponse<Site>>(`/v1/Sites/${selectedSiteId}`);
          setSelectedSite(response);
        } catch (err) {
          console.error("Failed to fetch selected site details:", err);
          setSelectedSite(null);
        }
      }
    };

    fetchSelectedSiteDetails();
  }, [selectedSiteId]);

  return {
    waterLevelReadings,
    waterLevelError,
    fetchWaterLevelReadings,
    createWaterLevelReading,
    updateWaterLevelReading,
    pumpStationReadings,
    setPumpStationReadings,
    pumpStationError,
    fetchPumpStationReadings,
    createPumpStationReading,
    updatePumpStationReading,
    sites,
    setSites,
    sitesError,
    handleViewPumpDetails,
    handleEditPump,
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
    selectedSite,
    isLoading, // For create/update/export operations
    isLoadingWaterLevel, // For water level readings fetch
    isLoadingPumpStation, // For pump station readings fetch
    isLoadingSites, // For sites lookup
  };
}
