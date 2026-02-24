import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../../../components/ui/sheet';
import { Label } from '../../../components/ui/label';
import { 
  Download, 
  AlertTriangle,
  Bell,
  Calendar as CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Calendar } from '../../../components/ui/calendar';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import apiService from '../../../shared/utils/apiService';
import Loader from '../../../components/ui/Loader';
import { useSitesLookup } from '../hooks/useSitesLookup';
import { SiteSingleSelectDropdown } from '../../sites/components/SiteSingleSelectDropdown';
import { useAuth } from '../../../shared/contexts/AuthContext';

type SeverityOption = 'warning' | 'critical' | 'info';

interface AlarmEventResponseDto {
  id: number;
  alarmId: number;
  alarmName: string;
  siteId: number;
  siteName: string;
  waterLevelReadingId?: number;
  pumpStationReadingId?: number;
  fieldName: string;
  thresholdValue?: number;
  actualValue?: number;
  triggeredAt: string;
  message: string;
  isResolved: boolean;
  severity?: string;
  colorCode?: string;
}

type AlarmEventsApiResponse =
  | AlarmEventResponseDto[]
  | { data: AlarmEventResponseDto[] }
  | { isSuccess: boolean; data: AlarmEventResponseDto[] }
  | { 
      data: AlarmEventResponseDto[];
      pageNumber: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    }
  | {
      isSuccess: boolean;
   data: {
        data: AlarmEventResponseDto[];
      pageNumber: number;
        pageSize: number;
        totalCount: number;
    totalPages: number;
      };
    };

interface AlarmEvent {
  id: number;
  alarmName: string;
  siteId?: number;
  siteName: string;
  fieldName: string;
  value?: number;
  thresholdValue?: number;
  severity: SeverityOption;
  colorCode?: string;
  triggeredAt: string;
  message: string;
}

export function AlarmEvents() {
  const { t, i18n } = useTranslation();
  const { sites, sitesLoading } = useSitesLookup();
  const { currentUser } = useAuth();

  const translateFieldName = (fieldName: string) => {
    const normalized = fieldName.toLowerCase().replace(/_/g, ' ');
    if (normalized === 'communicationloss') {
 return t('alarms.communicationLoss');
    }
    if (normalized === 'battery') {
      return t('alarms.battery');
    }
    if (normalized === 'total flow') {
  return t('alarms.totalFlow');
    }
    if (normalized === 'total uptime') {
      return t('alarms.totalUptime');
    }
    return fieldName;
  };

  const translateAlarmName = (alarmName: string) => {
    return alarmName.replace(/ Alarm$/i, ' ' + t('alarms.alarm'));
  };

  const [selectedEvent, setSelectedEvent] = useState<AlarmEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [activeView, setActiveView] = useState<'table' | 'cards'>('table');
  const [alarmEvents, setAlarmEvents] = useState<AlarmEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (i18n.language === 'en') {
    return format(date, 'MM/dd/yyyy HH:mm:ss');
    } else {
      return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: ar });
    }
  };

  // Helper function to get site name based on language
  const getSiteName = useCallback((siteId?: number, fallbackName?: string) => {
    if (!siteId) return fallbackName || '-';
    const site = sites.find(s => s.id === siteId);
    if (!site) return fallbackName || '-';
 return t('_rtl') === 'rtl' ? site.arabicName || '-' : site.name;
  }, [sites, t]);

  const handleTabChange = (value: string) => {
    setActiveView(value as 'table' | 'cards');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 768) {
      setActiveView('cards');
    }
  }, []);

  const fetchAlarmEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Build query parameters
