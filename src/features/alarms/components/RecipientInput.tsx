import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Plus, Mail, Phone } from 'lucide-react';
import { validateEmail } from '../../../shared/utils/emailValidator';

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
    const [error, setError] = useState<string>('');

    const handleAdd = (newRecipient: string) => {
        if (newRecipient.trim() === '') return;

        const phoneRegex = /^\d{11}$/;

        if (isEmail) {
            if (!validateEmail(newRecipient)) {
                // Check basic format first
                const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
                if (!emailRegex.test(newRecipient)) {
                    setError(t('validation.invalidEmailFormat'));
                    toast.error(t('validation.invalidEmailFormat'));
                } else {
                    setError(t('validation.emailDomainNotSupported'));
                    toast.error(t('validation.emailDomainNotSupported'));
                }
                return;
            }
        } else if (!isEmail && !phoneRegex.test(newRecipient)) {
            setError(t('validation.phone11Digits'));
            toast.error(t('validation.phone11Digits'));
            return;
        }

        setRecipients([...recipients, newRecipient]);
        setInputValue('');
        setError('');
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
                    dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setError(''); // Clear error when user types
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
            {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
            {recipients.length > 0 && (
                <div className="max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50">
                    <div className="flex flex-wrap gap-2">
                        {recipients.map(recipient => {
                            const isEmail = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(recipient);
                            const isPhone = /^\d{11}$/.test(recipient);
                            return (
                                <Badge key={recipient} variant="secondary" className="flex items-center gap-1 flex-shrink-0">
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
                </div>
            )}
        </div>
    );
}
