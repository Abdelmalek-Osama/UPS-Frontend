/**
 * Alarm Reports Configuration Page
 * Main component for managing scheduled email reports for alarm events
 */

import React, { useEffect, useState } from 'react';
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
  TableRow,
} from '../../../components/ui/table';
import { Loader, Plus, Mail, Trash2, Clock, Calendar } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';
import { CreateAlarmReportDialog } from './CreateAlarmReportDialog';
import { DeleteAlarmReportDialog } from './DeleteAlarmReportDialog';
import { useAlarmReports } from '../hooks/useAlarmReports';
import type { AlarmReportConfiguration, CreateAlarmReportPayload } from '../types';
import { DAYS_OF_WEEK } from '../types';

export function AlarmReportsConfiguration() {
  const { t } = useTranslation();
  const { configurations, isLoading, fetchConfigurations, createConfiguration, deleteConfiguration } = useAlarmReports();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedConfigToDelete, setSelectedConfigToDelete] = useState<AlarmReportConfiguration | null>(null);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  // Load configurations on mount
  useEffect(() => {
    fetchConfigurations();
  }, [fetchConfigurations]);

  const handleCreateSubmit = async (payload: CreateAlarmReportPayload) => {
    setIsSubmittingCreate(true);
    try {
 await createConfiguration(payload);
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleDeleteClick = (config: AlarmReportConfiguration) => {
    setSelectedConfigToDelete(config);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedConfigToDelete) return;
    
    setIsDeletingId(selectedConfigToDelete.id);
    try {
      await deleteConfiguration(selectedConfigToDelete.id);
    } finally {
      setIsDeletingId(null);
    }
  };

  const getDayOfWeekLabel = (dayOfWeek?: number): string => {
    if (dayOfWeek === undefined || dayOfWeek === null) return '';
    const day = DAYS_OF_WEEK.find(d => d.value === dayOfWeek);
    return day ? t(`alarmReports.day${day.label}`) : '';
  };

  const getFrequencyLabel = (frequency: string): string => {
    const key = `alarmReports.frequency${frequency}`;
    return t(key);
  };

  const formatDateTime = (dateString: string): string => {
 try {
      const date = new Date(dateString);
      return date.toLocaleString(t('_rtl') === 'rtl' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
     hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
    return dateString;
    }
  };

  return (
    <div className="space-y-6" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <Card>
 <CardHeader>
          <div className="flex items-start justify-between">
     <div>
              <CardTitle className="flex items-center gap-2">
     <Mail className="h-5 w-5 text-blue-600" />
     {t('alarmReports.title')}
        </CardTitle>
       <p className="text-sm text-gray-500 mt-2">
    {t('alarmReports.subtitle')}
            </p>
     </div>
    <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
      <Plus className="h-4 w-4" />
              {t('alarmReports.createNewConfiguration')}
   </Button>
   </div>
        </CardHeader>
</Card>

    {/* Configurations Table */}
  {isLoading ? (
      <Card>
          <CardContent className="py-16 flex justify-center items-center">
<Loader className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
        </Card>
      ) : configurations.length === 0 ? (
        <Card>
          <CardContent className="py-16">
    <div className="flex flex-col items-center justify-center text-center space-y-4">
   <div className="bg-gray-100 p-6 rounded-full">
                <Mail className="h-12 w-12 text-gray-400" />
              </div>
              <div>
          <h3 className="text-lg font-medium mb-2">
        {t('alarmReports.noConfigurations')}
                </h3>
<p className="text-gray-500 text-sm">
  {t('alarmReports.noConfigurationsDescription')}
     </p>
</div>
  <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 mt-4">
         <Plus className="h-4 w-4" />
    {t('alarmReports.createFirstConfiguration')}
  </Button>
   </div>
  </CardContent>
        </Card>
  ) : (
        <Card>
  <CardContent className="pt-6 overflow-x-auto">
            <Table className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
     <TableHeader>
           <TableRow>
    <TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
 {t('alarmReports.columnName')}
              </TableHead>
         <TableHead className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden sm:table-cell`}>
       {t('alarmReports.columnStatus')}
         </TableHead>
   <TableHead className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden md:table-cell`}>
                    {t('alarmReports.columnFrequency')}
            </TableHead>
         <TableHead className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden lg:table-cell`}>
         {t('alarmReports.columnSchedule')}
          </TableHead>
     <TableHead className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden xl:table-cell`}>
  {t('alarmReports.columnRecipients')}
      </TableHead>
          <TableHead className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden 2xl:table-cell`}>
        {t('alarmReports.columnFields')}
               </TableHead>
         <TableHead className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden lg:table-cell`}>
      {t('alarmReports.columnCreated')}
        </TableHead>
<TableHead className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
           {t('common.actions')}
    </TableHead>
                </TableRow>
  </TableHeader>
    <TableBody>
    {configurations.map((config) => (
       <TableRow key={config.id} className="hover:bg-gray-50">
        {/* Name */}
        <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
         <div className="font-medium">{config.name}</div>
    </TableCell>

      {/* Status */}
           <TableCell className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden sm:table-cell`}>
      <Badge variant={config.isEnabled ? 'default' : 'secondary'}>
    {config.isEnabled ? t('common.active') : t('common.inactive')}
            </Badge>
              </TableCell>

  {/* Frequency */}
      <TableCell className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden md:table-cell`}>
    <div className="flex items-center gap-2">
         <Clock className="h-4 w-4 text-gray-400" />
        <span className="text-sm">{getFrequencyLabel(config.frequency)}</span>
          </div>
      </TableCell>

       {/* Schedule */}
           <TableCell className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden lg:table-cell`}>
        <div className="flex items-center gap-2 text-sm">
    <Calendar className="h-4 w-4 text-gray-400" />
      <span>
                 {config.scheduledTime && `${config.scheduledTime}`}
             {config.dayOfWeek !== undefined && config.frequency === 'Weekly' && (
         <> • {getDayOfWeekLabel(config.dayOfWeek)}</>
       )}
  </span>
  </div>
  </TableCell>

     {/* Recipients */}
        <TableCell className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden xl:table-cell`}>
           <TooltipProvider>
         <Tooltip>
              <TooltipTrigger asChild>
       <Badge variant="outline" className="cursor-help">
 {config.recipients.length} {t('alarmReports.recipients')}
      </Badge>
            </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
 <div className="space-y-1">
          {config.recipients.map((email, idx) => (
   <div key={idx} className="text-xs">
            {email}
         </div>
    ))}
      </div>
     </TooltipContent>
  </Tooltip>
                </TooltipProvider>
     </TableCell>

          {/* Fields */}
             <TableCell className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden 2xl:table-cell`}>
       <TooltipProvider>
     <Tooltip>
  <TooltipTrigger asChild>
                <Badge variant="outline" className="cursor-help">
           {config.selectedFields.length} {t('alarmReports.fields')}
        </Badge>
       </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
           <div className="space-y-1">
       {config.selectedFields.map((field, idx) => (
            <div key={idx} className="text-xs">
  {field}
</div>
        ))}
  </div>
       </TooltipContent>
           </Tooltip>
          </TooltipProvider>
       </TableCell>

  {/* Created */}
    <TableCell className={`${t('_rtl') === 'rtl' ? 'text-right' : 'text-left'} hidden lg:table-cell text-sm text-gray-600`}>
           {formatDateTime(config.createdAt)}
          </TableCell>

  {/* Actions */}
 <TableCell className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
          <div className="flex items-center gap-2">
     <Button
       variant="ghost"
          size="icon"
             onClick={() => handleDeleteClick(config)}
                    disabled={isDeletingId === config.id}
      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
       aria-label={t('common.delete')}
  >
            {isDeletingId === config.id ? (
      <Loader className="h-4 w-4 animate-spin" />
      ) : (
      <Trash2 className="h-4 w-4" />
          )}
  </Button>
   </div>
            </TableCell>
      </TableRow>
        ))}
     </TableBody>
            </Table>
</CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <CreateAlarmReportDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubmit}
        isLoading={isSubmittingCreate}
      />

      {/* Delete Dialog */}
      <DeleteAlarmReportDialog
        open={isDeleteDialogOpen}
      onOpenChange={setIsDeleteDialogOpen}
        configurationName={selectedConfigToDelete?.name || ''}
  onConfirm={handleDeleteConfirm}
  isLoading={isDeletingId !== null}
      />
    </div>
  );
}
