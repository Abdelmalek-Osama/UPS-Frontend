import { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import apiService from '../../../../shared/utils/apiService';
import { Site } from '../../types';
import { useTranslation } from 'react-i18next';
import { useSiteCreation } from '../../hooks/useSiteCreation';
import { useDirectorates } from '../../hooks/useDirectorates';
import Stage1 from "./Stage1";
import Stage2 from "./Stage2";
import Stage3 from "./Stage3";
import Stage4 from "./Stage4";
import { toast } from 'react-toastify';

interface SitesDialogProps {
  mode: "create" | "edit";
  siteData?: Partial<Site>;
  onSave: (data: Partial<Site>) => void;
  onCancel: () => void;
  isOpen: boolean;
  onSiteCreated?: (site: Site) => void;
}

export default function SitesDialog({ mode, siteData, onSave, onCancel, isOpen, onSiteCreated }: SitesDialogProps) {
  const { t } = useTranslation();
  const dir = t('_rtl') === 'rtl' ? 'rtl' : 'ltr';
  const { createSite, isLoading: isCreating } = useSiteCreation();
  const { directorates } = useDirectorates();

  const [formData, setFormData] = useState<Partial<Site>>(siteData || {});
  const [currentTab, setCurrentTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState<boolean[]>([false, false, false, false]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isStage1Valid, setIsStage1Valid] = useState(false);

  
  useEffect(() => {
    if (isOpen && siteData) {
      
      const mappedData = {
        ...siteData,
        simId: (siteData as any).simCardIP || siteData.simId
      };
      setFormData(mappedData);
      // For edit mode, mark all tabs as completed since we have existing data
      if (mode === 'edit') {
        setCompletedTabs([true, true, true, true]);
      } else {
        setCompletedTabs([false, false, false, false]);
      }
      setCurrentTab(0);
    }
  }, [isOpen, siteData, mode]);

  const tabs = [
    { id: "stage1", name: t('sites.stage1.title'), icon: "1" },
    { id: "stage2", name: t('sites.stage2.title'), icon: "2" },
    { id: "stage3", name: t('sites.stage3.title'), icon: "3" },
    { id: "stage4", name: t('sites.stage4.title'), icon: "4" },
  ];

  
  const dialogContentStyle: React.CSSProperties = {
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    overflow: 'hidden'
  };

  const headerContainerStyle: React.CSSProperties = {
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
    paddingTop: '1.5rem',
    paddingBottom: '1rem',
    flexShrink: 0,
    borderBottom: '1px solid hsl(var(--border))'
  };

  const contentMainStyle: React.CSSProperties = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  };

  const sidebarStyle: React.CSSProperties = {
    width: '16rem',
    backgroundColor: 'hsl(var(--muted))',
    borderRight: '1px solid hsl(var(--border))',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '1rem',
    paddingBottom: '1rem',
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: 0,
    WebkitOverflowScrolling: 'touch'
  };

  const navStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  };

  const formContentContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const scrollContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
    paddingTop: '1rem',
    paddingBottom: '1rem',
    minHeight: 0,
    WebkitOverflowScrolling: 'touch'
  };

  const footerContainerStyle: React.CSSProperties = {
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
    paddingTop: '1rem',
    paddingBottom: '1.5rem',
    flexShrink: 0,
    borderTop: '1px solid hsl(var(--border))'
  };

  const footerButtonsContainerStyle: React.CSSProperties = {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const footerLeftStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: dir === 'rtl' ? 'flex-end' : 'flex-start',
    gap: '0.5rem',
    minHeight: '2.5rem',
    flexDirection: dir === 'rtl' ? 'row-reverse' : 'row'
  };

  const footerCenterStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center'
  };

  const footerRightStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: dir === 'rtl' ? 'flex-start' : 'flex-end',
    gap: '0.5rem',
    flexDirection: dir === 'rtl' ? 'row-reverse' : 'row'
  };

  const stepIndicatorStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: 'hsl(var(--muted-foreground))',
    whiteSpace: 'nowrap'
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.5rem'
  };

  const backButtonStyle: React.CSSProperties = {
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    color: '#1f2937',
    cursor: 'pointer',
    transition: 'all 150ms',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500
  };

  const backButtonHoverStyle: React.CSSProperties = {
    ...backButtonStyle,
    backgroundColor: 'hsl(var(--accent))',
    color: 'hsl(var(--accent-foreground))'
  };

  const backButtonDisabledStyle: React.CSSProperties = {
    ...backButtonStyle,
    color: 'hsl(var(--muted-foreground))',
    cursor: 'not-allowed',
    opacity: 0
  };

  const isStepValid = (step: number): boolean => {
    if (step === 0) {
      return isStage1Valid;
    }
    return true;
  };

  const handleStage1ValidChange = (isValid: boolean) => {
    setIsStage1Valid(isValid);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTabClick = (index: number) => {
    const isUnlocked = index === 0 || completedTabs[index - 1];
    if (isUnlocked) {
      setCurrentTab(index);
    }
  };

  const saveStep = async (stepIndex: number): Promise<boolean> => {
    if (!formData.id) return false;
    setIsUpdating(true);
    try {
      let endpoint = '';
      let payload = {};

      switch (stepIndex) {
        case 0: // Step 1: Info
          endpoint = `/v1/Sites/${formData.id}/info`;
          payload = {
            code: formData.code,
            name: formData.name,
            arabicName: formData.arabicName,
            siteType: formData.siteType,
            canal: formData.canal,
            longitude: formData.longitude,
            latitude: formData.latitude,
            directorateId: formData.directorateId,
            simCardIP: formData.simId, 
            dataLoggerType: formData.dataLoggerType
          };
          break;
        case 1: // Step 2: Config
          endpoint = `/v1/Sites/${formData.id}/config`;
          payload = {
            hasUS: formData.hasUS,
            hasDS1: formData.hasDS1,
            hasDS2: formData.hasDS2,
            numPumps: formData.numPumps
          };
          break;
        case 2: // Step 3: Mappings
          endpoint = `/v1/Sites/${formData.id}/mappings`;
          payload = formData.dataMappings || [];
          break;
        case 3: // Step 4: Flow Calculation
          endpoint = `/v1/Sites/${formData.id}/flow-calculation`;
          payload = {
            formulaConstants: formData.flowCalculation?.formulaConstants,
            equationId: formData.flowCalculation?.equationId
          };
          break;
      }

      await apiService.put(endpoint, payload);
      toast.success(t('notifications.saved'));
      return true;
    } catch (error) {
      console.error(`Error saving step ${stepIndex}:`, error);
      toast.error(t('errors.saveFailed'));
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNext = async () => {
    if (isStepValid(currentTab)) {
      if (mode === 'edit') {
        const success = await saveStep(currentTab);
        if (!success) return;
      }

      const newCompleted = [...completedTabs];
      newCompleted[currentTab] = true;
      setCompletedTabs(newCompleted);
      if (currentTab < tabs.length - 1) {
        setCurrentTab(currentTab + 1);
      }
    }
  };

  const handleSubmit = async () => {
    if (isStepValid(currentTab)) {
      // Handle create mode - call API
      if (mode === 'create') {
        handleCreateSite();
      } else {
        // Handle edit mode - save final step then close
        const success = await saveStep(currentTab);
        if (success) {
          onSave(formData);
          onCancel();
          // Reset
          setCurrentTab(0);
          setCompletedTabs([false, false, false, false]);
        }
      }
    }
  };

  const handleCreateSite = async () => {
    try {
      const result = await createSite(formData);
      if (result.success && result.data) {
        onSave(formData);
        // Call the callback to add the new site to the list immediately
        if (onSiteCreated) {
          // Get directorate info from the directorates array
          const directorate = directorates.find(d => d.id === formData.directorateId);
          const directorateName = directorate?.name || '';
          const directorateArabicName = directorate?.arabicName || '';
          
          // Transform the API response to match the Site interface
          const newSite: Site = {
            id: result.data.id || 0,
            name: formData.name || '',
            arabicName: formData.arabicName || '',
            siteType: formData.siteType as 'WaterLevel' | 'Pumps' || 'WaterLevel',
            directorateName: directorateName,
            directorateArabicName: directorateArabicName,
            directorateId: formData.directorateId,
            latitude: formData.latitude || 0,
            longitude: formData.longitude || 0,
            status: 'offline' as const,
            code: formData.code || '',
            canal: formData.canal || '',
            location: formData.location || '',
            dataLoggerType: formData.dataLoggerType,
            simId: formData.simId || '',
            simCardIP: formData.simId || '',
            hasUS: formData.hasUS || false,
            hasDS1: formData.hasDS1 || false,
            hasDS2: formData.hasDS2 || false,
            numPumps: formData.numPumps || 0,
            dataMappings: formData.dataMappings || [],
            flowCalculation: formData.flowCalculation,
            ...result.data,
          };
          onSiteCreated(newSite);
        }
        onCancel();
        // Reset
        setCurrentTab(0);
        setCompletedTabs([false, false, false, false]);
      }
    } catch (error) {
      console.error('Error creating site:', error);
      toast.error(t('sites.createError'));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl"
        style={{
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        dir={dir}
      >
        {/* Header */}
        <div style={headerContainerStyle}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <h2 className="text-xl font-semibold text-gray-900">
              {t(mode === 'create' ? 'sites.addNewSite' : 'sites.editSite')}
            </h2>
            <button
              onClick={onCancel}
              style={{
                color: 'hsl(var(--muted-foreground))',
                cursor: 'pointer',
                transition: 'color 150ms',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
              className="hover:text-gray-900"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={contentMainStyle}>
          {/* Side Tabs */}
          <div style={sidebarStyle}>
            <nav style={navStyle}>
              {tabs.map((tab, index) => {
                const isCompleted = completedTabs[index];
                const isCurrent = currentTab === index;
                const isUnlocked = index === 0 || completedTabs[index - 1];

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(index)}
                    disabled={!isUnlocked}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      paddingLeft: '1rem',
                      paddingRight: '1rem',
                      paddingTop: '0.75rem',
                      paddingBottom: '0.75rem',
                      borderRadius: '0.5rem',
                      textAlign: 'left',
                      transition: 'all 150ms',
                      cursor: isUnlocked ? 'pointer' : 'not-allowed',
                      backgroundColor: isCurrent
                        ? 'hsl(217, 91%, 60%)'
                        : isCompleted
                          ? 'hsl(142, 72%, 90%)'
                          : isUnlocked
                            ? 'hsl(var(--background))'
                            : 'hsl(var(--muted))',
                      color: isCurrent
                        ? 'white'
                        : isCompleted
                          ? 'hsl(140, 60%, 30%)'
                          : isUnlocked
                            ? 'hsl(var(--foreground))'
                            : 'hsl(var(--muted-foreground))',
                      border: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }}
                  >
                    <div
                      style={{
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        backgroundColor: isCurrent
                          ? 'hsl(217, 91%, 70%)'
                          : isCompleted
                            ? 'hsl(142, 76%, 36%)'
                            : isUnlocked
                              ? 'hsl(var(--muted))'
                              : 'hsl(var(--muted))',
                        color: isCurrent || isCompleted
                          ? 'white'
                          : isUnlocked
                            ? 'hsl(var(--muted-foreground))'
                            : 'hsl(var(--muted-foreground))',
                        flexShrink: 0
                      }}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : tab.icon}
                    </div>
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Form Content */}
          <div style={formContentContainerStyle}>
            <div style={scrollContainerStyle}>
              {currentTab === 0 && (
                <Stage1
                  data={formData}
                  onChange={handleFieldChange}
                  isOpen={isOpen}
                  onClose={onCancel}
                  onValidationChange={handleStage1ValidChange}
                />
              )}
              {currentTab === 1 && (
                <Stage2
                  data={formData}
                  onChange={handleFieldChange}
                  isOpen={isOpen}
                  onClose={onCancel}
                />
              )}
              {currentTab === 2 && (
                <Stage3
                  data={formData}
                  onChange={handleFieldChange}
                  isOpen={isOpen}
                  onClose={onCancel}
                />
              )}
              {currentTab === 3 && (
                <Stage4
                  data={formData}
                  onChange={handleFieldChange}
                  isOpen={isOpen}
                  onClose={onCancel}
                  mode={mode}
                />
              )}
            </div>

            {/* Footer */}
            <div style={footerContainerStyle}>
              <div style={footerButtonsContainerStyle}>
                {/* Left: Back Button */}
                <div style={footerLeftStyle}>
                  {currentTab > 0 && (
                    <button
                      onClick={() => setCurrentTab(Math.max(0, currentTab - 1))}
                      style={backButtonStyle}
                      onMouseEnter={(e) => {
                        const btn = e.target as HTMLButtonElement;
                        btn.style.backgroundColor = '#eef2f5';
                        btn.style.borderColor = '#d1d5db';
                      }}
                      onMouseLeave={(e) => {
                        const btn = e.target as HTMLButtonElement;
                        btn.style.backgroundColor = '#ffffff';
                        btn.style.borderColor = '#e5e7eb';
                      }}
                    >
                      {t('common.back')}
                    </button>
                  )}
                </div>

                {/* Center: Step Indicator */}
                <div style={footerCenterStyle}>
                  <span style={stepIndicatorStyle}>
                    {t('common.step')} {currentTab + 1} {t('common.of')} {tabs.length}
                  </span>
                </div>

                {/* Right: Next/Save Buttons */}
                <div style={footerRightStyle}>
                  {currentTab < tabs.length - 1 ? (
                    <button
                      onClick={handleNext}
                      disabled={!isStepValid(currentTab) || isUpdating}
                      style={{
                        paddingLeft: '1.5rem',
                        paddingRight: '1.5rem',
                        paddingTop: '0.5rem',
                        paddingBottom: '0.5rem',
                        backgroundColor: isStepValid(currentTab)
                          ? 'hsl(217, 91%, 60%)'
                          : 'hsl(217, 91%, 75%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: isStepValid(currentTab) ? 'pointer' : 'not-allowed',
                        transition: 'background-color 150ms',
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}
                      onMouseEnter={(e) => {
                        if (isStepValid(currentTab)) {
                          (e.target as HTMLButtonElement).style.backgroundColor = 'hsl(217, 91%, 50%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isStepValid(currentTab)) {
                          (e.target as HTMLButtonElement).style.backgroundColor = 'hsl(217, 91%, 60%)';
                        }
                      }}
                    >
                      {isUpdating ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('common.saving')}
                        </div>
                      ) : (
                        t('common.next')
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!isStepValid(currentTab) || isCreating || isUpdating}
                      style={{
                        paddingLeft: '1.5rem',
                        paddingRight: '1.5rem',
                        paddingTop: '0.5rem',
                        paddingBottom: '0.5rem',
                        backgroundColor: (isStepValid(currentTab) && !isCreating)
                          ? 'hsl(142, 72%, 45%)'
                          : 'hsl(142, 72%, 75%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: (isStepValid(currentTab) && !isCreating && !isUpdating) ? 'pointer' : 'not-allowed',
                        transition: 'background-color 150ms',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        opacity: isCreating ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (isStepValid(currentTab) && !isCreating) {
                          (e.target as HTMLButtonElement).style.backgroundColor = 'hsl(142, 72%, 40%)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isStepValid(currentTab) && !isCreating) {
                          (e.target as HTMLButtonElement).style.backgroundColor = 'hsl(142, 72%, 45%)';
                        }
                      }}
                    >
                      {isCreating || isUpdating ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('common.saving') || 'Saving...'}
                        </div>
                      ) : t('common.save')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

