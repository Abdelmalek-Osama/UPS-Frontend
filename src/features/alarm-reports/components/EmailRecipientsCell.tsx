/**
 * Email Recipients Cell Component
 * Displays email recipients with compact indicators for multiple emails
 * - 1 recipient: displays email directly
 * - 2 recipients: displays both separated by comma
 * - 3+ recipients: displays compact indicator with popover for full list
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
import { Mail } from 'lucide-react';

interface EmailRecipientsCellProps {
  recipients: string[];
}

export function EmailRecipientsCell({ recipients }: EmailRecipientsCellProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Filter to get only email addresses
  const emailRecipients = recipients.filter(r => 
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(r)
  );

  if (emailRecipients.length === 0) {
    return (
      <Badge variant="outline" className="text-gray-400">
        {t('alarmReports.noRecipients')}
      </Badge>
    );
  }

  // Always display recipients within a popover
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
          type="button"
          aria-label={emailRecipients.length === 1
            ? emailRecipients[0]
            : `${emailRecipients.length} email recipients`
          }
        >
          <Mail className="h-3.5 w-3.5" />
          {emailRecipients.length === 1 ? (
            <span className="truncate">{emailRecipients[0]}</span>
          ) : emailRecipients.length === 2 ? (
            <span className="truncate">
              {emailRecipients[0]}, {emailRecipients[1]}
            </span>
          ) : (
            <span>{emailRecipients.length} {t('alarmReports.recipients')}</span>
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
            {t('alarmReports.emailRecipients')}
          </h4>
          <ScrollArea className="h-auto max-h-48 rounded-md border border-gray-200 bg-gray-50">
            <div className="p-3">
              {emailRecipients.map((email, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-1 text-sm bg-white rounded hover:bg-gray-50 transition-colors break-all"
                  title={email}
                >
                  <Mail className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                  <span className="text-gray-700 break-all">{email}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