const params: Record<string, string | number | boolean> = {
    unresolvedOnly: true,
        'pagination.PageNumber': pageNumber,
        'pagination.PageSize': pageSize,
      };

      if (selectedSiteId) {
  params.siteId = selectedSiteId;
      }

      if (dateFrom) {
     params.startDate = dateFrom.toISOString();
      }

      if (dateTo) {
        // Set end date to end of day
        const endDate = new Date(dateTo);
   endDate.setHours(23, 59, 59, 999);
    params.endDate = endDate.toISOString();
      }

      const response = await apiService.get<AlarmEventsApiResponse>(`/v1/alarm-events`, {
  params,
      });

      const severityMap: Record<string | number, SeverityOption> = {
        0: 'warning',
        1: 'critical',
        2: 'info',
   warning: 'warning',
        Warning: 'warning',
        WARN: 'warning',
        critical: 'critical',
        Critical: 'critical',
        CRITICAL: 'critical',
        info: 'info',
        Info: 'info',
        informational: 'info',
      };

      const getEventsPayload = (raw: AlarmEventsApiResponse): {
        events: AlarmEventResponseDto[];
        pageNumber?: number;
        pageSize?: number;
   totalCount?: number;
        totalPages?: number;
      } => {
        // Handle ApiResponse wrapper (isSuccess, data, message)
        if (raw && typeof raw === 'object' && 'isSuccess' in raw && 'data' in raw) {
          const wrappedData = (raw as any).data;
          // Check if wrapped data has pagination info
          if (wrappedData && typeof wrappedData === 'object' && 'data' in wrappedData) {
            return {
         events: Array.isArray(wrappedData.data) ? wrappedData.data : [],
        pageNumber: wrappedData.pageNumber,
        pageSize: wrappedData.pageSize,
            totalCount: wrappedData.totalCount,
          totalPages: wrappedData.totalPages,
        };
        }
          // If wrapped data is array (non-paginated)
          if (Array.isArray(wrappedData)) {
 return { events: wrappedData };
          }
        }
        
        // Handle direct paginated response (data, pageNumber, pageSize, etc.)
        if (raw && typeof raw === 'object' && 'data' in raw) {
          const data = (raw as any).data;
          // Check if data has pagination info (nested structure)
    if (data && typeof data === 'object' && 'data' in data) {
            return {
        events: Array.isArray(data.data) ? data.data : [],
        pageNumber: data.pageNumber,
   pageSize: data.pageSize,
              totalCount: data.totalCount,
     totalPages: data.totalPages,
            };
        }
  // Check if data is array and pagination info is at same level
          if (Array.isArray(data)) {
    return {
            events: data,
  pageNumber: (raw as any).pageNumber,
      pageSize: (raw as any).pageSize,
         totalCount: (raw as any).totalCount,
           totalPages: (raw as any).totalPages,
 };
          }
        }
    
        // Fallback for non-paginated array response
  if (Array.isArray(raw)) {
    return { events: raw };
    }
        
        return { events: [] };
      };

      const result = getEventsPayload(response);

