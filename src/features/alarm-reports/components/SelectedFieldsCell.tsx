/**
 * Selected Fields Cell Component
 * Displays selected report fields with compact indicators for multiple fields
 * - 1 field: displays field name directly
 * - 2 fields: displays both field names
 * - 3+ fields: displays compact indicator with popover for full list
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Grid3x3 } from 'lucide-react';

interface SelectedFieldsCellProps {
  fields: string[];
}

export function SelectedFieldsCell({ fields }: SelectedFieldsCellProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  if (fields.length === 0) {
    return (
      <Badge variant="outline" className="text-gray-400">
        {t('alarmReports.noFields')}
      </Badge>
    );
  }

  // Always display fields within a popover
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
          type="button"
          aria-label={fields.length === 1
            ? fields[0]
            : `${fields.length} selected fields`
          }
        >
          <Grid3x3 className="h-3.5 w-3.5" />
          {fields.length === 1 ? (
            <span className="truncate">{fields[0]}</span>
          ) : fields.length === 2 ? (
            <span className="truncate">
              {fields[0]}, {fields[1]}
            </span>
          ) : (
            <span>{fields.length} {t('alarmReports.fields')}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-3"
        align="start"
        side="bottom"
      >
        <div>
          <h4 className="text-sm font-semibold text-gray-700 pb-2">
            {t('alarmReports.selectedFields')}
          </h4>
          <ScrollArea className="h-auto max-h-48 rounded-md border border-gray-200 bg-gray-50">
            <div className="p-3">
              {fields.map((field, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-1 text-sm bg-white rounded hover:bg-gray-50 transition-colors break-all"
                  title={field}
                >
                  <Grid3x3 className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                  <span className="text-gray-700 break-all">{field}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
