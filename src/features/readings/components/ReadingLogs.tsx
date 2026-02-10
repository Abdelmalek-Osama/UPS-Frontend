import React, { useState, useEffect, useCallback } from 'react';
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
import { ChevronLeft, ChevronRight, Search, RotateCcw } from 'lucide-react';
import apiService, { ApiResponse } from '../../../shared/utils/apiService';
import type { ReadingLogDTO } from '../types';
import Loader from '../../../components/ui/Loader';

interface ReadingLogsApiResponse {
  data?: ReadingLogDTO[];
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export function ReadingLogs() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<ReadingLogDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchReadingLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, string | number> = {
        'PageNumber': pageNumber,
        'PageSize': pageSize,
      };

      if (searchTerm.trim()) {
        params['Word'] = searchTerm.trim();
      }

      const response = await apiService.get<ReadingLogsApiResponse | ApiResponse<ReadingLogsApiResponse>>(
        '/v1/reading-logs',
        { params }
      );

      let payload: ReadingLogDTO[] = [];
      let paginationInfo: {
        pageNumber?: number;
        pageSize?: number;
        totalCount?: number;
        totalPages?: number;
      } = {};

      // Handle different response structures
      if (response && typeof response === 'object') {
        if ('isSuccess' in response && 'data' in response) {
          // ApiResponse wrapper
          const wrappedData = (response as ApiResponse<ReadingLogsApiResponse>).data;
          if (wrappedData && typeof wrappedData === 'object') {
            if ('data' in wrappedData && Array.isArray(wrappedData.data)) {
              payload = wrappedData.data;
              paginationInfo = {
                pageNumber: wrappedData.pageNumber,
                pageSize: wrappedData.pageSize,
                totalCount: wrappedData.totalCount,
                totalPages: wrappedData.totalPages,
              };
            } else if (Array.isArray(wrappedData)) {
              payload = wrappedData;
            }
          }
        } else if ('data' in response) {
          const data = (response as ReadingLogsApiResponse).data;
          if (Array.isArray(data)) {
            payload = data;
            paginationInfo = {
              pageNumber: (response as ReadingLogsApiResponse).pageNumber,
              pageSize: (response as ReadingLogsApiResponse).pageSize,
              totalCount: (response as ReadingLogsApiResponse).totalCount,
              totalPages: (response as ReadingLogsApiResponse).totalPages,
            };
          }
        } else if (Array.isArray(response)) {
          payload = response;
        }
      }

      setLogs(payload);

      if (paginationInfo.totalPages !== undefined) {
        setTotalPages(paginationInfo.totalPages);
      }
      if (paginationInfo.totalCount !== undefined) {
        setTotalCount(paginationInfo.totalCount);
      }
      if (paginationInfo.pageNumber !== undefined) {
        setPageNumber(paginationInfo.pageNumber);
      }
      if (paginationInfo.pageSize !== undefined) {
        setPageSize(paginationInfo.pageSize);
      }
    } catch (error: any) {
      console.error('Error fetching reading logs:', error);
      setError((error as Error).message || t('errors.loadingFailed'));
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, pageSize, searchTerm, t]);

  useEffect(() => {
    fetchReadingLogs();
  }, [fetchReadingLogs]);

  // Reset to page 1 when search term or page size changes
  useEffect(() => {
    if (pageNumber !== 1) {
      setPageNumber(1);
    }
  }, [searchTerm, pageSize]);

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPageNumber(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleReset = () => {
    setSearchInput('');
    setSearchTerm('');
    setPageNumber(1);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('readingLogs.title')}</h2>
          <p className="text-gray-500 mt-1">{t('readingLogs.subtitle')}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('readingLogs.searchPlaceholder') || "Search by Site, Action, Type or Date..."}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pr-10"
                />
              </div>
              <Input
                type="date"
                className="w-auto"
                value={!isNaN(Date.parse(searchInput)) && searchInput.match(/^\d{4}-\d{2}-\d{2}$/) ? searchInput : ''}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Button onClick={handleSearch}>
                {t('common.search')}
              </Button>
              <Button variant="outline" onClick={handleReset} title={t('common.reset') || "Reset"}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm whitespace-nowrap">{t('common.recordsPerPage')}</Label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPageNumber(1);
                }}
                dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
              >
                <SelectTrigger className="w-24">
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
          </div>
        </CardContent>
      </Card>

      {/* Reading Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('readingLogs.title')} ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
            <Table className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
              <TableHeader>
                <TableRow>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                    {t('readingLogs.id')}
                  </TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                    {t('readingLogs.readingType')}
                  </TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                    {t('readingLogs.actionType')}
                  </TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                    {t('readingLogs.siteName')}
                  </TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                    {t('readingLogs.actionDate')}
                  </TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                    {t('readingLogs.timeStamp')}
                  </TableHead>
                  <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                    {t('readingLogs.createdBy')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      <Loader />
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && error && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-red-600">
                      {error}
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && !error && logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      {t('readingLogs.noLogsFound')}
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  !error &&
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                        {log.id}
                      </TableCell>
                      <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                        {log.readingType || 'N/A'}
                      </TableCell>
                      <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                        {log.actionType || 'N/A'}
                      </TableCell>
                      <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                        {log.siteName || 'N/A'}
                      </TableCell>
                      <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                        {formatDateTime(log.actionDate)}
                      </TableCell>
                      <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                        {log.timeStamp || 'N/A'}
                      </TableCell>
                      <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                        {log.createdBy || 'Unknown'}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Pagination Controls */}
        {!isLoading && !error && logs.length > 0 && totalPages > 0 && (
          <CardContent className="pt-6 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
                        variant={pageNum === pageNumber ? 'default' : 'outline'}
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
    </div>
  );
}

