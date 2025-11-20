import React, { useState } from 'react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Label } from '../../../components/ui/label';
import { Plus, Mail, Phone } from 'lucide-react';

interface RecipientInputProps {
  type: 'email' | 'phone';
  forAlarmType: 'threshold' | 'communication';
  recipients: string[];
  setRecipients: (newRecipients: string[]) => void;
}

export const RecipientInput = ({
  type,
  forAlarmType,
  recipients,
  setRecipients,
}: RecipientInputProps) => {
  const isEmail = type === 'email';
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (newRecipient: string) => {
    if (newRecipient.trim() === '') return;

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const phoneRegex = /^\d{11}$/;

    if (isEmail && !emailRegex.test(newRecipient)) {
      alert('Please enter a valid email address.');
      return;
    } else if (!isEmail && !phoneRegex.test(newRecipient)) {
      alert('Please enter a valid 11-digit phone number.');
      return;
    }

    if (forAlarmType === 'threshold') {
      setRecipients([...recipients, newRecipient]);
      setInputValue('');
    } else {
      setRecipients([...recipients, newRecipient]);
      setInputValue('');
    }
  };

  const handleRemove = (recipientToRemove: string) => {
    setRecipients(recipients.filter(r => r !== recipientToRemove));
  };

  return (
    <div className="space-y-2">
      <Label>{isEmail ? 'المستلمون (البريد الإلكتروني)' : 'المستلمون (أرقام الهواتف)'}</Label>
      <div className="flex gap-2">
        <Input
          type={isEmail ? 'email' : 'tel'}
          placeholder={isEmail ? 'email@example.com' : '0123456789'}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAdd(inputValue);
              setInputValue(''); 
            }
          }}
        />
        <Button type="button" onClick={() => {
          handleAdd(inputValue);
          setInputValue(''); 
        }}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {recipients.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {recipients.map(recipient => {
            const isEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(recipient);
            const isPhone = /^\d{11}$/.test(recipient);
            return (
              <Badge key={recipient} variant="secondary" className="flex items-center gap-1">
                {isEmail && <Mail className="ml-1 h-3 w-3" />}
                {isPhone && <Phone className="ml-1 h-3 w-3" />}
                {recipient}
                <button
                  onClick={() => handleRemove(recipient)}
                  className="mr-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};
