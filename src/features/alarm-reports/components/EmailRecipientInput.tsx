/**
 * Email Recipient Input Component
 * Similar to RecipientInput in alarms, optimized for email only
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Plus, Mail, X } from 'lucide-react';

interface EmailRecipientInputProps {
  recipients: string[];
  setRecipients: (newRecipients: string[]) => void;
}

export function EmailRecipientInput({
  recipients,
  setRecipients,
}: EmailRecipientInputProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
 return emailRegex.test(email);
  };

  const handleAdd = (newEmail: string) => {
    if (newEmail.trim() === '') return;

    if (!validateEmail(newEmail)) {
      toast.error(t('validation.invalidEmailFormat'));
      return;
    }

    // Check for duplicates
    if (recipients.includes(newEmail)) {
      toast.error(t('alarmReports.emailAlreadyAdded'));
      return;
    }

    setRecipients([...recipients, newEmail]);
    setInputValue('');
  };

  const handleRemove = (emailToRemove: string) => {
    setRecipients(recipients.filter(r => r !== emailToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd(inputValue);
    }
  };

  return (
    <div className="space-y-2">
   <Label className="font-medium">{t('alarmReports.emailRecipients')}</Label>
      <p className="text-xs text-gray-500">{t('alarmReports.emailRecipientsDescription')}</p>
      
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder={t('alarmReports.emailPlaceholder')}
   value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
    onKeyPress={handleKeyPress}
          dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
          className="flex-1"
        />
 <Button
 type="button"
          onClick={() => handleAdd(inputValue)}
  variant="outline"
size="icon"
          className="flex-shrink-0"
 >
    <Plus className="h-4 w-4" />
        </Button>
      </div>

      {recipients.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 p-3 bg-gray-50 rounded-lg">
          {recipients.map((email) => (
            <Badge
           key={email}
   variant="secondary"
         className="flex items-center gap-1.5 py-1.5"
   >
            <Mail className="h-3 w-3" />
     <span className="truncate">{email}</span>
   <button
                onClick={() => handleRemove(email)}
  className="ml-1 hover:text-red-600 focus:outline-none"
          aria-label={`Remove ${email}`}
    >
 <X className="h-3 w-3" />
</button>
            </Badge>
      ))}
  </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        {recipients.length > 0 && `${recipients.length} ${t('alarmReports.recipientsAdded')}`}
      </p>
    </div>
  );
}
