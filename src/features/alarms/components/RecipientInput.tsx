import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Plus, Mail, Phone } from 'lucide-react';

interface RecipientInputProps {
    type: 'email' | 'phone';
    forAlarmType: 'threshold' | 'communication' | 'sensorStatus' | 'pumpStatusPS' | 'pumpStatusIdv';
    recipients: string[];
    setRecipients: (newRecipients: string[]) => void;
    setHasChanges: (hasChanges: boolean) => void;
}

export function RecipientInput({
    type,
    forAlarmType,
    recipients,
    setRecipients,
    setHasChanges
}: RecipientInputProps) {
    const { t } = useTranslation();
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

        setRecipients([...recipients, newRecipient]);
        setInputValue('');
        setHasChanges(true);
    };

    const handleRemove = (recipientToRemove: string) => {
        setRecipients(recipients.filter(r => r !== recipientToRemove));
        setHasChanges(true);
    };

    return (
        <div className="space-y-2">
            <Label>{isEmail ? t('alarms.emailRecipients') : t('alarms.phoneRecipients')}</Label>
            <div className="flex gap-2">
                <Input
                    type={isEmail ? 'email' : 'tel'}
                    placeholder={isEmail ? 'email@example.com' : '0123456789'}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                    }}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleAdd(inputValue);
                        }
                    }}
                />
                <Button type="button" onClick={() => {
                    handleAdd(inputValue);
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
}
