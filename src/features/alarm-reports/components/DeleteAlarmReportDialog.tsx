/**
 * Delete Alarm Report Confirmation Dialog
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { AlertTriangle, Loader } from 'lucide-react';

interface DeleteAlarmReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configurationName: string;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteAlarmReportDialog({
  open,
  onOpenChange,
  configurationName,
  onConfirm,
  isLoading = false,
}: DeleteAlarmReportDialogProps) {
  const { t } = useTranslation();

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <AlertDialogTitle>{t('alarmReports.deleteConfiguration')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {t('alarmReports.deleteConfigurationMessage', { name: configurationName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="!bg-red-600 hover:!bg-red-700 text-white font-semibold"
          >
            {isLoading && <Loader className="h-4 w-4 animate-spin" />}
            {t('common.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
