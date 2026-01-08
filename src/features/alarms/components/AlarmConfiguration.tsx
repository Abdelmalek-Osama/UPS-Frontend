import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Plus, AlertTriangle, WifiOff, SmartphoneNfc, Wrench } from 'lucide-react';
import { Dialog, DialogTrigger } from '../../../components/ui/dialog';
import Loader from '../../../components/ui/Loader';
// import { useOutletContext } from 'react-router-dom';
// Import useAuth from AuthContext
import { useAuth } from '../../../shared/contexts/AuthContext';
import { User } from '../../auth';
import { toast } from 'react-toastify';

// Hooks
import { useAlarmsData } from '../hooks/useAlarmsData';
import { useSitesLookup } from '../hooks/useSitesLookup';
import { useThresholdAlarmFields } from '../hooks/useThresholdAlarmFields';

// Types
import {
  CreateThresholdAlarmRequest,
  CreateCommunicationAlarmRequest,
  CreateSensorStatusAlarmRequest,
  CreatePumpStatusPSAlarmRequest,
  CreatePumpStatusIdvAlarmRequest,
  AlarmMethod,
  // Severity,
  ThresholdAlarmForm,
  CommunicationAlarmForm,
  SensorStatusForm,
  PumpStatusPSAlarmForm,
  PumpStatusIdvAlarmForm
} from '../types/index';

// Utils
import { INITIAL_THRESHOLD_FORM, INITIAL_COMMUNICATION_FORM, INITIAL_SENSOR_STATUS_FORM,INITIAL_PumpStatusPS_FORM, INITIAL_PumpStatusIdv_FORM,OPERATORS } from '../utils/alarmConstants';
import { mapFieldToNumber, mapOperatorToNumber, mapSeverityToNumber, mapNumberToField, mapNumberToOperator } from '../utils/alarmMappers';

// Components
import { ThresholdAlarmTable } from './tables/ThresholdAlarmTable';
import { CommunicationAlarmTable } from './tables/CommunicationAlarmTable';
import {SensorStatusTable} from './tables/SensorStatusTable'
import { PumpStatusPSTable } from './tables/PumpStatusPSTable'
import  {PumpStatusIdvTable} from './tables/PumpStatusIdvTable'
import { AddThresholdAlarmDialog } from './dialogs/AddThresholdAlarmDialog';
import { EditThresholdAlarmDialog } from './dialogs/EditThresholdAlarmDialog';
import { AddCommunicationAlarmDialog } from './dialogs/AddCommunicationAlarmDialog';
import { EditCommunicationAlarmDialog } from './dialogs/EditCommunicationAlarmDialog';
import  {AddSensorStatusAlarmDialog} from './dialogs/AddSensorStatusAlarmDialog';
import  EditSensorStatusAlarmDialog from './dialogs/EditSensorStatusAlarmDialog';
import { AddPumpStatusPSAlarmDialog} from './dialogs/AddPumpStatusPSAlarmDialog';
import { EditPumpStatusPSAlarmDialog } from './dialogs/EditPumpStatusPSAlarmDialog';
import { AddPumpStatusIdvAlarmDialog } from './dialogs/AddPumpStatusIdvAlarmDialog';
import { EditPumpStatusIdvAlarmDialog } from './dialogs/EditPumpStatusIdvAlarmDialog';

