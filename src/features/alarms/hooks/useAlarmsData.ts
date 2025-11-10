import { useState } from 'react';
import type { ValueThresholdAlarm, CommunicationAlarm } from '../types';

export function useAlarmsData() {
  const [thresholdAlarms, setThresholdAlarms] = useState<ValueThresholdAlarm[]>([
    { id: 1, site: 'القناطر - القاهرة 01', field: 'Battery', operator: '<', threshold: 12.5, color: '#fbbf24', severity: 'Warning' },
    { id: 2, site: 'القناطر - القاهرة 01', field: 'USWL', operator: '>', threshold: 130, color: '#ef4444', severity: 'Critical' },
    { id: 3, site: 'محطة رفع - الجيزة 01', field: 'TotalFlow', operator: '<', threshold: 50, color: '#fbbf24', severity: 'Warning' },
  ]);

  const [communicationAlarms, setCommunicationAlarms] = useState<CommunicationAlarm[]>([
    { id: 1, site: 'القناطر - القاهرة 01', hours: 2, recipients: ['admin@irrigation.gov.eg', 'operator1@irrigation.gov.eg'] },
    { id: 2, site: 'محطة رفع - الإسكندرية 02', hours: 1, recipients: ['admin@irrigation.gov.eg'] },
  ]);

  const sites = [
    'القناطر - القاهرة 01',
    'القناطر - الإسكندرية 01',
    'محطة رفع - الجيزة 01',
    'محطة رفع - الدقهلية 02',
  ];

  const fields = ['Battery', 'USWL', 'DSWL', 'TotalFlow', 'TotalUptime'];
  const operators = ['>', '<', '>=', '<=', '=='];
  const [isAddCommOpen, setIsAddCommOpen] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const addRecipient = () => {
    if (newRecipient && !recipients.includes(newRecipient)) {
      setRecipients([...recipients, newRecipient]);
      setNewRecipient('');
    }
  };

  const removeRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  return {
    thresholdAlarms,
    setThresholdAlarms,
    communicationAlarms,
    setCommunicationAlarms,
    isAddCommOpen,
    setIsAddCommOpen,
    sites,
    fields,
    operators,
    addRecipient,
    removeRecipient,
    newRecipient,
    setNewRecipient,
    recipients,
    setRecipients,
  };
}
