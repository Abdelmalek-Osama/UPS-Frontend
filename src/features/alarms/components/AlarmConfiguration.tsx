import React, { useState, useEffect, useCallback } from 'react';
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
import { useSitesLookup, useSitesLookupWithPumpFilter } from '../hooks/useSitesLookup';
import { useThresholdAlarmFields } from '../hooks/useThresholdAlarmFields';
import { useSensorStatusAlarmFields } from '../hooks/useSensorStatusAlarmFields';

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
import { PumpStatusIdvTable } from './tables/PumpStatusIdvTable'
import { AddThresholdAlarmDialog } from './dialogs/AddThresholdAlarmDialog';
import { EditThresholdAlarmDialog } from './dialogs/EditThresholdAlarmDialog';
import { AddCommunicationAlarmDialog } from './dialogs/AddCommunicationAlarmDialog';
import { EditCommunicationAlarmDialog } from './dialogs/EditCommunicationAlarmDialog';
import { AddSensorStatusAlarmDialog } from './dialogs/AddSensorStatusAlarmDialog';
import { EditSensorStatusAlarmDialog } from './dialogs/EditSensorStatusAlarmDialog';
import { AddPumpStatusPSAlarmDialog} from './dialogs/AddPumpStatusPSAlarmDialog';
import { EditPumpStatusPSAlarmDialog } from './dialogs/EditPumpStatusPSAlarmDialog';
import { AddPumpStatusIdvAlarmDialog } from './dialogs/AddPumpStatusIdvAlarmDialog';
import { EditPumpStatusIdvAlarmDialog } from './dialogs/EditPumpStatusIdvAlarmDialog';
import { AlertDialog } from '../../../shared/components/AlertDialog';

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
    deleteSensorStatusAlarm,
    deleteThresholdAlarm,
    deleteCommunicationAlarm,
    createPumpStatusPSAlarm,
    createPumpStatusIdvAlarm,
    updateThresholdAlarm,
    updateCommunicationAlarm,
    updatePumpStatusPSAlarm,
    deletePumpStatusPSAlarm,
    updatePumpStatusIdvAlarm,
    deletePumpStatusIdvAlarm,
    isLoading,
    fetchError,
    fetchPumpStatusIdvSiteConfiguration,
    pumpStatusIdvSiteConfiguration,
    pumpStatusIdvConfigLoading,
    fetchPumpStatusPSSiteConfiguration,
    pumpStatusPSSiteConfiguration,
    pumpStatusPSConfigLoading,
  } = useAlarmsData();

  // Use regular sites lookup for all alarms (threshold, communication, sensor status)
  const { sites, sitesLoading, sitesError } = useSitesLookup();
  
  // Use pump-filtered sites lookup specifically for pump status alarms
  const { sites: pumpSites, sitesLoading: pumpSitesLoading, sitesError: pumpSitesError } = useSitesLookupWithPumpFilter();

  const [activeTab, setActiveTab] = useState('threshold');
  const [isAddThresholdOpen, setIsAddThresholdOpen] = useState(false);
  const [isEditThresholdOpen, setIsEditThresholdOpen] = useState(false);
  const [currentThresholdAlarm, setCurrentThresholdAlarm] = useState<ThresholdAlarmForm | null>(null);
  const [newThresholdAlarmForm, setNewThresholdAlarmForm] = useState<ThresholdAlarmForm>(INITIAL_THRESHOLD_FORM);
  const [newCommunicationAlarmForm, setNewCommunicationAlarmForm] = useState<CommunicationAlarmForm>(INITIAL_COMMUNICATION_FORM);
  const [isEditCommOpen, setIsEditCommOpen] = useState(false);
  const [isAddSensorStatusOpen, setIsAddSensorStatusOpen] = useState(false);
  const [isEditSensorStatusOpen, setIsEditSensorStatusOpen] = useState(false);
  const [isDeleteSensorStatusOpen, setIsDeleteSensorStatusOpen] = useState(false);
  const [sensorStatusAlarmToDelete, setSensorStatusAlarmToDelete] = useState<number | null>(null);
  const [isDeleteThresholdOpen, setIsDeleteThresholdOpen] = useState(false);
  const [thresholdAlarmToDelete, setThresholdAlarmToDelete] = useState<number | null>(null);
  const [isDeleteCommOpen, setIsDeleteCommOpen] = useState(false);
  const [commAlarmToDelete, setCommAlarmToDelete] = useState<number | null>(null);
  const [isDeletePumpStatusPSOpen, setIsDeletePumpStatusPSOpen] = useState(false);
  const [pumpStatusPSAlarmToDelete, setPumpStatusPSAlarmToDelete] = useState<number | null>(null);
  const [isDeletePumpStatusIdvOpen, setIsDeletePumpStatusIdvOpen] = useState(false);
  const [pumpStatusIdvAlarmToDelete, setPumpStatusIdvAlarmToDelete] = useState<number | null>(null);
  const [currentSensorStatusAlarm, setCurrentSensorStatusAlarm] = useState<SensorStatusForm | null>(null);
  const [newSensorStatusForm, setNewSensorStatusForm] = useState<SensorStatusForm>(INITIAL_SENSOR_STATUS_FORM);
  const [isAddPumpStatusPSOpen, setIsAddPumpStatusPSOpen] = useState(false);
  const [isEditPumpStatusPSOpen, setIsEditPumpStatusPSOpen]= useState(false);
  const [currentPumpStatusPSAlarm, setCurrentPumpStatusPSAlarm] = useState<PumpStatusPSAlarmForm | null>(null);
  const [newPumpStatusPSForm, setNewPumpStatusPSForm] = useState<PumpStatusPSAlarmForm>(INITIAL_PumpStatusPS_FORM);
  const [isAddPumpStatusIdvOpen, setIsAddPumpStatusIdvOpen] = useState(false);
  const [isEditPumpStatusIdvOpen, setIsEditPumpStatusIdvOpen]= useState(false);
  const [currentPumpStatusIdvAlarm, setCurrentPumpStatusIdvAlarm] = useState<PumpStatusIdvAlarmForm | null>(null);
  const [newPumpStatusIdvForm, setNewPumpStatusIdvForm] = useState<PumpStatusIdvAlarmForm>({
    ...INITIAL_PumpStatusIdv_FORM,
    pumpNumber: 1,
    monitoringHours: 24,
  });
  const [currentCommunicationAlarm, setCurrentCommunicationAlarm] = useState<CommunicationAlarmForm | null>(null);
  const [isSubmittingThresholdAdd, setIsSubmittingThresholdAdd] = useState(false);
  const [isSubmittingThresholdEdit, setIsSubmittingThresholdEdit] = useState(false);
  const [isSubmittingCommAdd, setIsSubmittingCommAdd] = useState(false);
  const [isSubmittingCommEdit, setIsSubmittingCommEdit] = useState(false);
  const [isSubmittingSensorStatusAdd, setIsSubmittingSensorStatusAdd] = useState(false);
  const [isSubmittingSensorStatusEdit, setIsSubmittingSensorStatusEdit] = useState(false);
  const [isSubmittingPumpPSAdd, setIsSubmittingPumpPSAdd] = useState(false);
  const [isSubmittingPumpPSEdit, setIsSubmittingPumpPSEdit] = useState(false);
  const [isSubmittingPumpIdvAdd, setIsSubmittingPumpIdvAdd] = useState(false);
  const [isSubmittingPumpIdvEdit, setIsSubmittingPumpIdvEdit] = useState(false);
  const [hasThresholdChanges, setHasThresholdChanges] = useState(false);
  const [hasCommunicationChanges, setHasCommunicationChanges] = useState(false);
  const [hasSensorStatusChanges, setHasSensorStatusChanges] = useState(false);
  const [hasPumpStatusPSChanges, setHasPumpStatusPSChanges] = useState(false);
  const [hasPumpStatusIdvChanges, setHasPumpStatusIdvChanges] = useState(false);
  const [thresholdSubmissionError, setThresholdSubmissionError] = useState<string | null>(null);
  const [communicationSubmissionError, setCommunicationSubmissionError] = useState<string | null>(null);
  const [sensorStatusSubmissionError, setSensorStatusSubmissionError] = useState<string | null>(null);
  const [pumpStatusPSSubmissionError, setPumpStatusPSSubmissionError] = useState<string | null>(null);
  const [pumpStatusIdvSubmissionError, setPumpStatusIdvSubmissionError] = useState<string | null>(null);
  const [pumpStatusIdvIdvPump,setPumpStatusIdvIdvPump] = useState<string>('');
  const [pumpStatusPSSite, setPumpStatusPSSite] = useState<string>('');
  const [psSiteId, setPsSiteId] = useState<number | undefined>(undefined);
  const [pumpStatusIdvSite, setPumpStatusIdvSite] = useState<string>('');
  const [pumpStatusIdvSiteError, setPumpStatusIdvSiteError] = useState<string | null>(null);
  const [pumpStatusPSSiteError, setPumpStatusPSSiteError] = useState<string | null>(null);
  const { availableFields, isFetchingSiteDetails } = useThresholdAlarmFields(newThresholdAlarmForm.siteId);
  const { availableFields: sensorStatusAvailableFields, isFetchingSiteDetails: sensorStatusIsFetchingSiteDetails } = useSensorStatusAlarmFields(newSensorStatusForm.siteId);

  // Filter alarms based on operator's assigned sites
  const filteredThresholdAlarms = React.useMemo(() => {
    if (currentUser.role === 'Admin') {
      return thresholdAlarms;
    }
    // For operators, filter by assigned sites
    const assignedSiteIds = currentUser.sites?.map(site => site.id) || [];
    return thresholdAlarms.filter(alarm => assignedSiteIds.includes(alarm.siteId));
  }, [thresholdAlarms, currentUser]);

  const filteredCommunicationAlarms = React.useMemo(() => {
    if (currentUser.role === 'Admin') {
      return communicationAlarms;
    }
    
    // Build a map of site names to IDs from available sites (already filtered for operators)
    const siteNameToIdMap = new Map<string, number>();
    sites.forEach(site => {
      siteNameToIdMap.set(site.name.toLowerCase(), site.id);
      // Also map Arabic names if available
      if (site.arabicName) {
        siteNameToIdMap.set(site.arabicName.toLowerCase(), site.id);
      }
    });
    
    const assignedSiteIds = currentUser.sites?.map(site => site.id) || [];
    
    return communicationAlarms.filter(alarm => {
      // If siteId exists, use it directly
      if (alarm.siteId) {
        return assignedSiteIds.includes(alarm.siteId);
      }
      // Otherwise, try to match by siteName
      if (alarm.siteName) {
        const matchedSiteId = siteNameToIdMap.get(alarm.siteName.toLowerCase());
        return matchedSiteId !== undefined && assignedSiteIds.includes(matchedSiteId);
      }
      return false;
    });
  }, [communicationAlarms, currentUser, sites]);

  const filteredSensorStatusAlarms = React.useMemo(() => {
    if (currentUser.role === 'Admin') {
      return sensorStatusAlarms;
    }
    const assignedSiteIds = currentUser.sites?.map(site => site.id) || [];
    return sensorStatusAlarms.filter(alarm => assignedSiteIds.includes(alarm.siteId));
  }, [sensorStatusAlarms, currentUser]);

  const filteredPumpStatusPSAlarms = React.useMemo(() => {
    if (currentUser.role === 'Admin') {
      return pumpStatusPSAlarms;
    }
    const assignedSiteIds = currentUser.sites?.map(site => site.id) || [];
    return pumpStatusPSAlarms.filter(alarm => assignedSiteIds.includes(alarm.siteId));
  }, [pumpStatusPSAlarms, currentUser]);

  const filteredPumpStatusIdvAlarms = React.useMemo(() => {
    if (currentUser.role === 'Admin') {
      return pumpStatusIdvAlarms;
    }
    const assignedSiteIds = currentUser.sites?.map(site => site.id) || [];
    return pumpStatusIdvAlarms.filter(alarm => assignedSiteIds.includes(alarm.siteId));
  }, [pumpStatusIdvAlarms, currentUser]);

  const handleSensorStatusDialogOpenChange = useCallback((open: boolean) => {
    setIsAddSensorStatusOpen(open);
    if (!open) {
      setSensorStatusSubmissionError(null);
    }
  }, []);

  const handlePumpStatusPSDialogOpenChange = useCallback((open: boolean) => {
    setIsAddPumpStatusPSOpen(open);
    if (!open) {
      setPumpStatusPSSubmissionError(null);
    }
  }, []);

  const handlePumpStatusIdvDialogOpenChange = useCallback((open: boolean) => {
    setIsAddPumpStatusIdvOpen(open);
    if (!open) {
      setPumpStatusIdvSubmissionError(null);
    }
  }, []);

  // Form submission handlers
  const handleSubmitThresholdAlarm = async () => {
    setIsSubmittingThresholdAdd(true);
    setThresholdSubmissionError(null); // Clear previous errors
    const { siteId, alarmName, field, criticalOperator, criticalThresholdValue, criticalColorCode, crisisOperator, crisisThresholdValue, crisisColorCode } = newThresholdAlarmForm;

    // Validate required fields with detailed messages
    const errors = [];
    if (!siteId) errors.push(t('alarms.validation.siteRequired'));
    if (!alarmName) errors.push(t('alarms.validation.alarmNameEmpty'));
    if (!field) errors.push(t('alarms.validation.fieldRequired'));
    if (!criticalOperator) errors.push(t('alarms.operators.greaterThan') + ' ' + t('alarms.validation.messageRequired'));
    if (!crisisOperator) errors.push(t('alarms.operators.greaterThan') + ' ' + t('alarms.validation.messageRequired'));
    if (newThresholdAlarmForm.emails.length === 0 && newThresholdAlarmForm.phones.length === 0) {
      errors.push(t('alarms.validation.atLeastOneRecipient'));
    }

    if (errors.length > 0) {
      const errorMessage = errors.join('. ');
      setThresholdSubmissionError(errorMessage);
      setIsSubmittingThresholdAdd(false);
      return;
    }

    const requestBody: CreateThresholdAlarmRequest = {
      id: 0,
      siteId: siteId || 0,
      alarmName,
      emails: newThresholdAlarmForm.emails.join(','),
      phones: newThresholdAlarmForm.phones.join(','),
      method: AlarmMethod.Email,
      valueThreshold: {
        fieldName: mapFieldToNumber(field),
        criticalOperator: mapOperatorToNumber(criticalOperator),
        criticalThresholdValue: criticalThresholdValue,
        criticalColorCode: criticalColorCode,
        crisisOperator: mapOperatorToNumber(crisisOperator),
        crisisThresholdValue: crisisThresholdValue,
        crisisColorCode: crisisColorCode,
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

    // Validate required fields
    const errors = [];
    if (!siteId) errors.push(t('alarms.validation.siteRequired'));
    if (!alarmName) errors.push(t('alarms.validation.alarmNameEmpty'));
    if (newCommunicationAlarmForm.emails.length === 0 && newCommunicationAlarmForm.phones.length === 0) {
      errors.push(t('alarms.validation.atLeastOneRecipient'));
    }

    if (errors.length > 0) {
      const errorMessage = errors.join('. ');
      setCommunicationSubmissionError(errorMessage);
      setIsSubmittingCommAdd(false);
      return;
    }

    const requestBody: CreateCommunicationAlarmRequest = {
      id: 0,
      siteId: siteId || 0,
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
    const { siteId, site, alarmName, message, field, threshold, emails, phones } = newSensorStatusForm;

    // Validate required fields with detailed messages
    const errors = [];
    if (!siteId || !site) errors.push(t('alarms.validation.siteRequired'));
    if (!alarmName) errors.push(t('alarms.validation.alarmNameEmpty'));
    if (!field) errors.push(t('alarms.validation.fieldRequired'));
    if (threshold === 0) errors.push(t('alarms.validation.thresholdRequired'));
    if (!message) errors.push(t('alarms.validation.messageRequired'));
    if (emails.length === 0 && phones.length === 0) errors.push(t('alarms.validation.atLeastOneRecipient'));

    if (errors.length > 0) {
      const errorMessage = errors.join('. ');
      setSensorStatusSubmissionError(errorMessage);
      setIsSubmittingSensorStatusAdd(false);
      return;
    }

    const requestBody: CreateSensorStatusAlarmRequest = {
      id: 0,
      siteId: siteId || 0,
      alarmName,
      emails: newSensorStatusForm.emails.join(','),
      phones: newSensorStatusForm.phones.join(','),
      method: newSensorStatusForm.method,
      fieldName: mapFieldToNumber(field),
      operator: 4,
      thresholdValue: newSensorStatusForm.threshold,
      savingType: 0,
      customMessage: message,
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
      id: newPumpStatusPSForm.id,
      siteId,
      alarmName: newPumpStatusPSForm.alarmName,
      emails: newPumpStatusPSForm.emails.join(','),
      phones: newPumpStatusPSForm.phones.join(','),
      method: 0,
      pumpStatusOperation: {
        monitoringHours: newPumpStatusPSForm.monitoringHours,
      },
    };

    try {
      const result = await createPumpStatusPSAlarm(requestBody);
      if (result.success) {
        toast.success(t('alarms.addPumpStatusPSSuccess'));
        setIsAddPumpStatusPSOpen(false);
        setNewPumpStatusPSForm(INITIAL_PumpStatusPS_FORM);
      } else {
        const errorMessage = result.message || t('errors.failedToCreateAlarm');
        toast.error(errorMessage);
        setPumpStatusPSSubmissionError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || t('errors.unexpectedError');
      toast.error(errorMessage);
      setPumpStatusPSSubmissionError(errorMessage);
    } finally {
      setIsSubmittingPumpPSAdd(false);
    }
  };

  const handleSubmitPumpStatusIdvAlarm = async () => {
    setIsSubmittingPumpIdvAdd(true);
    setPumpStatusIdvSubmissionError(null); // Clear previous errors
    const { siteId, alarmName, pumpNumber, monitoringHours } = newPumpStatusIdvForm;

    // Ensure numeric values
    const pumpNum = pumpNumber ? Number(pumpNumber) : 0;
    const monHours = monitoringHours ? Number(monitoringHours) : 0;

    

    if (!siteId || !alarmName || pumpNum < 1 || pumpNum > 10 || monHours < 1 || monHours > 168) {
      const errors = [];
      if (!siteId) errors.push('Site is required');
      if (!alarmName) errors.push('Alarm name is required');
      if (isNaN(pumpNum) || pumpNum < 1 || pumpNum > 10) errors.push('Pump number must be between 1 and 10');
      if (isNaN(monHours) || monHours < 1 || monHours > 168) errors.push('Monitoring hours must be between 1 and 168');
      const errorMessage = errors.join(', ');
      toast.error(errorMessage);
      setPumpStatusIdvSubmissionError(errorMessage);
      setIsSubmittingPumpIdvAdd(false);
      return;
    }

    const requestBody: CreatePumpStatusIdvAlarmRequest = {
      alarmName,
      siteId,
      pumpNumber: pumpNum,
      monitoringHours: monHours,
      emails: newPumpStatusIdvForm.emails.join(','),
      phones: newPumpStatusIdvForm.phones.join(','),
      method: 'Email',
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

  const handleEditSensorStatusAlarm = async () => {
    setIsSubmittingSensorStatusEdit(true);
    setSensorStatusSubmissionError(null);
    if (!currentSensorStatusAlarm || !currentSensorStatusAlarm.siteId) {
      setIsSubmittingSensorStatusEdit(false);
      return;
    }

    const { siteId, site, alarmName, message, field, threshold, emails, phones } = newSensorStatusForm;

    // Validate required fields with detailed messages
    const errors = [];
    if (!siteId || !site) errors.push(t('alarms.validation.siteRequired'));
    if (!alarmName) errors.push(t('alarms.validation.alarmNameEmpty'));
    if (!field) errors.push(t('alarms.validation.fieldRequired'));
    if (threshold === 0) errors.push(t('alarms.validation.thresholdRequired'));
    if (!message) errors.push(t('alarms.validation.messageRequired'));
    if (emails.length === 0 && phones.length === 0) errors.push(t('alarms.validation.atLeastOneRecipient'));

    if (errors.length > 0) {
      const errorMessage = errors.join('. ');
      setSensorStatusSubmissionError(errorMessage);
      setIsSubmittingSensorStatusEdit(false);
      return;
    }

    const alarmIdToUse = currentSensorStatusAlarm.alarmId || newSensorStatusForm.alarmId || 0;

    const requestBody: CreateSensorStatusAlarmRequest = {
      id: alarmIdToUse,
      siteId: siteId || 0,
      alarmName,
      emails: newSensorStatusForm.emails.join(','),
      phones: newSensorStatusForm.phones.join(','),
      method: newSensorStatusForm.method,
      fieldName: mapFieldToNumber(field),
      operator: 4,
      thresholdValue: newSensorStatusForm.threshold,
      savingType: 0,
      customMessage: message,
    };
    

    try {
      const result = await updateSensorStatusAlarm(alarmIdToUse, requestBody);
      if (result.success) {
        toast.success(t('alarms.updateAlarmSuccess'));
        setIsEditSensorStatusOpen(false);
        setCurrentSensorStatusAlarm(null);
        setHasSensorStatusChanges(false);
      } else {
        const errorMessage = result.message || 'Failed to update sensor status alarm.';
        toast.error(errorMessage);
        setSensorStatusSubmissionError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
      setSensorStatusSubmissionError(errorMessage);
    } finally {
      setIsSubmittingSensorStatusEdit(false);
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
      id: newPumpStatusPSForm.id,
      siteId: siteId || 0,
      alarmName: newPumpStatusPSForm.alarmName,
      emails: newPumpStatusPSForm.emails.join(','),
      phones: newPumpStatusPSForm.phones.join(','),
      method: 0,
      pumpStatusOperation: {
        monitoringHours: newPumpStatusPSForm.monitoringHours,
      },
    };

    try {
      const result = await updatePumpStatusPSAlarm(currentPumpStatusPSAlarm.id || 0, requestBody);
      if (result.success) {
        toast.success(t('alarms.updateAlarmSuccess'));
        setIsEditPumpStatusPSOpen(false);
        setCurrentPumpStatusPSAlarm(null);
        setHasPumpStatusPSChanges(false);
      } else {
        const errorMessage = result.message || t('errors.failedToUpdateAlarm');
        toast.error(errorMessage);
        setPumpStatusPSSubmissionError(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || t('errors.unexpectedError');
      toast.error(errorMessage);
      setPumpStatusPSSubmissionError(errorMessage);
    } finally {
      setIsSubmittingPumpPSEdit(false);
    }
  };

  const handleEditPumpStatusIdvAlarm = async () => {
    setIsSubmittingPumpIdvEdit(true);
    if (!currentPumpStatusIdvAlarm || !currentPumpStatusIdvAlarm.siteId) return;

    const { siteId, alarmName, pumpNumber, monitoringHours } = newPumpStatusIdvForm;

    // Ensure numeric values
    const pumpNum = Number(pumpNumber);
    const monHours = Number(monitoringHours);

    if (!siteId || !alarmName || pumpNum < 1 || pumpNum > 10 || monHours < 1 || monHours > 168) {
      const errors = [];
      if (!siteId) errors.push('Site is required');
      if (!alarmName) errors.push('Alarm name is required');
      if (isNaN(pumpNum) || pumpNum < 1 || pumpNum > 10) errors.push('Pump number must be between 1 and 10');
      if (isNaN(monHours) || monHours < 1 || monHours > 168) errors.push('Monitoring hours must be between 1 and 168');
      const errorMessage = errors.join(', ');
      toast.error(errorMessage);
      setPumpStatusIdvSubmissionError(errorMessage);
      setIsSubmittingPumpIdvEdit(false);
      return;
    }

    const requestBody: CreatePumpStatusIdvAlarmRequest = {
      id: currentPumpStatusIdvAlarm.alarmId,
      alarmName,
      siteId,
      pumpNumber: pumpNum,
      monitoringHours: monHours,
      emails: newPumpStatusIdvForm.emails.join(','),
      phones: newPumpStatusIdvForm.phones.join(','),
      method: 'Email',
    };

    try {
      const result = await updatePumpStatusIdvAlarm(currentPumpStatusIdvAlarm.alarmId || 0, requestBody);
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
    const emails = alarm.emails ? alarm.emails.split(',').map((e: string) => e.trim()).filter((e: string) => e) : [];
    const phones = alarm.phones ? alarm.phones.split(',').map((p: string) => p.trim()).filter((p: string) => p) : [];
    
    setCurrentPumpStatusIdvAlarm({
      alarmId: alarm.id,
      alarmName: alarm.alarmName || '',
      siteId: alarm.siteId,
      site: alarm.siteName,
      pumpNumber: alarm.pumpNumber || 1,
      monitoringHours: alarm.monitoringHours || 24,
      emails: emails,
      phones: phones,
    });
    setNewPumpStatusIdvForm({
      alarmId: alarm.id,
      alarmName: alarm.alarmName || '',
      siteId: alarm.siteId,
      site: alarm.siteName,
      pumpNumber: alarm.pumpNumber || 1,
      monitoringHours: alarm.monitoringHours || 24,
      emails: emails,
      phones: phones,
    });
    setIsEditPumpStatusIdvOpen(true);
  };

  const handlePumpStatusIdvAlarmDelete = (alarmId: number) => {
    setPumpStatusIdvAlarmToDelete(alarmId);
    setIsDeletePumpStatusIdvOpen(true);
  };

  const confirmDeletePumpStatusIdvAlarm = async () => {
    if (!pumpStatusIdvAlarmToDelete) return;
    
    try {
      const result = await deletePumpStatusIdvAlarm(pumpStatusIdvAlarmToDelete);
      if (result.success) {
        toast.success(t('alarms.deleteAlarmSuccess'));
        setIsDeletePumpStatusIdvOpen(false);
        setPumpStatusIdvAlarmToDelete(null);
      } else {
        toast.error(result.message || t('errors.deleteFailed'));
      }
    } catch (error: any) {
      console.error('Error deleting pump status IDV alarm:', error);
      toast.error(error.message || t('errors.deleteFailed'));
    } finally {
      setIsDeletePumpStatusIdvOpen(false);
      setPumpStatusIdvAlarmToDelete(null);
    }
  };

  const handlePumpStatusPSAlarmEdit = (alarm: any) => {
    const emails = alarm.emails ? alarm.emails.split(',').map((e: string) => e.trim()).filter(Boolean) : [];
    const phones = alarm.phones ? alarm.phones.split(',').map((p: string) => p.trim()).filter(Boolean) : [];
    
    setCurrentPumpStatusPSAlarm({
      id: alarm.alarmId || 0,
      siteId: alarm.siteId,
      alarmName: alarm.alarmName || '',
      site: alarm.siteName,
      emails: emails,
      phones: phones,
      monitoringHours: alarm.monitoringHours || 0,
    });
    setNewPumpStatusPSForm({
      id: alarm.alarmId || 0,
      siteId: alarm.siteId,
      alarmName: alarm.alarmName || '',
      site: alarm.siteName,
      emails: emails,
      phones: phones,
      monitoringHours: alarm.monitoringHours || 0,
    });
    setIsEditPumpStatusPSOpen(true);
  };

  const handleSensorStatusAlarmEdit = (alarm: any) => {
    
    // Parse emails and phones from comma-separated strings
    const emails = alarm.emails ? alarm.emails.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const phones = alarm.phones ? alarm.phones.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    
    // Handle both alarmId and id field names
    const alarmId = alarm.alarmId || alarm.id || 0;
    
    setCurrentSensorStatusAlarm({
      alarmId: alarmId,
      alarmName: alarm.alarmName || '',
      method: 0,
      siteId: alarm.siteId,
      site: alarm.site || alarm.siteName,
      message: alarm.message || alarm.customMessage || '',
      threshold: alarm.threshold || alarm.thresholdValue || 0,
      field: alarm.field || alarm.fieldName || '',
      emails: emails,
      phones: phones,
    });
    setNewSensorStatusForm({
      alarmId: alarmId,
      alarmName: alarm.alarmName || '',
      method: 0,
      siteId: alarm.siteId,
      site: alarm.site || alarm.siteName,
      message: alarm.message || alarm.customMessage || '',
      threshold: alarm.threshold || alarm.thresholdValue || 0,
      field: alarm.field || alarm.fieldName || '',
      emails: emails,
      phones: phones,
    });
    setHasSensorStatusChanges(false);
    setIsEditSensorStatusOpen(true);
  };

  const handleSensorStatusAlarmDelete = (alarmId: number) => {
    setSensorStatusAlarmToDelete(alarmId);
    setIsDeleteSensorStatusOpen(true);
  };

  const confirmDeleteSensorStatusAlarm = async () => {
    if (!sensorStatusAlarmToDelete) return;
    
    try {
      const result = await deleteSensorStatusAlarm(sensorStatusAlarmToDelete);
      if (result.success) {
        toast.success(t('alarms.deleteAlarmSuccess'));
        setIsDeleteSensorStatusOpen(false);
        setSensorStatusAlarmToDelete(null);
      } else {
        toast.error(result.message || t('errors.deleteFailed'));
      }
    } catch (error: any) {
      console.error('Error deleting sensor status alarm:', error);
      toast.error(error.message || t('errors.deleteFailed'));
    } finally {
      setIsDeleteSensorStatusOpen(false);
      setSensorStatusAlarmToDelete(null);
    }
  };

  const handleThresholdAlarmDelete = (alarmId: number) => {
    setThresholdAlarmToDelete(alarmId);
    setIsDeleteThresholdOpen(true);
  };

  const confirmDeleteThresholdAlarm = async () => {
    if (!thresholdAlarmToDelete) return;
    
    try {
      const result = await deleteThresholdAlarm(thresholdAlarmToDelete);
      if (result.success) {
        toast.success(t('alarms.deleteAlarmSuccess'));
        setIsDeleteThresholdOpen(false);
        setThresholdAlarmToDelete(null);
      } else {
        toast.error(result.message || t('errors.deleteFailed'));
      }
    } catch (error: any) {
      console.error('Error deleting threshold alarm:', error);
      toast.error(error.message || t('errors.deleteFailed'));
    } finally {
      setIsDeleteThresholdOpen(false);
      setThresholdAlarmToDelete(null);
    }
  };

  const handleCommunicationAlarmDelete = (alarmId: number) => {
    setCommAlarmToDelete(alarmId);
    setIsDeleteCommOpen(true);
  };

  const confirmDeleteCommunicationAlarm = async () => {
    if (!commAlarmToDelete) return;
    
    try {
      const result = await deleteCommunicationAlarm(commAlarmToDelete);
      if (result.success) {
        toast.success(t('alarms.deleteAlarmSuccess'));
        setIsDeleteCommOpen(false);
        setCommAlarmToDelete(null);
      } else {
        toast.error(result.message || t('errors.deleteFailed'));
      }
    } catch (error: any) {
      console.error('Error deleting communication alarm:', error);
      toast.error(error.message || t('errors.deleteFailed'));
    } finally {
      setIsDeleteCommOpen(false);
      setCommAlarmToDelete(null);
    }
  };

  const handlePumpStatusPSAlarmDelete = (alarmId: number) => {
    setPumpStatusPSAlarmToDelete(alarmId);
    setIsDeletePumpStatusPSOpen(true);
  };

  const confirmDeletePumpStatusPSAlarm = async () => {
    if (!pumpStatusPSAlarmToDelete) return;
    
    try {
      const result = await deletePumpStatusPSAlarm(pumpStatusPSAlarmToDelete);
      if (result.success) {
        toast.success(t('alarms.deleteAlarmSuccess'));
        setIsDeletePumpStatusPSOpen(false);
        setPumpStatusPSAlarmToDelete(null);
      } else {
        toast.error(result.message || t('errors.deleteFailed'));
      }
    } catch (error: any) {
      console.error('Error deleting pump status PS alarm:', error);
      toast.error(error.message || t('errors.deleteFailed'));
    } finally {
      setIsDeletePumpStatusPSOpen(false);
      setPumpStatusPSAlarmToDelete(null);
    }
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

  useEffect(() => {
    if (pumpStatusPSSiteConfiguration) {
      if ((pumpStatusPSSiteConfiguration as any).numPumps < 1) {
        setPumpStatusPSSiteError('alarms.siteHasNoPumps');
      } else {
        setPumpStatusPSSiteError(null);
      }
    }
  }, [pumpStatusPSSiteConfiguration]);

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

  const handleSetPumpStatusPSSite = (siteName: string) => {
    setPumpStatusPSSite(siteName);
    setPumpStatusPSSiteError(null);
    const selectedSite = sites.find(site => site.name === siteName);
    if (selectedSite) {
      fetchPumpStatusPSSiteConfiguration(selectedSite.id);
    }
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

  useEffect(() => {
    if (!isEditSensorStatusOpen) {
      setIsSubmittingSensorStatusEdit(false);
      setHasSensorStatusChanges(false);
    }
  }, [isEditSensorStatusOpen]);

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

    const formData: ThresholdAlarmForm = {
      id: alarm.id,
      siteId: siteId || 0,
      alarmName: alarm.alarmName,
      site: alarm.site,
      field: mapNumberToField[parseInt(alarm.field)] || '',
      criticalOperator: alarm.criticalOperator !== undefined ? mapNumberToOperator[parseInt(alarm.criticalOperator)] || '' : mapNumberToOperator[parseInt(alarm.operator)] || '',
      criticalThresholdValue: alarm.criticalThresholdValue !== undefined ? alarm.criticalThresholdValue : alarm.threshold || 0,
      criticalColorCode: alarm.criticalColorCode || alarm.color || '#fbbf24',
      crisisOperator: alarm.crisisOperator !== undefined ? mapNumberToOperator[parseInt(alarm.crisisOperator)] || '' : '<',
      crisisThresholdValue: alarm.crisisThresholdValue !== undefined ? alarm.crisisThresholdValue : 0,
      crisisColorCode: alarm.crisisColorCode || '#db0202ff',
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

    const { siteId, alarmName, field, criticalOperator, criticalThresholdValue, criticalColorCode, crisisOperator, crisisThresholdValue, crisisColorCode } = newThresholdAlarmForm;

    if (!siteId || !alarmName || !field || !criticalOperator || !crisisOperator) {
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
        criticalOperator: mapOperatorToNumber(criticalOperator),
        criticalThresholdValue: criticalThresholdValue,
        criticalColorCode: criticalColorCode,
        crisisOperator: mapOperatorToNumber(crisisOperator),
        crisisThresholdValue: crisisThresholdValue,
        crisisColorCode: crisisColorCode,
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
    const mapNumberToField: { [key: number]: string } = {
      0: 'USWL',
      1: 'DSWL1',
      26: 'DSWL2',
      2: 'Battery',
      3: 'P1_Time',
      4: 'P1_Flow',
      5: 'P2_Time',
      6: 'P2_Flow',
      7: 'P3_Time',
      8: 'P3_Flow',
      9: 'P4_Time',
      10: 'P4_Flow',
      11: 'P5_Time',
      12: 'P5_Flow',
      13: 'P6_Time',
      14: 'P6_Flow',
      15: 'P7_Time',
      16: 'P7_Flow',
      17: 'P8_Time',
      18: 'P8_Flow',
      19: 'P9_Time',
      20: 'P9_Flow',
      21: 'P10_Time',
      22: 'P10_Flow',
      23: 'Calculated_flow',
      24: 'Total_uptime',
      25: 'Total_flow',
    };

    const mapNumberToOperator: { [key: number]: string } = {
      0: '<',
      1: '<=',
      2: '>',
      3: '>=',
      4: '==',
      5: '!=',
    };

    setCurrentThresholdAlarm({
      id: alarm.id,
      siteId: alarm.siteId,
      alarmName: alarm.alarmName,
      site: alarm.site,
      field: typeof alarm.field === 'number' ? (mapNumberToField[alarm.field] || '') : alarm.field,
      criticalOperator: typeof alarm.operator === 'number' ? (mapNumberToOperator[alarm.operator] || '') : alarm.operator,
      criticalThresholdValue: alarm.threshold || 0,
      criticalColorCode: alarm.color || '#fbbf24',
      crisisOperator: '<',
      crisisThresholdValue: 0,
      crisisColorCode: '#db0202ff',
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
                  {t('alarms.thresholdAlarms')} ({filteredThresholdAlarms.length})
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
                  alarms={filteredThresholdAlarms}
                  onEdit={handleThresholdAlarmEdit}
                  onDelete={handleThresholdAlarmDelete}
                  error={fetchError}
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
                  {t('alarms.communicationAlarms')} ({filteredCommunicationAlarms.length})
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
                  alarms={filteredCommunicationAlarms}
                  onEdit={handleCommunicationAlarmEdit}
                  onDelete={handleCommunicationAlarmDelete}
                  error={fetchError}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      
        {/* Sensor Status Tab - Temporarily Hidden */}
         <TabsContent value="sensorStatus" className="mt-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader />
            </div>
          ) : (
            <Card>
              <CardHeader className="flex justify-between items-center" dir={t('_rtl') === 'rtl' ? 'rtl' : 'ltr'}>
                <CardTitle className={t('_rtl') === 'rtl' ? 'text-right' : 'text-left'}>
                  {t('alarms.sensorStatus')} ({filteredSensorStatusAlarms.length})

                </CardTitle>

                {currentUser.role === 'Admin' && (
                  <Dialog open={isAddSensorStatusOpen} onOpenChange={handleSensorStatusDialogOpenChange}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setNewSensorStatusForm(INITIAL_SENSOR_STATUS_FORM)}>
                        <Plus className={t('_rtl') === 'rtl' ? 'mr-2 h-4 w-4' : 'ml-2 h-4 w-4'} />
                        {t('alarms.addSensorStatusAlarm')}
                      </Button>
                    </DialogTrigger>
                    <AddSensorStatusAlarmDialog
                      open={isAddSensorStatusOpen}
                      onOpenChange={handleSensorStatusDialogOpenChange}
                      form={newSensorStatusForm}
                      setForm={setNewSensorStatusForm}
                      onSubmit={handleSubmitSensorStatusAlarm}
                      isSubmitting={isSubmittingSensorStatusAdd}
                      alarmId={null}
                      setSiteId={setSensorStatusSiteId}
                      setSite={setSensorStatusSite}
                      setEmails={setSensorStatusEmails}
                      setPhones={setSensorStatusPhones}
                      submissionError={sensorStatusSubmissionError}
                      sites={sites}
                      sitesLoading={sitesLoading}
                      availableFields={sensorStatusAvailableFields}
                    />
                  </Dialog>
                )}
              </CardHeader>

              <CardContent>
                <SensorStatusTable
                  alarms={filteredSensorStatusAlarms}
                  onEdit={handleSensorStatusAlarmEdit}
                  onDelete={handleSensorStatusAlarmDelete}
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
                  {t('alarms.PumpStatusPSAlarms')} ({filteredPumpStatusPSAlarms.length})
                </CardTitle>

                {currentUser.role === 'Admin' && (
                  <Dialog open={isAddPumpStatusPSOpen} onOpenChange={handlePumpStatusPSDialogOpenChange}>
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
                      setSite={handleSetPumpStatusPSSite}
                      setSiteId={handleSetPumpStatusPSSiteId}
                      submissionError={pumpStatusPSSubmissionError}
                      onOpenChange={handlePumpStatusPSDialogOpenChange}
                      sites={pumpSites}
                      sitesLoading={pumpSitesLoading}
                      siteConfiguration={pumpStatusPSSiteConfiguration}
                      configLoading={pumpStatusPSConfigLoading}
                      siteError={pumpSitesError}/>
                  </Dialog>
                )}
              </CardHeader>

              <CardContent>
                <PumpStatusPSTable
                  alarms={filteredPumpStatusPSAlarms} 
                onDelete={handlePumpStatusPSAlarmDelete}
                onEdit={handlePumpStatusPSAlarmEdit}
                error={fetchError}
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
                  {t('alarms.PumpStatusIdvAlarms')} ({filteredPumpStatusIdvAlarms.length})
                </CardTitle>

                {currentUser.role === 'Admin' && (
                  <Dialog open={isAddPumpStatusIdvOpen} onOpenChange={handlePumpStatusIdvDialogOpenChange}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setNewPumpStatusIdvForm(INITIAL_PumpStatusIdv_FORM)}>
                        <Plus className={t('_rtl') === 'rtl' ? 'mr-2 h-4 w-4' : 'ml-2 h-4 w-4'} />
                        {t('alarms.addPumpStatusIdvAlarm')}
                      </Button>
                    </DialogTrigger>
                    <AddPumpStatusIdvAlarmDialog 
                    open={isAddPumpStatusIdvOpen}
                    onOpenChange={handlePumpStatusIdvDialogOpenChange}
                    form={newPumpStatusIdvForm}
                    setForm={setNewPumpStatusIdvForm}
                    onSubmit={handleSubmitPumpStatusIdvAlarm}
                    isSubmitting={isSubmittingPumpIdvAdd}
                    setEmails={setPumpStatusIdvEmails}
                    setPhones={setPumpStatusIdvPhones}
                    setSite={handleSetPumpStatusIdvSite}
                    setIdvPump={setPumpStatusIdvIdvPump}
                    submissionError={pumpStatusIdvSubmissionError}
                    sites={pumpSites}
                    sitesLoading={pumpSitesLoading}
                    siteConfiguration={pumpStatusIdvSiteConfiguration}
                    configLoading={pumpStatusIdvConfigLoading}
                    siteError={pumpSitesError}/>
                 
                  </Dialog>
          
                )}
              </CardHeader>

              <CardContent>
                <PumpStatusIdvTable 
                alarms={filteredPumpStatusIdvAlarms} 
                onEdit={handlePumpStatusIdvAlarmEdit}
                onDelete={handlePumpStatusIdvAlarmDelete}
                error={fetchError}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        </Tabs>

      {/* Edit Dialogs */}
      <EditThresholdAlarmDialog
        open={isEditThresholdOpen}
        onOpenChange={(open) => {
          setIsEditThresholdOpen(open);
          if (!open) {
            // Clear error message when dialog closes
            setThresholdSubmissionError(null);
          }
        }}
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
        currentUser={currentUser}
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

      <EditSensorStatusAlarmDialog
        open={isEditSensorStatusOpen}
        onOpenChange={setIsEditSensorStatusOpen}
        form={newSensorStatusForm}
        setForm={setNewSensorStatusForm}
        currentAlarm={currentSensorStatusAlarm}
        sites={sites}
        sitesLoading={sitesLoading}
        sitesError={sitesError}
        onSubmit={handleEditSensorStatusAlarm}
        isSubmitting={isSubmittingSensorStatusEdit}
        hasChanges={hasSensorStatusChanges}
        setHasChanges={setHasSensorStatusChanges}
        setEmails={setSensorStatusEmails}
        setPhones={setSensorStatusPhones}
        submissionError={sensorStatusSubmissionError}
        availableFields={sensorStatusAvailableFields}
      />

      <AlertDialog
        open={isDeleteSensorStatusOpen}
        onClose={() => {
          setIsDeleteSensorStatusOpen(false);
          setSensorStatusAlarmToDelete(null);
        }}
        onConfirm={confirmDeleteSensorStatusAlarm}
        title={t('alarms.deleteSensorStatusAlarm')}
        description={t('alarms.deleteAlarmConfirm')}
        type="error"
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />

      <AlertDialog
        open={isDeleteThresholdOpen}
        onClose={() => {
          setIsDeleteThresholdOpen(false);
          setThresholdAlarmToDelete(null);
        }}
        onConfirm={confirmDeleteThresholdAlarm}
        title={t('alarms.deleteThresholdAlarm')}
        description={t('alarms.deleteAlarmConfirm')}
        type="error"
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />

      <AlertDialog
        open={isDeleteCommOpen}
        onClose={() => {
          setIsDeleteCommOpen(false);
          setCommAlarmToDelete(null);
        }}
        onConfirm={confirmDeleteCommunicationAlarm}
        title={t('alarms.deleteCommunicationAlarm')}
        description={t('alarms.deleteAlarmConfirm')}
        type="error"
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />

      <AlertDialog
        open={isDeletePumpStatusPSOpen}
        onClose={() => {
          setIsDeletePumpStatusPSOpen(false);
          setPumpStatusPSAlarmToDelete(null);
        }}
        onConfirm={confirmDeletePumpStatusPSAlarm}
        title={t('alarms.deletePumpStatusPSAlarm')}
        description={t('alarms.deleteAlarmConfirm')}
        type="error"
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />

      <AlertDialog
        open={isDeletePumpStatusIdvOpen}
        onClose={() => {
          setIsDeletePumpStatusIdvOpen(false);
          setPumpStatusIdvAlarmToDelete(null);
        }}
        onConfirm={confirmDeletePumpStatusIdvAlarm}
        title={t('alarms.deletePumpStatusIdvAlarm')}
        description={t('alarms.deleteAlarmConfirm')}
        type="error"
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />

      <EditPumpStatusPSAlarmDialog
        open={isEditPumpStatusPSOpen}
        onOpenChange={setIsEditPumpStatusPSOpen}
        form={newPumpStatusPSForm}
        setForm={setNewPumpStatusPSForm}
        currentAlarm={currentPumpStatusPSAlarm}
        sites={pumpSites}
        sitesLoading={pumpSitesLoading}
        sitesError={pumpSitesError}
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
        sites={pumpSites}
        sitesLoading={pumpSitesLoading}
        sitesError={pumpSitesError}
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
        onFetchSiteConfig={fetchPumpStatusIdvSiteConfiguration}
      />
    </div>
  );
}
