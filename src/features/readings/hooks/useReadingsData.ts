import { useState, useEffect, useCallback } from 'react';
import type { WaterLevelReading, PumpStationReading, SiteLookupOption, WaterLevelReadingApiResponse, PumpStationApiResponse, CreatePumpStationReadingRequest } from '../types';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import apiService, { ApiResponse } from '../../../shared/utils/apiService';
import type { Site } from '../../sites/types';
import { useAuth } from '../../../shared/contexts/AuthContext'; // Import useAuth

export function useReadingsData(selectedSiteId: string) {
  const { t } = useTranslation();
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

  // Pagination state for water level readings
  const [waterLevelPageNumber, setWaterLevelPageNumber] = useState(1);
  const [waterLevelPageSize, setWaterLevelPageSize] = useState(10);
  const [waterLevelTotalPages, setWaterLevelTotalPages] = useState(0);
  const [waterLevelTotalCount, setWaterLevelTotalCount] = useState(0);

  const [pumpStationError, setPumpStationError] = useState<string | null>(null);
  
  // Pagination state for pump station readings
  const [pumpStationPageNumber, setPumpStationPageNumber] = useState(1);
  const [pumpStationPageSize, setPumpStationPageSize] = useState(10);
  const [pumpStationTotalPages, setPumpStationTotalPages] = useState(0);
  const [pumpStationTotalCount, setPumpStationTotalCount] = useState(0);

  // Edit dialog states
  const [isEditPumpStationOpen, setIsEditPumpStationOpen] = useState(false);
  const [editingPumpStation, setEditingPumpStation] = useState<PumpStationReading | null>(null);
  const [isEditWaterLevelOpen, setIsEditWaterLevelOpen] = useState(false);
  const [editingWaterLevel, setEditingWaterLevel] = useState<WaterLevelReading | null>(null);
  const [selectedSite, setSelectedSite] = useState<ApiResponse<Site> | null>(null);

  const [pumpStationReadings, setPumpStationReadings] = useState<PumpStationReading[]>([]);

  const { isAuthenticated } = useAuth(); // Get isAuthenticated from AuthContext

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
      if (!isAuthenticated) return;
      setIsLoading(true); // Start loading
      try {
        const response = await apiService.post<ApiResponse<any>>(
          '/v1/readings/water-level',
          data
        );
        toast.success(t('readings.createSuccess'));
        return response;
      } catch (error: any) {
        console.error('Error creating water level reading', error);
        const errorMessage = (error as Error).message;
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsLoading(false); // End loading
      }
    },
    [isAuthenticated, t]
  );

  interface UpdateWaterLevelReadingRequest extends CreateWaterLevelReadingRequest {
    id: number;
  }

  interface UpdatePumpStationReadingRequest extends CreatePumpStationReadingRequest {
    id: number;
  }

  const updateWaterLevelReading = useCallback(
    async (data: UpdateWaterLevelReadingRequest) => {
      if (!isAuthenticated) return;
      setIsLoading(true); // Start loading
      try {
        const response = await apiService.post<ApiResponse<any>>(
          `/v1/readings/water-level/${data.id}`,
          data
        );
        toast.success(t('readings.updateSuccess'));
        return response;
      } catch (error: any) {
        console.error('Error updating water level reading', error);
        const errorMessage = (error as Error).message;
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsLoading(false); // End loading
      }
    },
    [isAuthenticated, t]
  );

  const deleteWaterLevelReading = useCallback(
    async (id: number) => {
      if (!isAuthenticated) return;
      setIsLoading(true); // Start loading
      try {
        await apiService.delete<ApiResponse<any>>(`/v1/readings/water-level/${id}`);
        toast.success(t('readings.deleteWaterLevelSuccess'));
      } catch (error: any) {
        console.error('Error deleting water level reading', error);
        const errorMessage = (error as Error).message;
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsLoading(false); // End loading
      }
    },
    [isAuthenticated]
  );

  const createPumpStationReading = useCallback(
    async (data: CreatePumpStationReadingRequest) => {
      if (!isAuthenticated) return;
      setIsLoading(true); // Start loading
      try {
        const response = await apiService.post<ApiResponse<any>>(
          '/v1/readings/pump-station',
          data
        );
        toast.success(t('readings.createPumpSuccess'));
        return response;
      } catch (error: any) {
        console.error('Error creating pump station reading', error);
        const errorMessage = (error as Error).message;
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsLoading(false); // End loading
      }
    },
    [isAuthenticated, t]
  );

  const updatePumpStationReading = useCallback(
    async (data: UpdatePumpStationReadingRequest) => {
      if (!isAuthenticated) return;
      setIsLoading(true); // Start loading
      try {
        const response = await apiService.post<ApiResponse<any>>(
          `/v1/readings/pump-station/${data.id}`,
          data
        );
        toast.success(t('readings.updatePumpSuccess'));
        return response;
      } catch (error: any) {
        console.error('Error updating pump station reading', error);
        const errorMessage = (error as Error).message;
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsLoading(false); // End loading
      }
    },
    [isAuthenticated, t]
  );

  const deletePumpStationReading = useCallback(
    async (id: number) => {
      if (!isAuthenticated) return;
      setIsLoading(true); // Start loading
      try {
        await apiService.delete<ApiResponse<any>>(`/v1/readings/pump-station/${id}`);
        toast.success(t('readings.deletePumpStationSuccess'));
      } catch (error: any) {
        console.error('Error deleting pump station reading', error);
        const errorMessage = (error as Error).message;
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsLoading(false); // End loading
      }
    },
    [isAuthenticated]
  );
  const fetchSitesLookup = useCallback(async (signal?: AbortSignal) => {
    if (!isAuthenticated) {
      setSites([]);
      setIsLoadingSites(false);
      return;
    }
    setIsLoadingSites(true); // Use separate loading state for sites
    try {
      setSitesError(null);
      const response = await apiService.get<SiteLookupOption[] | { data: SiteLookupOption[] }>('/v1/Lookups/Lookup/Sites', { signal });
      if (!signal?.aborted) {
        setSites(Array.isArray(response) ? response : (response as { data: SiteLookupOption[] }).data ?? []);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Fetch sites lookup aborted');
      } else {
        console.error('Error fetching lookup sites', error);
        setSitesError((error as Error).message);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoadingSites(false); // End loading
      }
    }
  }, [isAuthenticated]);

  const mapReading = (reading: WaterLevelReadingApiResponse): WaterLevelReading => ({
    id: reading.id,
    siteId: reading.siteId,
    site: reading.siteName,
    timestamp: reading.timestamp,
    uswl: reading.uswl,
    dswL1: reading.dswL1,
    dswL2: reading.dswL2,
    uswlDisplay: reading.uswlDisplay,
    dswL1Display: reading.dswL1Display,
    dswL2Display: reading.dswL2Display,
    battery: reading.battery,
    calculatedFlow: reading.calculatedFlow,
    hasAlarm: false,
    recordNumber: reading.recordNumber,
    isManual: reading.isManual,
    siteConfiguration: reading.siteConfiguration,
    alarms: reading.alarms, // Include alarms in mapping
  });

  const fetchWaterLevelReadings = useCallback(
    async (
      siteId?: number,
      startDate?: string,
      endDate?: string,
      pageNumber?: number,
      pageSize?: number,
      signal?: AbortSignal
    ) => {
      if (!isAuthenticated || !siteId) {
        setWaterLevelReadings([]);
        setIsLoadingWaterLevel(false);
        return;
      }

      const params = new URLSearchParams();
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }
      if (pageNumber !== undefined) {
        params.append('pagination.PageNumber', pageNumber.toString());
      }
      if (pageSize !== undefined) {
        params.append('pagination.PageSize', pageSize.toString());
      }
      const query = params.toString();
      const endpoint = `/v1/readings/water-level/site/${siteId}/date-range${query ? `?${query}` : ''}`;

      setIsLoadingWaterLevel(true); // Use separate loading state
      setWaterLevelError(null);

      try {
        const response = await apiService.get<
          | ApiResponse<{
              data: WaterLevelReadingApiResponse[];
              pageNumber: number;
              pageSize: number;
              totalCount: number;
              totalPages: number;
            }>
          | {
              data: WaterLevelReadingApiResponse[];
              pageNumber: number;
              pageSize: number;
              totalCount: number;
              totalPages: number;
            }
          | ApiResponse<WaterLevelReadingApiResponse[]>
          | WaterLevelReadingApiResponse[]
        >(endpoint, { signal });

        if (!signal?.aborted) {
          // Handle paginated response
          let payload: WaterLevelReadingApiResponse[] = [];
          let paginationInfo: {
            pageNumber?: number;
            pageSize?: number;
            totalCount?: number;
            totalPages?: number;
          } = {};

          if (response && typeof response === 'object' && 'isSuccess' in response && 'data' in response) {
            const wrappedData = (response as any).data;
            if (wrappedData && typeof wrappedData === 'object' && 'data' in wrappedData) {
              // Paginated response wrapped in ApiResponse
              payload = Array.isArray(wrappedData.data) ? wrappedData.data : [];
              paginationInfo = {
                pageNumber: wrappedData.pageNumber,
                pageSize: wrappedData.pageSize,
                totalCount: wrappedData.totalCount,
                totalPages: wrappedData.totalPages,
              };
            } else if (Array.isArray(wrappedData)) {
              // Non-paginated array wrapped in ApiResponse
              payload = wrappedData;
            }
          } else if (response && typeof response === 'object' && 'data' in response) {
            const data = (response as any).data;
            if (Array.isArray(data)) {
              // Check if pagination info is at the same level
              if ('pageNumber' in response) {
                payload = data;
                paginationInfo = {
                  pageNumber: (response as any).pageNumber,
                  pageSize: (response as any).pageSize,
                  totalCount: (response as any).totalCount,
                  totalPages: (response as any).totalPages,
                };
              } else {
                payload = data;
              }
            } else if (data && typeof data === 'object' && 'data' in data) {
              // Nested paginated structure
              payload = Array.isArray(data.data) ? data.data : [];
              paginationInfo = {
                pageNumber: data.pageNumber,
                pageSize: data.pageSize,
                totalCount: data.totalCount,
                totalPages: data.totalPages,
              };
            }
          } else if (Array.isArray(response)) {
            // Direct array response
            payload = response;
          }

          setWaterLevelReadings(payload.map(mapReading));
          
          // Update pagination state (only output values, not input values)
          if (paginationInfo.totalPages !== undefined) {
            setWaterLevelTotalPages(paginationInfo.totalPages);
          }
          if (paginationInfo.totalCount !== undefined) {
            setWaterLevelTotalCount(paginationInfo.totalCount);
          }
          // Do NOT update pageNumber and pageSize from API response - these are input params that would cause infinite loop
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Fetch water level readings aborted');
        } else {
          console.error('Error fetching water level readings', error);
          setWaterLevelError((error as Error).message);
          setWaterLevelReadings([]);
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoadingWaterLevel(false); // End loading
        }
      }
    },
    [isAuthenticated]
  );

  const fetchPumpStationReadings = useCallback(
    async (
      siteId?: number,
      startDate?: string,
      endDate?: string,
      pageNumber?: number,
      pageSize?: number,
      signal?: AbortSignal
    ) => {
      if (!isAuthenticated || !siteId) {
        setPumpStationReadings([]);
        setIsLoadingPumpStation(false);
        return;
      }

      const params = new URLSearchParams();
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }
      if (pageNumber !== undefined) {
        params.append('pagination.PageNumber', pageNumber.toString());
      }
      if (pageSize !== undefined) {
        params.append('pagination.PageSize', pageSize.toString());
      }
      const query = params.toString();
      const endpoint = `/v1/readings/pump-station/site/${siteId}/date-range${query ? `?${query}` : ''}`;

      setIsLoadingPumpStation(true); // Use separate loading state
      setPumpStationError(null);

      try {
        const response = await apiService.get<
          | ApiResponse<{
              data: PumpStationApiResponse[];
              pageNumber: number;
              pageSize: number;
              totalCount: number;
              totalPages: number;
            }>
          | {
              data: PumpStationApiResponse[];
              pageNumber: number;
              pageSize: number;
              totalCount: number;
              totalPages: number;
            }
          | ApiResponse<PumpStationApiResponse[]>
          | PumpStationApiResponse[]
        >(endpoint, { signal });

        if (!signal?.aborted) {
          // Handle paginated response
          let payload: PumpStationApiResponse[] = [];
          let paginationInfo: {
            pageNumber?: number;
            pageSize?: number;
            totalCount?: number;
            totalPages?: number;
          } = {};

          if (response && typeof response === 'object' && 'isSuccess' in response && 'data' in response) {
            const wrappedData = (response as any).data;
            if (wrappedData && typeof wrappedData === 'object' && 'data' in wrappedData) {
              // Paginated response wrapped in ApiResponse
              payload = Array.isArray(wrappedData.data) ? wrappedData.data : [];
              paginationInfo = {
                pageNumber: wrappedData.pageNumber,
                pageSize: wrappedData.pageSize,
                totalCount: wrappedData.totalCount,
                totalPages: wrappedData.totalPages,
              };
            } else if (Array.isArray(wrappedData)) {
              // Non-paginated array wrapped in ApiResponse
              payload = wrappedData;
            }
          } else if (response && typeof response === 'object' && 'data' in response) {
            const data = (response as any).data;
            if (Array.isArray(data)) {
              // Check if pagination info is at the same level
              if ('pageNumber' in response) {
                payload = data;
                paginationInfo = {
                  pageNumber: (response as any).pageNumber,
                  pageSize: (response as any).pageSize,
                  totalCount: (response as any).totalCount,
                  totalPages: (response as any).totalPages,
                };
              } else {
                payload = data;
              }
            } else if (data && typeof data === 'object' && 'data' in data) {
              // Nested paginated structure
              payload = Array.isArray(data.data) ? data.data : [];
              paginationInfo = {
                pageNumber: data.pageNumber,
                pageSize: data.pageSize,
                totalCount: data.totalCount,
                totalPages: data.totalPages,
              };
            }
          } else if (Array.isArray(response)) {
            // Direct array response
            payload = response;
          }

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
          
          // Update pagination state (only output values, not input values)
          if (paginationInfo.totalPages !== undefined) {
            setPumpStationTotalPages(paginationInfo.totalPages);
          }
          if (paginationInfo.totalCount !== undefined) {
            setPumpStationTotalCount(paginationInfo.totalCount);
          }
          // Do NOT update pageNumber and pageSize from API response - these are input params that would cause infinite loop
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Fetch pump station readings aborted');
        } else {
          console.error('Error fetching pump station readings', error);
          setPumpStationError((error as Error).message);
          setPumpStationReadings([]);
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoadingPumpStation(false); // End loading
        }
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    const abortController = new AbortController();
    fetchSitesLookup(abortController.signal);
    return () => abortController.abort();
  }, [fetchSitesLookup]);

  useEffect(() => {
    const fetchSelectedSiteDetails = async (signal?: AbortSignal) => {
      if (!isAuthenticated) {
        setSelectedSite(null);
        return;
      }
      if (selectedSiteId) {
        try {
          const response = await apiService.get<ApiResponse<Site>>(`/v1/Sites/${selectedSiteId}`, { signal });
          if (!signal?.aborted) {
            setSelectedSite(response);
          }
        } catch (err: any) {
          if (err.name === 'AbortError') {
            console.log('Fetch selected site details aborted');
          } else {
            console.error("Failed to fetch selected site details:", err);
            setSelectedSite(null);
          }
        }
      }
    };

    const abortController = new AbortController();
    fetchSelectedSiteDetails(abortController.signal);
    return () => abortController.abort();
  }, [selectedSiteId, isAuthenticated]);

  return {
    waterLevelReadings,
    waterLevelError,
    fetchWaterLevelReadings,
    createWaterLevelReading,
    updateWaterLevelReading,
    deleteWaterLevelReading,
    // Pagination state for water level readings
    waterLevelPageNumber,
    setWaterLevelPageNumber,
    waterLevelPageSize,
    setWaterLevelPageSize,
    waterLevelTotalPages,
    waterLevelTotalCount,
    pumpStationReadings,
    setPumpStationReadings,
    pumpStationError,
    fetchPumpStationReadings,
    createPumpStationReading,
    updatePumpStationReading,
    deletePumpStationReading,
    // Pagination state for pump station readings
    pumpStationPageNumber,
    setPumpStationPageNumber,
    pumpStationPageSize,
    setPumpStationPageSize,
    pumpStationTotalPages,
    pumpStationTotalCount,
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