const mappedEvents: AlarmEvent[] = result.events.map((event) => {
        const isCommunicationLoss = event.fieldName.toLowerCase().replace(/[_\s]/g, '').includes('communicationloss');
        const baseSeverity = severityMap[event.severity ?? ''] ?? 'info';
        
        return {
          id: event.id,
          alarmName: event.alarmName,
          siteId: event.siteId,
          siteName: event.siteName,
          fieldName: event.fieldName,
          value: event.actualValue ?? undefined,
          thresholdValue: event.thresholdValue ?? undefined,
          severity: isCommunicationLoss ? 'info' : baseSeverity,
          colorCode: event.colorCode ?? '#d1d5db',
          triggeredAt: event.triggeredAt,
          message: event.message,
        };
      });

      // Filter events for operators based on their assigned sites
      let filteredEvents = mappedEvents;
      if (currentUser?.role === 'Operator' && currentUser?.sites) {
        const assignedSiteIds = currentUser.sites.map(site => site.id);
        filteredEvents = mappedEvents.filter(event => 
          event.siteId && assignedSiteIds.includes(event.siteId)
        );
      }

      setAlarmEvents(filteredEvents);
      
      // Update pagination state
      if (result.totalPages !== undefined) {
  setTotalPages(result.totalPages);
      }
      if (result.totalCount !== undefined) {
        setTotalCount(result.totalCount);
      }
 } catch (err) {
      setError((err as Error).message);
    } finally {
   setIsLoading(false);
    }
  }, [pageNumber, pageSize, selectedSiteId, dateFrom, dateTo, currentUser]);

  useEffect(() => {
    fetchAlarmEvents();
  }, [fetchAlarmEvents]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (pageNumber !== 1) {
      setPageNumber(1);
    }
}, [selectedSiteId, dateFrom, dateTo, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
  setPageNumber(newPage);
 }
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number(newSize));
    setPageNumber(1); // Reset to first page when page size changes
  };

  const handleClearFilters = () => {
    setSelectedSiteId(null);
    setDateFrom(undefined);
    setDateTo(undefined);
    setPageNumber(1);
  };

  const hasActiveFilters = selectedSiteId !== null || dateFrom !== undefined || dateTo !== undefined;

  const getSeverityBadge = (severity: 'warning' | 'critical' | 'info') => {
  const config = {
      critical: { label: t('alarms.critical'), className: 'bg-red-100 text-red-700 border-red-300' },
      warning: { label: t('alarms.warning'), className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      info: { label: t('alarms.info'), className: 'bg-blue-100 text-blue-700 border-blue-300' }
    };
    return (
      <Badge className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden ${config[severity].className}`}>
        {config[severity].label}
      </Badge>
    );
  };

  const handleRowClick = (event: AlarmEvent) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  const handleRefresh = () => {
    fetchAlarmEvents();
  };

  const handleExport = () => {
    alert('سيتم تصدير أحداث التنبيهات إلى ملف CSV');
  };

  return (
    <div className="space-y-6" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <Card>
 <CardHeader>
       <div className="flex items-start justify-between">
       <div>
           <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
    {t('alarms.events')}
    </CardTitle>
       <p className="text-sm text-gray-500 mt-2">
        {t('alarms.eventsDescription')}
           </p>
            </div>
    </div>
        </CardHeader>
  </Card>

      {/* Filters Card */}
      <Card>
        {/* <CardHeader>
          <CardTitle className="text-lg">{t('common.filters')}</CardTitle>
 </CardHeader> */}
        <CardContent className="pt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
{/* Site Filter */}
  <div className="space-y-2">
              {/* <Label>{t('readings.site')}</Label> */}
              <SiteSingleSelectDropdown 
   sites={sites}
        sitesLoading={sitesLoading}
         selectedSiteId={selectedSiteId}
        onSiteSelect={setSelectedSiteId}
    placeholder={t('readings.selectSite')}
      allowClear={true}
              />
     </div>

      {/* Date Range - Side by Side */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
   {/* Date From */}
              <div className="space-y-2 flex-1">
           {/* <Label>{t('readings.fromDate')}</Label> */}


    <Popover>
              <PopoverTrigger asChild>
           <Button
   variant="outline"
  className={`w-full justify-start text-left font-normal ${!dateFrom ? 'text-gray-500' : ''}`}
            dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
          >
       <CalendarIcon className={`${t('_rtl') === 'rtl' ? 'ml-2' : 'mr-2'} h-4 w-4`} />
              {dateFrom ? format(dateFrom, i18n.language === 'en' ? 'MM/dd/yyyy' : 'dd/MM/yyyy', i18n.language === 'ar' ? { locale: ar } : {}) : t('readings.fromDate')}

  </Button>
                  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
  <Calendar
    mode="single"
    selected={dateFrom}
    onSelect={setDateFrom}
    initialFocus
    locale={i18n.language === 'ar' ? ar : undefined}
  />
</PopoverContent>

           </Popover>
   </div>

              {/* Date To */}
    <div className="space-y-2 flex-1">
         {/* <Label>{t('readings.toDate')}</Label> */}

         <Popover>
  <PopoverTrigger asChild>
        <Button
    variant="outline"
            className={`w-full justify-start text-left font-normal ${!dateTo ? 'text-gray-500' : ''}`}
        dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
        >
    <CalendarIcon className={`${t('_rtl') === 'rtl' ? 'ml-2' : 'mr-2'} h-4 w-4`} />
             {dateTo ? format(dateTo, i18n.language === 'en' ? 'MM/dd/yyyy' : 'dd/MM/yyyy', i18n.language === 'ar' ? { locale: ar } : {}) : t('readings.toDate')}
                    </Button>
  </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
  <Calendar
    mode="single"
    selected={dateTo}
    onSelect={setDateTo}
    initialFocus
    locale={i18n.language === 'ar' ? ar : undefined}
  />
</PopoverContent>

      </Popover>
         </div>
     </div>
     </div>

    {/* Clear Filters Button */}
        {hasActiveFilters && (
      <div className="mt-4 flex justify-end">
 <Button variant="outline" onClick={handleClearFilters} size="sm">
      <X className={`h-4 w-4 ${t('_rtl') === 'rtl' ? 'ml-2' : 'mr-2'}`} />
        {t('common.clearFilters')}
              </Button>
            </div>
          )}
    </CardContent>
      </Card>



      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader />
        </div>
 ) : error ? (
        <Card className="border-red-500 bg-red-50 text-red-800 p-4 mt-6" dir="rtl">
  <CardContent className="pt-6">
            <div className="flex items-center justify-between">
  <p className="text-sm text-red-600 mt-1">{error}</p>
         </div>
      <div className="flex gap-2">
     <Button onClick={handleRefresh}>{t('common.retry')}</Button>
    </div>
        </CardContent>
 </Card>
      ) : (
        alarmEvents.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="bg-gray-100 p-6 rounded-full">
   <Bell className="h-12 w-12 text-gray-400" />
      </div>
              <div>
           <h3 className="text-lg mb-2">{t('alarms.noEvents')}</h3>
        <p className="text-gray-500 text-sm">
        {hasActiveFilters
      ? t('alarms.noEventsMatchFilters')
        : t('alarms.noEventsYet')}
       </p>
    </div>
            </div>
   </CardContent>
        </Card>
        ) : (
        <Tabs value={activeView} onValueChange={handleTabChange} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
          <TabsList className="w-full grid grid-cols-2 md:inline-flex md:w-auto">
            <TabsTrigger value="table" className="cursor-pointer">{t('alarms.tableView')}</TabsTrigger>
            <TabsTrigger value="cards" className="cursor-pointer">{t('alarms.cardsView')}</TabsTrigger>
       </TabsList>

          <TabsContent value="table" className="mt-6">
     <Card>
        <CardContent className="pt-6">
   <Table className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
         <TableHeader>
  <TableRow>
          <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('common.id')}</TableHead>
    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{t('alarms.alarmName')}</TableHead>
        <TableHead className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden sm:table-cell`}>{t('readings.site')}</TableHead>
          <TableHead className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden xl:table-cell`}>{t('alarms.field')}</TableHead>
   <TableHead className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden xl:table-cell`}>{t('readings.value')}</TableHead>
        <TableHead className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden xl:table-cell`}>{t('alarms.threshold')}</TableHead>
           <TableHead className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden md:table-cell`}>{t('alarms.severity')}</TableHead>
        <TableHead className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden 2xl:table-cell`}>{t('alarms.color')}</TableHead>
           <TableHead className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden lg:table-cell`}>{t('common.dateTime')}</TableHead>
        </TableRow>
   </TableHeader>
      <TableBody>
       {alarmEvents.map((event) => (
         <TableRow 
key={event.id} 
           className="hover:bg-gray-50"
   >
    <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>#{event.id}</TableCell>
                  <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{translateAlarmName(event.alarmName)}</TableCell>
<TableCell className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden sm:table-cell`}>
     {getSiteName(event.siteId, event.siteName)}
          </TableCell>
      <TableCell className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden xl:table-cell`}>
              <Badge variant="outline">{translateFieldName(event.fieldName)}</Badge>
 </TableCell>
       <TableCell className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden xl:table-cell`}>{event.value ?? '—'}</TableCell>
       <TableCell className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} text-center hidden xl:table-cell`}>{event.thresholdValue ?? '—'}</TableCell>
         <TableCell className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden md:table-cell`}>
       {getSeverityBadge(event.severity)}
     </TableCell>
         <TableCell className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden 2xl:table-cell`}>
              <div className="flex items-center gap-2">
    <div 
  className="w-6 h-6 rounded border shadow-sm"
    style={{ backgroundColor: event.colorCode }}
   />
       </div>
   </TableCell>
      <TableCell className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden lg:table-cell text-sm`}>
   {formatDate(event.triggeredAt)}
 </TableCell>
       </TableRow>
          ))}
   </TableBody>
       </Table>
            </CardContent>
              </Card>
          </TabsContent>

 <TabsContent value="cards" className="mt-6" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {alarmEvents.map((event) => (
          <Card 
   key={event.id} 
       className="border shadow-sm hover:border-blue-200 transition"
     >
       <CardHeader className="space-y-1">
        <div className="flex items-center justify-between gap-2">
  <div className="flex items-center gap-2">
     <AlertTriangle className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-base">#{event.id}</CardTitle>
          </div>
              {getSeverityBadge(event.severity)}
              </div>
      <p className="text-sm text-gray-500">{formatDate(event.triggeredAt)}</p>
           </CardHeader>
                      <CardContent className="space-y-4">
       <div>
           <p className={`font-semibold ${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}`}>{translateAlarmName(event.alarmName)}</p>
         <p className={`text-sm text-gray-500 ${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}`}>
       {getSiteName(event.siteId, event.siteName)}
 </p>
    </div>

   <div className="grid grid-cols-2 gap-3 text-sm">
          <div className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
          <p className="text-gray-500">{t('alarms.field')}</p>
   <Badge variant="outline" className="mt-1">{translateFieldName(event.fieldName)}</Badge>
              </div>
         <div className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
  <p className="text-gray-500">{t('readings.value')}</p>
         <p className="mt-1">{event.value ?? '—'} / {event.thresholdValue ?? '—'}</p>
 </div>
      </div>

    <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">{t('alarms.color')}</div>
          <div 
    className="w-8 h-8 rounded border shadow-sm"
style={{ backgroundColor: event.colorCode }}
   />
</div>

   <div className={`bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm ${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}`}>
       <p className="font-medium mb-1">{t('alarms.message')}</p>
                 <p className="text-gray-600 leading-relaxed">{event.message}</p>
       </div>
     </CardContent>
    </Card>
      ))}
 </div>
  </TabsContent>
    </Tabs>
        )
      )}

 {/* Pagination Controls */}
      {!isLoading && !error && alarmEvents.length > 0 && totalPages > 0 && (
 <Card>
    <CardContent className="pt-6">
 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
   {/* Page Size Selector */}
   <div className="flex items-center gap-2">
   <Label className="text-sm whitespace-nowrap">{t('common.recordsPerPage')}</Label>
        <Select
  value={pageSize.toString()}
      onValueChange={handlePageSizeChange}
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
         onClick={() => handlePageChange(pageNumber - 1)}
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
          onClick={() => handlePageChange(pageNum)}
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
                onClick={() => handlePageChange(totalPages)}
           className="h-9 w-9"
     aria-label={`${t('common.page')} ${totalPages}`}
               >
   {totalPages}
  </Button>
         )}

          <Button
 variant="outline"
    size="icon"
         onClick={() => handlePageChange(pageNumber + 1)}
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
        </Card>
  )}

    {/* Detail Drawer */}
    <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
    <SheetContent side={t('_rtl') === 'rtl' ? 'left' : 'right'} className="w-[400px] sm:w-[540px]" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
          {selectedEvent && (
        <>
      <SheetHeader>
<SheetTitle className="flex items-center gap-2">
 <AlertTriangle className="h-5 w-5 text-blue-600" />
 {t('alarms.eventDetails')}
        </SheetTitle>
                <SheetDescription>
      {t('alarms.eventNumber')} #{selectedEvent.id}
                </SheetDescription>
        </SheetHeader>

       <div className="mt-6 space-y-6">
      {/* Severity & Color */}
         <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
   {getSeverityBadge(selectedEvent.severity)}
              <div 
          className="w-8 h-8 rounded border-2 shadow-sm"
    style={{ backgroundColor: selectedEvent.colorCode }}
       />
    </div>
             <div className="text-right text-sm text-gray-500">
                  {selectedEvent.colorCode}
</div>
                </div>
     {/* Alarm Name */}
              <div>
          <Label className="text-gray-500">{t('alarms.alarmName')}</Label>
       <p className="mt-1">{translateAlarmName(selectedEvent.alarmName)}</p>
             </div>

                {/* Site Information */}
   <div>
        <Label className="text-gray-500">{t('readings.site')}</Label>
           <p className="mt-1">{getSiteName(selectedEvent.siteId, selectedEvent.siteName)}</p>
       </div>

    {/* Field & Values */}
       <div className="border rounded-lg p-4 space-y-3">
         <div className="flex items-center justify-between">
            <Label className="text-gray-500">{t('alarms.field')}</Label>
   <Badge variant="outline">{translateFieldName(selectedEvent.fieldName)}</Badge>
           </div>
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
    <div>
        <Label className="text-gray-500 text-sm">{t('readings.actualValue')}</Label>
           <p className="mt-1 text-lg text-right">{selectedEvent.value ?? '—'}</p>
   </div>
        <div>
         <Label className="text-gray-500 text-sm">{t('alarms.threshold')}</Label>
       <p className="mt-1 text-lg text-right">{selectedEvent.thresholdValue ?? '—'}</p>
               </div>
   </div>
             </div>

          {/* Message */}
     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
         <Label className="text-gray-500">{t('common.message')}</Label>
      <p className="mt-2 text-sm leading-relaxed">{selectedEvent.message}</p>
      </div>

    {/* Time Info */}
     <div>
   <Label className="text-gray-500">{t('common.dateTime')}</Label>
<p className="mt-1 text-sm">{selectedEvent.triggeredAt}</p>
   </div>

  {/* Action Buttons */}
     <div className="pt-4 border-t space-y-2">
           <Button className="w-full" variant="outline">
             {t('alarms.viewFullReading')}
    </Button>
          <Button className="w-full" variant="outline">
        {t('alarms.viewAlarmConfiguration')}
         </Button>
        </div>
  </div>
        </>
          )}
      </SheetContent>
      </Sheet>
    </div>
  );
}