export function AlarmConfiguration() {
  const { t } = useTranslation();
  // const { currentUser: outletCurrentUser } = useOutletContext<{ currentUser: User }>();
  const { loadingAuth, userLoaded, currentUser } = useAuth();

  // If authentication is still loading or user data hasn't been loaded yet, show a loader
  if (loadingAuth || !userLoaded || !currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  const {
    thresholdAlarms,
    communicationAlarms,
    sensorStatusAlarms,
    pumpStatusIdvAlarms,
    pumpStatusPSAlarms,
    isAddCommOpen,
    setIsAddCommOpen,
    createThresholdAlarm,
    createCommunicationAlarm,
    createSensorStatusAlarm,
    updateSensorStatusAlarm,
    createPumpStatusPSAlarm,
    createPumpStatusIdvAlarm,
    updateThresholdAlarm,
    updateCommunicationAlarm,
    updatePumpStatusPSAlarm,
    updatePumpStatusIdvAlarm,
    isLoading,
    fetchPumpStatusIdvSiteConfiguration,
    pumpStatusIdvSiteConfiguration,
    pumpStatusIdvConfigLoading,
  } = useAlarmsData();

  const { sites, sitesLoading, sitesError } = useSitesLookup();

  const [activeTab, setActiveTab] = useState('threshold');
  const [isAddThresholdOpen, setIsAddThresholdOpen] = useState(false);
  const [isEditThresholdOpen, setIsEditThresholdOpen] = useState(false);
  const [currentThresholdAlarm, setCurrentThresholdAlarm] = useState<ThresholdAlarmForm | null>(null);
  const [newThresholdAlarmForm, setNewThresholdAlarmForm] = useState<ThresholdAlarmForm>(INITIAL_THRESHOLD_FORM);
  const [newCommunicationAlarmForm, setNewCommunicationAlarmForm] = useState<CommunicationAlarmForm>(INITIAL_COMMUNICATION_FORM);
  const [isEditCommOpen, setIsEditCommOpen] = useState(false);
  const [isAddSensorStatusOpen, setIsAddSensorStatusOpen] = useState(false);
  const [isEditSensorStatusOpen, setIsEditSensorStatusOpen] = useState(false);
  const [currentSensorStatusAlarm, setCurrentSensorStatusAlarm] = useState<SensorStatusForm | null>(null);
  const [newSensorStatusForm, setNewSensorStatusForm] = useState<SensorStatusForm>(INITIAL_SENSOR_STATUS_FORM);
  const [isAddPumpStatusPSOpen, setIsAddPumpStatusPSOpen] = useState(false);
  const [isEditPumpStatusPSOpen, setIsEditPumpStatusPSOpen]= useState(false);
  const [currentPumpStatusPSAlarm, setCurrentPumpStatusPSAlarm] = useState<PumpStatusPSAlarmForm | null>(null);
  const [newPumpStatusPSForm, setNewPumpStatusPSForm] = useState<PumpStatusPSAlarmForm>(INITIAL_PumpStatusPS_FORM);
  const [isAddPumpStatusIdvOpen, setIsAddPumpStatusIdvOpen] = useState(false);
  const [isEditPumpStatusIdvOpen, setIsEditPumpStatusIdvOpen]= useState(false);
  const [currentPumpStatusIdvAlarm, setCurrentPumpStatusIdvAlarm] = useState<PumpStatusIdvAlarmForm | null>(null);
  const [newPumpStatusIdvForm, setNewPumpStatusIdvForm] = useState<PumpStatusIdvAlarmForm>(INITIAL_PumpStatusIdv_FORM);
  const [currentCommunicationAlarm, setCurrentCommunicationAlarm] = useState<CommunicationAlarmForm | null>(null);
  const [isSubmittingThresholdAdd, setIsSubmittingThresholdAdd] = useState(false);
  const [isSubmittingThresholdEdit, setIsSubmittingThresholdEdit] = useState(false);
  const [isSubmittingCommAdd, setIsSubmittingCommAdd] = useState(false);
  const [isSubmittingCommEdit, setIsSubmittingCommEdit] = useState(false);
  const [isSubmittingPumpPSAdd, setIsSubmittingPumpPSAdd] = useState(false);
  const [isSubmittingPumpPSEdit, setIsSubmittingPumpPSEdit] = useState(false);
  const [isSubmittingPumpIdvAdd, setIsSubmittingPumpIdvAdd] = useState(false);
  const [isSubmittingPumpIdvEdit, setIsSubmittingPumpIdvEdit] = useState(false);
  const [hasThresholdChanges, setHasThresholdChanges] = useState(false);
  const [hasCommunicationChanges, setHasCommunicationChanges] = useState(false);
  const [hasPumpStatusPSChanges, setHasPumpStatusPSChanges] = useState(false);
  const [hasPumpStatusIdvChanges, setHasPumpStatusIdvChanges] = useState(false);
  const [thresholdSubmissionError, setThresholdSubmissionError] = useState<string | null>(null);
  const [communicationSubmissionError, setCommunicationSubmissionError] = useState<string | null>(null);
  const [sensorStatusSubmissionError, setSensorStatusSubmissionError] = useState<string | null>(null);
  const [pumpStatusPSSubmissionError, setPumpStatusPSSubmissionError] = useState<string | null>(null);
  const [pumpStatusIdvSubmissionError, setPumpStatusIdvSubmissionError] = useState<string | null>(null);
  const [isSubmittingSensorStatusAdd, setIsSubmittingSensorStatusAdd] = useState(false);
  const [pumpStatusIdvIdvPump,setPumpStatusIdvIdvPump] = useState<string>('');
  const [pumpStatusPSSite, setPumpStatusPSSite] = useState<string>('');
  const [psSiteId, setPsSiteId] = useState<number | undefined>(undefined);
  const [sentMessage, setSentMessage] = useState<string>('');
  const [pumpStatusIdvSite, setPumpStatusIdvSite] = useState<string>('');
  const [pumpStatusIdvSiteError, setPumpStatusIdvSiteError] = useState<string | null>(null);
  const { availableFields, isFetchingSiteDetails } = useThresholdAlarmFields(newThresholdAlarmForm.siteId);

  // Form submission handlers
  const handleSubmitThresholdAlarm = async () => {
    setIsSubmittingThresholdAdd(true);
    setThresholdSubmissionError(null); // Clear previous errors
    const { siteId, alarmName, field, operator, threshold, color } = newThresholdAlarmForm;

    if (!siteId || !alarmName || !field || !operator) {
      console.error('Missing required threshold alarm fields');
      setIsSubmittingThresholdAdd(false);
      return;
    }

    const requestBody: CreateThresholdAlarmRequest = {
      id: 0,
      siteId,
      alarmName,
      emails: newThresholdAlarmForm.emails.join(','),
      phones: newThresholdAlarmForm.phones.join(','),
      method: AlarmMethod.Email,
      valueThreshold: {
        fieldName: mapFieldToNumber(field),
        operator: mapOperatorToNumber(operator),
        thresholdValue: threshold,
        colorCode: color,
        severity: mapSeverityToNumber(newThresholdAlarmForm.severity),
      },
    };

    try {
      const result = await createThresholdAlarm(requestBody);
      if (result.success) {
        toast.success(t('alarms.addAlarmSuccess'));
        setIsAddThresholdOpen(false);
        setNewThresholdAlarmForm(INITIAL_THRESHOLD_FORM);
      } else {
        const errorMessage = result.message || 'Failed to create threshold alarm.';
        toast.error(errorMessage);
        setThresholdSubmissionError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
      setThresholdSubmissionError(errorMessage);
    } finally {
      setIsSubmittingThresholdAdd(false);
    }
  };

  const handleSubmitCommunicationAlarm = async () => {
    setIsSubmittingCommAdd(true);
    setCommunicationSubmissionError(null); // Clear previous errors
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
        //severity: mapSeverityToNumber(newCommunicationAlarmForm.severity),
        numHours: hours,
      },
    };

    try {
      const result = await createCommunicationAlarm(requestBody);
      if (result.success) {
        toast.success(t('alarms.addCommunicationAlarmSuccess'));
        setIsAddCommOpen(false);
        setNewCommunicationAlarmForm(INITIAL_COMMUNICATION_FORM);
      } else {
        const errorMessage = result.message || 'Failed to create communication alarm.';
        toast.error(errorMessage);
        setCommunicationSubmissionError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
      setCommunicationSubmissionError(errorMessage);
    } finally {
      setIsSubmittingCommAdd(false);
    }
  };

  const handleSubmitSensorStatusAlarm = async () => {
    setIsSubmittingSensorStatusAdd(true);
    setSensorStatusSubmissionError(null);
    const { siteId, site, sentMessage } = newSensorStatusForm;

    if (!siteId || !site) {
      console.error('Missing required sensor status alarm fields');
      setIsSubmittingSensorStatusAdd(false);
      return;
    }

    const requestBody: CreateSensorStatusAlarmRequest = {
      alarmId: null,
      siteId,
      site: sites.find(s => s.id === siteId)?.name || '',
      sentMessage,
      emails: newSensorStatusForm.emails.join(','),
      phones: newSensorStatusForm.phones.join(','),
      method: AlarmMethod.Email,
    };

    try {
      const result = await createSensorStatusAlarm(requestBody);
      if (result.success) {
        toast.success(t('alarms.addSensorStatusAlarmSuccess'));
        setIsAddSensorStatusOpen(false);
        setNewSensorStatusForm(INITIAL_SENSOR_STATUS_FORM);
      } else {
        const errorMessage = result.message || 'Failed to create sensor status alarm.';
        toast.error(errorMessage);
        setSensorStatusSubmissionError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
      setSensorStatusSubmissionError(errorMessage);
    } finally {
      setIsSubmittingSensorStatusAdd(false);
    }
  };

  const handleSubmitPumpStatusPSAlarm = async () => {
    setIsSubmittingPumpPSAdd(true);
    setPumpStatusPSSubmissionError(null); // Clear previous errors
    const { siteId, site } = newPumpStatusPSForm;

    if (!siteId || !site) {
      console.error('Missing required Pump Status PS alarm fields');
      setIsSubmittingPumpPSAdd(false);
      return;
    }

    const requestBody: CreatePumpStatusPSAlarmRequest = {
      siteId,
      site: sites.find(site => site.id === siteId)?.name || '',
      emails: newPumpStatusPSForm.emails.join(','),
      phones: newPumpStatusPSForm.phones.join(','),
      method: AlarmMethod.Email,
      
    };

    try {
      const result = await createPumpStatusPSAlarm(requestBody);
      if (result.success) {
        toast.success(t('alarms.addPumpStatusPSSuccess'));
        setIsAddCommOpen(false);
        setNewPumpStatusPSForm(INITIAL_PumpStatusPS_FORM);
      } else {
        const errorMessage = result.message || 'Failed to create pump status PS alarm.';
        toast.error(errorMessage);
        setPumpStatusPSSubmissionError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
      setPumpStatusPSSubmissionError(errorMessage);
    } finally {
      setIsSubmittingPumpPSAdd(false);
    }
  };

  const handleSubmitPumpStatusIdvAlarm = async () => {
    setIsSubmittingPumpIdvAdd(true);
    setPumpStatusIdvSubmissionError(null); // Clear previous errors
    const { siteId, site } = newPumpStatusIdvForm;

    if (!siteId || !site) {
      console.error('Missing required Individual pump status alarm fields');
      setIsSubmittingPumpIdvAdd(false);
      return;
    }

    const requestBody: CreatePumpStatusIdvAlarmRequest = {
      // id: 0,
      siteId,
      site: sites.find(site => site.id === siteId)?.name || '',
      // alarmName,
      IdvPump: newPumpStatusIdvForm.IdvPump,
      emails: newPumpStatusIdvForm.emails.join(','),
      phones: newPumpStatusIdvForm.phones.join(','),
      method: AlarmMethod.Email,
      
    };

    try {
      const result = await createPumpStatusIdvAlarm(requestBody);
      if (result.success) {
        toast.success(t('alarms.addPumpStatusIdvSuccess'));
        setIsAddPumpStatusIdvOpen(false);
        setNewPumpStatusIdvForm(INITIAL_PumpStatusIdv_FORM);
      } else {
        const errorMessage = result.message || 'Failed to create Individual pump status alarm.';
        toast.error(errorMessage);
        setPumpStatusIdvSubmissionError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
      setPumpStatusIdvSubmissionError(errorMessage);
    } finally {
      setIsSubmittingPumpIdvAdd(false);
    }
  };

  const handleEditPumpStatusPSAlarm = async () => {
    setIsSubmittingPumpPSEdit(true);
    if (!currentPumpStatusPSAlarm || !currentPumpStatusPSAlarm.siteId) return;

    const { siteId, site } = newPumpStatusPSForm;

    if (!siteId || !site) {
      console.error('Missing required Pump Status PS alarm fields');
      setIsSubmittingPumpPSEdit(false);
      return;
    }

    const requestBody: CreatePumpStatusPSAlarmRequest = {
      siteId,
      site,
      emails: newPumpStatusPSForm.emails.join(','),
      phones: newPumpStatusPSForm.phones.join(','),
      method: AlarmMethod.Email,
    };

    try {
      const result = await updatePumpStatusPSAlarm(currentPumpStatusPSAlarm.siteId, requestBody);
      if (result.success) {
        toast.success(t('alarms.updateAlarmSuccess'));
        setIsEditPumpStatusPSOpen(false);
        setCurrentPumpStatusPSAlarm(null);
        setHasPumpStatusPSChanges(false);
      } else {
        console.error('Error updating Pump Status PS alarm:', result.message);
        const errorMessage = result.message || 'Failed to update Pump Status PS alarm.';
        toast.error(errorMessage);
        setPumpStatusPSSubmissionError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
      setPumpStatusPSSubmissionError(errorMessage);
    } finally {
      setIsSubmittingPumpPSEdit(false);
    }
  };

  const handleEditPumpStatusIdvAlarm = async () => {
    setIsSubmittingPumpIdvEdit(true);
    if (!currentPumpStatusIdvAlarm || !currentPumpStatusIdvAlarm.siteId) return;

    const { siteId, site, IdvPump } = newPumpStatusIdvForm;

    if (!siteId || !site || !IdvPump) {
      console.error('Missing required Individual pump status alarm fields');
      setIsSubmittingPumpIdvEdit(false);
      return;
    }

    const requestBody: CreatePumpStatusIdvAlarmRequest = {
      siteId,
      site,
      IdvPump,
      emails: newPumpStatusIdvForm.emails.join(','),
      phones: newPumpStatusIdvForm.phones.join(','),
      method: AlarmMethod.Email,
    };

    try {
      const result = await updatePumpStatusIdvAlarm(currentPumpStatusIdvAlarm.siteId, requestBody);
      if (result.success) {
        toast.success(t('alarms.updateAlarmSuccess'));
        setIsEditPumpStatusIdvOpen(false);
        setCurrentPumpStatusIdvAlarm(null);
        setHasPumpStatusIdvChanges(false);
      } else {
        console.error('Error updating Individual pump status alarm:', result.message);
        const errorMessage = result.message || 'Failed to update Individual pump status alarm.';
        toast.error(errorMessage);
        setPumpStatusIdvSubmissionError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
      setPumpStatusIdvSubmissionError(errorMessage);
    } finally {
      setIsSubmittingPumpIdvEdit(false);
    }
  };

  const handleSetPumpStatusIdvSite = (siteName: string) => {
    setPumpStatusIdvSite(siteName);
    setPumpStatusIdvSiteError(null);
    const selectedSite = sites.find(site => site.name === siteName);
    if (selectedSite) {
      fetchPumpStatusIdvSiteConfiguration(selectedSite.id);
    }
  };

  const handlePumpStatusIdvAlarmEdit = (alarm: any) => {
    const emails = alarm.recipients ? alarm.recipients.filter((r: string) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(r)) : [];
    const phones = alarm.recipients ? alarm.recipients.filter((r: string) => /^\d{11}$/.test(r)) : [];
    
    setCurrentPumpStatusIdvAlarm({
      siteId: alarm.siteId,
      site: alarm.site,
      IdvPump: alarm.IdvPump,
      emails: emails,
      phones: phones,
    });
    setNewPumpStatusIdvForm({
      siteId: alarm.siteId,
      site: alarm.site,
      IdvPump: alarm.IdvPump,
      emails: emails,
      phones: phones,
    });
    setIsEditPumpStatusIdvOpen(true);
  };

  const handlePumpStatusPSAlarmEdit = (alarm: any) => {
    const emails = alarm.recipients ? alarm.recipients.filter((r: string) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(r)) : [];
    const phones = alarm.recipients ? alarm.recipients.filter((r: string) => /^\d{11}$/.test(r)) : [];
    
    setCurrentPumpStatusPSAlarm({
      siteId: alarm.siteId,
      site: alarm.site,
      emails: emails,
      phones: phones,
    });
    setNewPumpStatusPSForm({
      siteId: alarm.siteId,
      site: alarm.site,
      emails: emails,
      phones: phones,
    });
    setIsEditPumpStatusPSOpen(true);
  };

  const handleSensorStatusAlarmEdit = (alarm: any) => {
    const emails = alarm.recipients ? alarm.recipients.filter((r: string) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(r)) : [];
    const phones = alarm.recipients ? alarm.recipients.filter((r: string) => /^\d{11}$/.test(r)) : [];
    
    setCurrentSensorStatusAlarm({
      alarmId: alarm.alarmId,
      method: 0,
      siteId: alarm.siteId,
      site: alarm.site,
      sentMessage: alarm.sentMessage,
      emails: emails,
      phones: phones,
    });
    setNewSensorStatusForm({
      alarmId: alarm.alarmId,
      method: 0,
      siteId: alarm.siteId,
      site: alarm.site,
      sentMessage: alarm.sentMessage,
      emails: emails,
      phones: phones,
    });
    setIsEditSensorStatusOpen(true);
  };

  useEffect(() => {
    if (pumpStatusIdvSiteConfiguration) {
      if ((pumpStatusIdvSiteConfiguration as any).numPumps < 1) {
        setPumpStatusIdvSiteError('alarms.siteHasNoPumps');
      } else {
        setPumpStatusIdvSiteError(null);
      }
    }
  }, [pumpStatusIdvSiteConfiguration]);

  const setThresholdEmails = (newEmails: string[]) => {
    setNewThresholdAlarmForm(prev => ({ ...prev, emails: newEmails }));
  };

  const setThresholdPhones = (newPhones: string[]) => {
    setNewThresholdAlarmForm(prev => ({ ...prev, phones: newPhones }));
  };

  const setCommunicationEmails = (newEmails: string[]) => {
    setNewCommunicationAlarmForm(prev => ({ ...prev, emails: newEmails }));
  };

  const setCommunicationPhones = (newPhones: string[]) => {
    setNewCommunicationAlarmForm(prev => ({ ...prev, phones: newPhones }));
  };
   const setPumpStatusPSEmails = (newEmails: string[]) => {
    setNewPumpStatusPSForm(prev => ({ ...prev, emails: newEmails }));
  };

  const setPumpStatusPSPhones = (newPhones: string[]) => {
    setNewPumpStatusPSForm(prev => ({ ...prev, phones: newPhones }));
  };

  const handleSetPumpStatusPSSiteId = (siteId: number | null) => {
    setPsSiteId(siteId ?? undefined);
  };

   const setPumpStatusIdvEmails = (newEmails: string[]) => {
    setNewPumpStatusIdvForm(prev => ({ ...prev, emails: newEmails }));
  };

  const setPumpStatusIdvPhones = (newPhones: string[]) => {
    setNewPumpStatusIdvForm(prev => ({ ...prev, phones: newPhones }));
  };

  const setSensorStatusEmails = (newEmails: string[]) => {
    setNewSensorStatusForm(prev => ({ ...prev, emails: newEmails }));
  };

  const setSensorStatusPhones = (newPhones: string[]) => {
    setNewSensorStatusForm(prev => ({ ...prev, phones: newPhones }));
  };

  const setSensorStatusSite = (site: string) => {
    setNewSensorStatusForm(prev => ({ ...prev, site }));
  };

  const setSensorStatusSiteId = (siteId: number | null) => {
    setNewSensorStatusForm(prev => ({ ...prev, siteId }));
  };

  const setSensorStatusSentMessage = (sentMessage: string) => {
    setNewSensorStatusForm(prev => ({ ...prev, sentMessage }));
  };

  // Set default site when sites load
  useEffect(() => {
    if (sites.length > 0 && newThresholdAlarmForm.siteId === 0) {
      setNewThresholdAlarmForm(prev => ({ ...prev, siteId: sites[0].id, site: sites[0].name }));
    }
  }, [sites, newThresholdAlarmForm.siteId, sitesLoading]); // Add sitesLoading to dependencies

  useEffect(() => {
    if (sites.length > 0 && newCommunicationAlarmForm.siteId === 0) {
      setNewCommunicationAlarmForm(prev => ({ ...prev, siteId: sites[0].id, site: sites[0].name }));
    }
  }, [sites, newCommunicationAlarmForm.siteId, sitesLoading]); // Add sitesLoading to dependencies

  useEffect(() => {
    if (!isAddThresholdOpen) {
      setIsSubmittingThresholdAdd(false);
    }
  }, [isAddThresholdOpen]);

  useEffect(() => {
    if (!isEditThresholdOpen) {
      setIsSubmittingThresholdEdit(false);
      setHasThresholdChanges(false);
    }
  }, [isEditThresholdOpen]);

  useEffect(() => {
    if (!isAddCommOpen) {
      setIsSubmittingCommAdd(false);
    }
  }, [isAddCommOpen]);

  useEffect(() => {
    if (!isEditCommOpen) {
      setIsSubmittingCommEdit(false);
      setHasCommunicationChanges(false);
    }
  }, [isEditCommOpen]);

  // Helper functions
  const populateThresholdAlarmFormForEdit = (alarm: any) => {
    let siteId = alarm.siteId;
    if (!siteId && alarm.site) {
      const matchingSite = sites.find(s => s.name === alarm.site);
      siteId = matchingSite?.id;
    }

    if (!siteId && alarm.site) {
      const matchingSite = sites.find(s => s.name.trim().toLowerCase() === alarm.site.trim().toLowerCase());
      siteId = matchingSite?.id;
    }

    const emails: string[] = [];
    const phones: string[] = [];

    if (alarm.recipients && Array.isArray(alarm.recipients)) {
      alarm.recipients.forEach((recipient: string) => {
        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        const phoneRegex = /^\d{11}$/;
        if (emailRegex.test(recipient)) {
          emails.push(recipient);
        } else if (phoneRegex.test(recipient)) {
          phones.push(recipient);
        }
      });
    }

    const formData = {
      id: alarm.id,
      siteId: siteId || 0,
      alarmName: alarm.alarmName,
      site: alarm.site,
      field: mapNumberToField[parseInt(alarm.field)],
      operator: mapNumberToOperator[parseInt(alarm.operator)],
      threshold: alarm.threshold,
      color: alarm.color,
      severity: alarm.severity,
      emails: emails,
      phones: phones,
    };
    setNewThresholdAlarmForm(formData);
    setHasThresholdChanges(false);
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
      siteId: siteId || 0,
      alarmName: alarm.alarmName,
      site: alarm.siteName || '',
      //severity: alarm.severity === Severity.Warning ? 'Warning' : 'Critical',
      hours: alarm.numHours || 0,
      emails: emails,
      phones: phones,
    });
    setHasCommunicationChanges(false);
  };

  const handleEditThresholdAlarm = async () => {
    setIsSubmittingThresholdEdit(true);
    if (!currentThresholdAlarm) return;

    const { siteId, alarmName, field, operator, threshold, color } = newThresholdAlarmForm;

    if (!siteId || !alarmName || !field || !operator) {
      console.error('Missing required threshold alarm fields');
      setIsSubmittingThresholdEdit(false);
      return;
    }

    const requestBody: CreateThresholdAlarmRequest = {
      id: currentThresholdAlarm.id,
      siteId,
      alarmName,
      emails: newThresholdAlarmForm.emails.join(','),
      phones: newThresholdAlarmForm.phones.join(','),
      method: AlarmMethod.Email,
      valueThreshold: {
        fieldName: mapFieldToNumber(field),
        operator: mapOperatorToNumber(operator),
        thresholdValue: threshold,
        colorCode: color,
        severity: mapSeverityToNumber(newThresholdAlarmForm.severity),
      },
    };

    try {
      const result = await updateThresholdAlarm(currentThresholdAlarm.id, requestBody);
      if (result.success) {
        toast.success(t('alarms.updateAlarmSuccess'));
        setIsEditThresholdOpen(false);
        setCurrentThresholdAlarm(null);
        setNewThresholdAlarmForm(INITIAL_THRESHOLD_FORM);
      } else {
        console.error('Error updating threshold alarm:', result.message);
        const errorMessage = result.message || 'Failed to update threshold alarm.';
        toast.error(errorMessage);
        setThresholdSubmissionError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
      setThresholdSubmissionError(errorMessage);
    } finally {
      setIsSubmittingThresholdEdit(false);
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
        //severity: mapSeverityToNumber(newCommunicationAlarmForm.severity),
        numHours: hours,
      },
    };

    try {
      const result = await updateCommunicationAlarm(currentCommunicationAlarm.id, requestBody);
      if (result.success) {
        toast.success(t('alarms.updateAlarmSuccess'));
        setIsEditCommOpen(false);
        setCurrentCommunicationAlarm(null);
        setNewCommunicationAlarmForm(INITIAL_COMMUNICATION_FORM);
      } else {
        console.error('Error updating communication alarm:', result.message);
        const errorMessage = result.message || 'Failed to update communication alarm.';
        toast.error(errorMessage);
        setCommunicationSubmissionError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
      setCommunicationSubmissionError(errorMessage);
    } finally {
      setIsSubmittingCommEdit(false);
    }
  };

  const handleThresholdAlarmEdit = (alarm: any) => {
    populateThresholdAlarmFormForEdit(alarm);
    setCurrentThresholdAlarm({
      id: alarm.id,
      siteId: alarm.siteId,
      alarmName: alarm.alarmName,
      site: alarm.site,
      field: alarm.field,
      operator: alarm.operator,
      threshold: alarm.threshold,
      color: alarm.color,
      severity: alarm.severity,
      emails: [],
      phones: [],
    });
    setIsEditThresholdOpen(true);
  };

  const handleCommunicationAlarmEdit = (alarm: any) => {
    const emails = alarm.emails ? alarm.emails.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const phones = alarm.phones ? alarm.phones.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    setCurrentCommunicationAlarm({
      id: alarm.alarmId,
      siteId: alarm.siteId,
      alarmName: alarm.alarmName,
      site: alarm.siteName || '',
      //severity: alarm.severity === Severity.Warning ? 'Warning' : 'Critical',
      hours: alarm.numHours || 0,
      emails: emails,
      phones: phones,
    });
    populateCommunicationAlarmFormForEdit(alarm);
    setIsEditCommOpen(true);
  };

  return (
    <div className="space-y-6" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
      <div>
        <h2 className="text-2xl">{t('navigation.alarms')}</h2>
        <p className="text-gray-500 mt-1">{t('alarms.manageAlarmSettings')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}
          className={`w-full justify-center ${
            t('_rtl') === 'rtl' ? 'flex-row-reverse space-x-reverse' : 'space-x-4'
          } overflow-x-auto`}
        >
          <TabsTrigger value="threshold" className="flex items-center space-x-2">
            <AlertTriangle className="ml-2 h-4 w-4" />
            <span>{t('alarms.thresholdAlarms')}</span>
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center space-x-2">
            <WifiOff className="ml-2 h-4 w-4" />
            {t('alarms.communicationAlarms')}
          </TabsTrigger>
          <TabsTrigger value="sensorStatus" className="flex items-center space-x-2">
            <SmartphoneNfc className="ml-2 h-4 w-4" />
            {t('alarms.sensorStatus')}
          </TabsTrigger>
          <TabsTrigger value="pumpStatusPS" className="flex items-center space-x-2">
            <Wrench className="ml-2 h-4 w-4" />
            {t('alarms.pumpStatusPS')}
          </TabsTrigger>
          <TabsTrigger value="pumpStatusIdv" className="flex items-center space-x-2">
            <Wrench className="ml-2 h-4 w-4" />
            {t('alarms.pumpStatusIdv')}
          </TabsTrigger>

        </TabsList>

        {/* Threshold Alarms Tab */}
        <TabsContent value="threshold" className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader />
            </div>
          ) : (
            <Card>
              <CardHeader className={`flex items-center gap-4 ${t('_rtl') === 'rtl' ? 'flex-row-reverse' : ''}`} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <CardTitle className={t('_rtl') === 'rtl' ? 'text-right flex-1' : 'text-left flex-1'}>
                  {t('alarms.thresholdAlarms')} ({thresholdAlarms.length})
                </CardTitle>

                {currentUser.role === 'Admin' && (
                  <Dialog open={isAddThresholdOpen} onOpenChange={setIsAddThresholdOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setNewThresholdAlarmForm(INITIAL_THRESHOLD_FORM)}>
                        <Plus className={t('_rtl') === 'rtl' ? 'mr-2 h-4 w-4' : 'ml-2 h-4 w-4'} />
                        {t('alarms.addThresholdAlarm')}
                      </Button>
                    </DialogTrigger>
                    <AddThresholdAlarmDialog
                      open={isAddThresholdOpen}
                      onOpenChange={setIsAddThresholdOpen}
                      form={newThresholdAlarmForm}
                      setForm={setNewThresholdAlarmForm}
                      sites={sites}
                      sitesLoading={sitesLoading}
                      sitesError={sitesError}
                      availableFields={availableFields}
                      onSubmit={handleSubmitThresholdAlarm}
                      isSubmitting={isSubmittingThresholdAdd}
                      submissionError={thresholdSubmissionError}
                      setEmails={setThresholdEmails}
                      setPhones={setThresholdPhones}
                    />
                  </Dialog>
                )}
              </CardHeader>

              <CardContent>
                <ThresholdAlarmTable
                  alarms={thresholdAlarms}
                  onEdit={handleThresholdAlarmEdit}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Communication Loss Alarms Tab */}
        <TabsContent value="communication" className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader />
            </div>
          ) : (
            <Card>
              <CardHeader className={`flex items-center gap-4 ${t('_rtl') === 'rtl' ? 'flex-row-reverse' : ''}`} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <CardTitle className={t('_rtl') === 'rtl' ? 'text-right flex-1' : 'text-left flex-1'}>
                  {t('alarms.communicationAlarms')} ({communicationAlarms.length})
                </CardTitle>

                {currentUser.role === 'Admin' && (
                  <Dialog open={isAddCommOpen} onOpenChange={setIsAddCommOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setNewCommunicationAlarmForm(INITIAL_COMMUNICATION_FORM)}>
                        <Plus className={t('_rtl') === 'rtl' ? 'mr-2 h-4 w-4' : 'ml-2 h-4 w-4'} />
                        {t('alarms.addCommunicationAlarm')}
                      </Button>
                    </DialogTrigger>
                    <AddCommunicationAlarmDialog
                      open={isAddCommOpen}
                      onOpenChange={setIsAddCommOpen}
                      form={newCommunicationAlarmForm}
                      setForm={setNewCommunicationAlarmForm}
                      sites={sites}
                      sitesLoading={sitesLoading}
                      sitesError={sitesError}
                      onSubmit={handleSubmitCommunicationAlarm}
                      isSubmitting={isSubmittingCommAdd}
                      submissionError={communicationSubmissionError}
                      setEmails={setCommunicationEmails}
                      setPhones={setCommunicationPhones}
                    />
                  </Dialog>
                )}
              </CardHeader>

              <CardContent>
                <CommunicationAlarmTable
                  alarms={communicationAlarms}
                  onEdit={handleCommunicationAlarmEdit}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      

        <TabsContent value="sensorStatus" className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader />
            </div>
          ) : (
            <Card>
              <CardHeader className="flex justify-between items-center" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <CardTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                  {t('alarms.sensorStatus')} ({sensorStatusAlarms.length})

                </CardTitle>

                {currentUser.role === 'Admin' && (
                  <Dialog open={isAddSensorStatusOpen} onOpenChange={setIsAddSensorStatusOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setNewSensorStatusForm(INITIAL_SENSOR_STATUS_FORM)}>
                        <Plus className={t('_rtl') === 'rtl' ? 'mr-2 h-4 w-4' : 'ml-2 h-4 w-4'} />
                        {t('alarms.addSensorStatusAlarm')}
                      </Button>
                    </DialogTrigger>
                    <AddSensorStatusAlarmDialog
                      open={isAddSensorStatusOpen}
                      onOpenChange={setIsAddSensorStatusOpen}
                      form={newSensorStatusForm}
                      setForm={setNewSensorStatusForm}
                      onSubmit={handleSubmitSensorStatusAlarm}
                      isSubmitting={isSubmittingSensorStatusAdd}
                      alarmId={null}
                      setSiteId={setSensorStatusSiteId}
                      setSite={setSensorStatusSite}
                      setEmails={setSensorStatusEmails}
                      setPhones={setSensorStatusPhones}
                      setSentMessage={setSensorStatusSentMessage}
                      submissionError={sensorStatusSubmissionError}
                      sites={sites}
                      sitesLoading={sitesLoading}
                    />
                  </Dialog>
                )}
              </CardHeader>

              <CardContent>
                <SensorStatusTable
                  alarms={sensorStatusAlarms}
                  onEdit={handleSensorStatusAlarmEdit}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pumpStatusPS" className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader />
            </div>
          ) : (
            <Card>
              <CardHeader className={`flex items-center gap-4 ${t('_rtl') === 'rtl' ? 'flex-row-reverse' : ''}`} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <CardTitle className={t('_rtl') === 'rtl' ? 'text-right flex-1' : 'text-left flex-1'}>
                  {t('alarms.PumpStatusPSAlarms')} ({pumpStatusPSAlarms.length})
                </CardTitle>

                {currentUser.role === 'Admin' && (
                  <Dialog open={isAddPumpStatusPSOpen} onOpenChange={(open) => {
                    setIsAddPumpStatusPSOpen(open);
                    if (!open) {
                      // Clear submission error when dialog closes
                      setPumpStatusPSSubmissionError(null);
                      setNewPumpStatusPSForm(INITIAL_PumpStatusPS_FORM);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setNewPumpStatusPSForm(INITIAL_PumpStatusPS_FORM)}>
                        <Plus className={t('_rtl') === 'rtl' ? 'mr-2 h-4 w-4' : 'ml-2 h-4 w-4'} />
                        {t('alarms.addPumpStatusPSAlarm')}
                      </Button>
                    </DialogTrigger>
                    <AddPumpStatusPSAlarmDialog
                      form={newPumpStatusPSForm}
                      setForm={setNewPumpStatusPSForm}
                      onSubmit={handleSubmitPumpStatusPSAlarm}
                      isSubmitting={isSubmittingPumpPSAdd}
                      setEmails={setPumpStatusPSEmails}
                      setPhones={setPumpStatusPSPhones}
                      setSite={setPumpStatusPSSite}
                      setSiteId={handleSetPumpStatusPSSiteId}
                      setSentMessage={setSentMessage}
                      submissionError={pumpStatusPSSubmissionError}
                      sites={sites}
                      sitesLoading={sitesLoading}/>
                  </Dialog>
                )}
              </CardHeader>

              <CardContent>
                <PumpStatusPSTable
                  alarms={pumpStatusPSAlarms} 
                onEdit={handlePumpStatusPSAlarmEdit}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pumpStatusIdv" className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader />
            </div>
          ) : (
            <Card>
              <CardHeader className={`flex items-center gap-4 ${t('_rtl') === 'rtl' ? 'flex-row-reverse' : ''}`} dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <CardTitle className={t('_rtl') === 'rtl' ? 'text-right flex-1' : 'text-left flex-1'}>
                  {t('alarms.PumpStatusIdvAlarms')} ({pumpStatusIdvAlarms.length})
                </CardTitle>

                {currentUser.role === 'Admin' && (
                  <Dialog open={isAddPumpStatusIdvOpen} onOpenChange={(open) => {
                    setIsAddPumpStatusIdvOpen(open);
                    if (!open) {
                      // Clear submission error when dialog closes
                      setPumpStatusIdvSubmissionError(null);
                      setNewPumpStatusIdvForm(INITIAL_PumpStatusIdv_FORM);
                      setPumpStatusIdvSiteError(null);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setNewPumpStatusIdvForm(INITIAL_PumpStatusIdv_FORM)}>
                        <Plus className={t('_rtl') === 'rtl' ? 'mr-2 h-4 w-4' : 'ml-2 h-4 w-4'} />
                        {t('alarms.addPumpStatusIdvAlarm')}
                      </Button>
                    </DialogTrigger>
                    <AddPumpStatusIdvAlarmDialog 
                    open={isAddPumpStatusIdvOpen}
                    onOpenChange={setIsAddPumpStatusIdvOpen}
                    form={newPumpStatusIdvForm}
                    setForm={setNewPumpStatusIdvForm}
                    onSubmit={handleSubmitPumpStatusIdvAlarm}
                    isSubmitting={isSubmittingPumpIdvAdd}
                    setEmails={setPumpStatusIdvEmails}
                    setPhones={setPumpStatusIdvPhones}
                    setSite={handleSetPumpStatusIdvSite}
                    setIdvPump={setPumpStatusIdvIdvPump}
                    submissionError={pumpStatusIdvSubmissionError}
                    sites={sites}
                    sitesLoading={sitesLoading}
                    siteConfiguration={pumpStatusIdvSiteConfiguration}
                    configLoading={pumpStatusIdvConfigLoading}
                    siteError={pumpStatusIdvSiteError}/>
                 
                  </Dialog>
          
                )}
              </CardHeader>

              <CardContent>
                <PumpStatusIdvTable 
                alarms={pumpStatusIdvAlarms} 
                onEdit={handlePumpStatusIdvAlarmEdit}/>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        </Tabs>

      {/* Edit Dialogs */}
      <EditThresholdAlarmDialog
        open={isEditThresholdOpen}
        onOpenChange={setIsEditThresholdOpen}
        form={newThresholdAlarmForm}
        setForm={setNewThresholdAlarmForm}
        currentAlarm={currentThresholdAlarm}
        sites={sites}
        sitesLoading={sitesLoading}
        sitesError={sitesError}
        availableFields={availableFields}
        onSubmit={handleEditThresholdAlarm}
        isSubmitting={isSubmittingThresholdEdit}
        hasChanges={hasThresholdChanges}
        setHasChanges={setHasThresholdChanges}
        setEmails={setThresholdEmails}
        setPhones={setThresholdPhones}
        submissionError={thresholdSubmissionError}
      />

      <EditCommunicationAlarmDialog
        open={isEditCommOpen}
        onOpenChange={setIsEditCommOpen}
        form={newCommunicationAlarmForm}
        setForm={setNewCommunicationAlarmForm}
        currentAlarm={currentCommunicationAlarm}
        sites={sites}
        sitesLoading={sitesLoading}
        sitesError={sitesError}
        onSubmit={handleEditCommunicationAlarm}
        isSubmitting={isSubmittingCommEdit}
        hasChanges={hasCommunicationChanges}
        setHasChanges={setHasCommunicationChanges}
        setEmails={setCommunicationEmails}
        setPhones={setCommunicationPhones}
        submissionError={communicationSubmissionError}
      />

      <EditSensorStatusAlarmDialog/>

      <EditPumpStatusPSAlarmDialog
        open={isEditPumpStatusPSOpen}
        onOpenChange={setIsEditPumpStatusPSOpen}
        form={newPumpStatusPSForm}
        setForm={setNewPumpStatusPSForm}
        currentAlarm={currentPumpStatusPSAlarm}
        sites={sites}
        sitesLoading={sitesLoading}
        sitesError={sitesError}
        onSubmit={handleEditPumpStatusPSAlarm}
        isSubmitting={isSubmittingPumpPSEdit}
        hasChanges={hasPumpStatusPSChanges}
        setHasChanges={setHasPumpStatusPSChanges}
        setEmails={setPumpStatusPSEmails}
        setPhones={setPumpStatusPSPhones}
        submissionError={pumpStatusPSSubmissionError}
      />

      <EditPumpStatusIdvAlarmDialog
        open={isEditPumpStatusIdvOpen}
        onOpenChange={setIsEditPumpStatusIdvOpen}
        form={newPumpStatusIdvForm}
        setForm={setNewPumpStatusIdvForm}
        currentAlarm={currentPumpStatusIdvAlarm}
        sites={sites}
        sitesLoading={sitesLoading}
        sitesError={sitesError}
        siteConfiguration={pumpStatusIdvSiteConfiguration}
        configLoading={pumpStatusIdvConfigLoading}
        siteError={pumpStatusIdvSiteError}
        onSubmit={handleEditPumpStatusIdvAlarm}
        isSubmitting={isSubmittingPumpIdvEdit}
        hasChanges={hasPumpStatusIdvChanges}
        setHasChanges={setHasPumpStatusIdvChanges}
        setEmails={setPumpStatusIdvEmails}
        setPhones={setPumpStatusIdvPhones}
        submissionError={pumpStatusIdvSubmissionError}
      />
    </div>
  );
}
