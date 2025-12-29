import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Plus, AlertTriangle, WifiOff } from 'lucide-react';
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
  AlarmMethod,
  Severity,
  ThresholdAlarmForm,
  CommunicationAlarmForm,
} from '../types/index';

// Utils
import { INITIAL_THRESHOLD_FORM, INITIAL_COMMUNICATION_FORM, OPERATORS } from '../utils/alarmConstants';
import { mapFieldToNumber, mapOperatorToNumber, mapSeverityToNumber, mapNumberToField, mapNumberToOperator } from '../utils/alarmMappers';

// Components
import { ThresholdAlarmTable } from './tables/ThresholdAlarmTable';
import { CommunicationAlarmTable } from './tables/CommunicationAlarmTable';
import { AddThresholdAlarmDialog } from './dialogs/AddThresholdAlarmDialog';
import { EditThresholdAlarmDialog } from './dialogs/EditThresholdAlarmDialog';
import { AddCommunicationAlarmDialog } from './dialogs/AddCommunicationAlarmDialog';
import { EditCommunicationAlarmDialog } from './dialogs/EditCommunicationAlarmDialog';

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
    isAddCommOpen,
    setIsAddCommOpen,
    createThresholdAlarm,
    createCommunicationAlarm,
    updateThresholdAlarm,
    updateCommunicationAlarm,
    isLoading,
  } = useAlarmsData();

  const { sites, sitesLoading, sitesError } = useSitesLookup();

  const [activeTab, setActiveTab] = useState('threshold');
  const [isAddThresholdOpen, setIsAddThresholdOpen] = useState(false);
  const [isEditThresholdOpen, setIsEditThresholdOpen] = useState(false);
  const [currentThresholdAlarm, setCurrentThresholdAlarm] = useState<ThresholdAlarmForm | null>(null);
  const [newThresholdAlarmForm, setNewThresholdAlarmForm] = useState<ThresholdAlarmForm>(INITIAL_THRESHOLD_FORM);
  const [newCommunicationAlarmForm, setNewCommunicationAlarmForm] = useState<CommunicationAlarmForm>(INITIAL_COMMUNICATION_FORM);
  const [isEditCommOpen, setIsEditCommOpen] = useState(false);
  const [currentCommunicationAlarm, setCurrentCommunicationAlarm] = useState<CommunicationAlarmForm | null>(null);
  const [isSubmittingThresholdAdd, setIsSubmittingThresholdAdd] = useState(false);
  const [isSubmittingThresholdEdit, setIsSubmittingThresholdEdit] = useState(false);
  const [isSubmittingCommAdd, setIsSubmittingCommAdd] = useState(false);
  const [isSubmittingCommEdit, setIsSubmittingCommEdit] = useState(false);
  const [hasThresholdChanges, setHasThresholdChanges] = useState(false);
  const [hasCommunicationChanges, setHasCommunicationChanges] = useState(false);
  const [thresholdSubmissionError, setThresholdSubmissionError] = useState<string | null>(null);
  const [communicationSubmissionError, setCommunicationSubmissionError] = useState<string | null>(null);

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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="threshold">
            <AlertTriangle className="ml-2 h-4 w-4" />
            {t('alarms.thresholdAlarms')}
          </TabsTrigger>
          <TabsTrigger value="communication">
            <WifiOff className="ml-2 h-4 w-4" />
            {t('alarms.communicationAlarms')}
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
              <CardHeader className="flex justify-between items-center" dir="rtl">
                <CardTitle className="text-right">
                  {t('alarms.thresholdAlarms')} ({thresholdAlarms.length})
                </CardTitle>

                {currentUser.role === 'Admin' && (
                  <Dialog open={isAddThresholdOpen} onOpenChange={setIsAddThresholdOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setNewThresholdAlarmForm(INITIAL_THRESHOLD_FORM)}>
                        <Plus className="ml-2 h-4 w-4" />
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
              <CardHeader className="flex justify-between items-center" dir="rtl">
                <CardTitle className="text-right">
                  {t('alarms.communicationAlarms')} ({communicationAlarms.length})
                </CardTitle>

                {currentUser.role === 'Admin' && (
                  <Dialog open={isAddCommOpen} onOpenChange={setIsAddCommOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setNewCommunicationAlarmForm(INITIAL_COMMUNICATION_FORM)}>
                        <Plus className="ml-2 h-4 w-4" />
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
    </div>
  );
}
