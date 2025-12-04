import { useState, useEffect } from 'react';
import { CreateCommunicationAlarmRequest, AlarmMethod, CommunicationAlarmForm, Site } from '../types';
import { INITIAL_COMMUNICATION_FORM } from '../utils/alarmConstants';
import { mapSeverityToNumber } from '../utils/alarmMappers';
import { useAlarmsData } from './useAlarmsData';

interface UseCommunicationAlarmFormProps {
  sites: Site[];
}

export const useCommunicationAlarmForm = ({ sites }: UseCommunicationAlarmFormProps) => {
  const { createCommunicationAlarm, updateCommunicationAlarm } = useAlarmsData();

  const [newCommunicationAlarmForm, setNewCommunicationAlarmForm] = useState<CommunicationAlarmForm>(INITIAL_COMMUNICATION_FORM);
  const [currentCommunicationAlarm, setCurrentCommunicationAlarm] = useState<CommunicationAlarmForm | null>(null);
  const [isSubmittingCommAdd, setIsSubmittingCommAdd] = useState(false);
  const [isSubmittingCommEdit, setIsSubmittingCommEdit] = useState(false);
  const [hasCommunicationChanges, setHasCommunicationChanges] = useState(false);

  useEffect(() => {
    if (sites.length > 0 && newCommunicationAlarmForm.siteId === null) {
      setNewCommunicationAlarmForm(prev => ({ ...prev, siteId: sites[0].id, site: sites[0].name }));
    }
  }, [sites, newCommunicationAlarmForm.siteId]);

  useEffect(() => {
    if (!isSubmittingCommAdd && !isSubmittingCommEdit) {
      setHasCommunicationChanges(false);
    }
  }, [isSubmittingCommAdd, isSubmittingCommEdit]);

  const setCommunicationEmails = (newEmails: string[]) => {
    setNewCommunicationAlarmForm(prev => ({ ...prev, emails: newEmails }));
    setHasCommunicationChanges(true);
  };

  const setCommunicationPhones = (newPhones: string[]) => {
    setNewCommunicationAlarmForm(prev => ({ ...prev, phones: newPhones }));
    setHasCommunicationChanges(true);
  };

  const handleSubmitCommunicationAlarm = async () => {
    setIsSubmittingCommAdd(true);
    const { siteId, alarmName, hours } = newCommunicationAlarmForm;

    if (!siteId || !alarmName) {
      console.error('Missing required communication alarm fields');
      setIsSubmittingCommAdd(false);
      return;
    }

    const requestBody: CreateCommunicationAlarmRequest = {
      id: 0,
      siteId,
      alarmName,
      emails: newCommunicationAlarmForm.emails.join(','),
      phones: newCommunicationAlarmForm.phones.join(','),
      method: AlarmMethod.Email,
      communicationLoss: {
        severity: mapSeverityToNumber(newCommunicationAlarmForm.severity),
        numHours: hours,
      },
    };

    try {
      const result = await createCommunicationAlarm(requestBody);
      if (result.success) {
        // Reset form or close dialog handled by parent or context
      } else {
        console.error('Error creating communication alarm:', result.message);
      }
    } finally {
      setIsSubmittingCommAdd(false);
    }
  };

  const handleEditCommunicationAlarm = async () => {
    setIsSubmittingCommEdit(true);
    if (!currentCommunicationAlarm) return;

    const { siteId, alarmName, hours } = newCommunicationAlarmForm;

    if (!siteId || !alarmName) {
      console.error('Missing required communication alarm fields');
      setIsSubmittingCommEdit(false);
      return;
    }

    const requestBody: CreateCommunicationAlarmRequest = {
      id: currentCommunicationAlarm.id,
      siteId,
      alarmName,
      emails: newCommunicationAlarmForm.emails.join(','),
      phones: newCommunicationAlarmForm.phones.join(','),
      method: AlarmMethod.Email,
      communicationLoss: {
        severity: mapSeverityToNumber(newCommunicationAlarmForm.severity),
        numHours: hours,
      },
    };

    try {
      const result = await updateCommunicationAlarm(currentCommunicationAlarm.id, requestBody);
      if (result.success) {
        // Reset form or close dialog handled by parent or context
      } else {
        console.error('Error updating communication alarm:', result.message);
      }
    } finally {
      setIsSubmittingCommEdit(false);
    }
  };

  const populateCommunicationAlarmFormForEdit = (alarm: any) => {
    const emails = alarm.emails ? alarm.emails.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const phones = alarm.phones ? alarm.phones.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

    let siteId = alarm.siteId;
    if (!siteId && alarm.siteName) {
      const matchingSite = sites.find(s => s.name === alarm.siteName);
      siteId = matchingSite?.id;
    }

    setNewCommunicationAlarmForm({
      id: alarm.alarmId,
      siteId: siteId,
      alarmName: alarm.alarmName,
      site: alarm.siteName || '',
      severity: alarm.severity === 'Warning' ? 'Warning' : 'Critical',
      hours: alarm.numHours || 0,
      emails: emails,
      phones: phones,
    });
    setHasCommunicationChanges(false);
  };

  return {
    newCommunicationAlarmForm,
    setNewCommunicationAlarmForm,
    currentCommunicationAlarm,
    setCurrentCommunicationAlarm,
    isSubmittingCommAdd,
    isSubmittingCommEdit,
    hasCommunicationChanges,
    setHasCommunicationChanges,
    setCommunicationEmails,
    setCommunicationPhones,
    handleSubmitCommunicationAlarm,
    handleEditCommunicationAlarm,
    populateCommunicationAlarmFormForEdit,
  };
};
