import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
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
  Search, 
  Download, 
  AlertTriangle,
  Bell,
  Calendar as CalendarIcon,
  X
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Calendar } from '../../../components/ui/calendar';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import apiService from '../../../shared/utils/apiService';
import Loader from '../../../components/ui/Loader';

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
  | { isSuccess: boolean; data: AlarmEventResponseDto[] };

interface AlarmEvent {
  id: number;
  alarmName: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedField, setSelectedField] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [activeView, setActiveView] = useState<'table' | 'cards'>('table');
  const [alarmEvents, setAlarmEvents] = useState<AlarmEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (i18n.language === 'en') {
      return format(date, 'MM/dd/yyyy HH:mm:ss');
    } else {
      return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: ar });
    }
  };

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
      const response = await apiService.get<AlarmEventsApiResponse>(`/v1/alarm-events`, {
        params: { unresolvedOnly: true },
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

      const getEventsPayload = (raw: AlarmEventsApiResponse): AlarmEventResponseDto[] => {
        if (Array.isArray(raw)) return raw;
        if (raw && typeof raw === 'object') {
          const firstLayer = (raw as Record<string, unknown>).data;
          if (Array.isArray(firstLayer)) return firstLayer;
          if (firstLayer && typeof firstLayer === 'object') {
            const secondLayer = (firstLayer as Record<string, unknown>).data;
            if (Array.isArray(secondLayer)) return secondLayer;
          }
        }
        return [];
      };

      const payload = getEventsPayload(response);

      const mappedEvents: AlarmEvent[] = payload.map((event) => ({
        id: event.id,
        alarmName: event.alarmName,
        siteName: event.siteName,
        fieldName: event.fieldName,
        value: event.actualValue ?? undefined,
        thresholdValue: event.thresholdValue ?? undefined,
        severity: severityMap[event.severity ?? ''] ?? 'info',
        colorCode: event.colorCode ?? '#d1d5db',
        triggeredAt: event.triggeredAt,
        message: event.message,
      }));

      setAlarmEvents(mappedEvents);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlarmEvents();
  }, [fetchAlarmEvents]);

  const sites = Array.from(new Set(alarmEvents.map((event) => event.siteName)));

  const fields = Array.from(new Set(alarmEvents.map((event) => event.fieldName))).filter(Boolean);

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

  // Filter logic
  const filteredEvents = alarmEvents.filter(event => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    // Search filter
    if (
      normalizedQuery &&
      !event.id.toString().includes(normalizedQuery)
    ) {
      return false;
    }
    
    // Site filter
    if (selectedSite !== 'all' && event.siteName !== selectedSite) {
      return false;
    }
    
    // Severity filter
    if (selectedSeverity !== 'all' && event.severity !== selectedSeverity) {
      return false;
    }
    
    // Field filter
    if (selectedField !== 'all' && event.fieldName !== selectedField) {
      return false;
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      const eventDate = new Date(event.triggeredAt);
      if (dateFrom && eventDate < dateFrom) return false;
      if (dateTo && eventDate > dateTo) return false;
    }
    
    return true;
  });

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
        filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="bg-gray-100 p-6 rounded-full">
                <Bell className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg mb-2">لا توجد أحداث تنبيه</h3>
                <p className="text-gray-500 text-sm">
                  {searchQuery || selectedSite !== 'all' || selectedSeverity !== 'all' || selectedField !== 'all' 
                    ? 'لم يتم العثور على أحداث تطابق معايير البحث المحددة.'
                    : 'لم يتم إطلاق أي أحداث تنبيه بعد.'}
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
                      {filteredEvents.map((event) => (
                        <TableRow 
                          key={event.id} 
                          className="hover:bg-gray-50"
                        >
                          <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>#{event.id}</TableCell>
                          <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>{translateAlarmName(event.alarmName)}</TableCell>
                          <TableCell className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden sm:table-cell`}>
                            {event.siteName}
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
                  {filteredEvents.map((event) => (
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
                            {event.siteName}
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
                
                  <div className="text-center py-8">{t('alarms.noEventsToDisplay')}</div>
                
            </TabsContent>
          </Tabs>
        )
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
                  <p className="mt-1">{selectedEvent.siteName}</p>
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
