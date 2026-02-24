import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import apiService from '../../../shared/utils/apiService';
import type { Site, DataMapping, FlowCalculation } from '../types';
import { getDirectorateIdByName } from '../utils/directorateMapping';

// Validate siteType string value
const validateSiteType = (siteType: string): string => {
  if (!siteType || typeof siteType !== 'string' || siteType.trim() === '') {
    throw new Error('Site type is required');
  }
  
  // Trim whitespace
  const cleanSiteType = String(siteType).trim();
  
  if (cleanSiteType !== 'WaterLevel' && cleanSiteType !== 'Pumps') {
    throw new Error(`Invalid site type: ${cleanSiteType}`);
  }
  
  return cleanSiteType;
};

interface SiteInfoPayload {
  code: string;
  name: string;
  arabicName: string;
  siteType: string;
  canal: string;
  longitude: number;
  latitude: number;
  directorateId: number;
  simCardIP: string;
  dataLoggerType: string;
}

interface SiteConfigPayload {
  hasUS: boolean;
  hasDS1: boolean;
  hasDS2: boolean;
  numPumps: number;
}

interface CreateSitePayload {
  info: SiteInfoPayload;
  config: SiteConfigPayload;
  dataMappings: DataMapping[];
  flowCalculation: FlowCalculation;
}

interface UseCreateSiteResult {
  createSite: (siteData: Partial<Site>) => Promise<{ success: boolean; data?: any; messageKey: string }>;
  isLoading: boolean;
  error: string | null;
}

export function useSiteCreation(): UseCreateSiteResult {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSite = useCallback(
    async (siteData: Partial<Site>) => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate required fields
        const siteTypeValue = siteData.siteType ? String(siteData.siteType).trim() : '';
        
        if (!siteTypeValue) {
          setError('Site type is required');
          toast.error(t('errors.siteTypeRequired'));
          return {
            success: false,
            messageKey: 'errors.siteTypeRequired',
          };
        }

        // Build dataMappings with required modifications
        const dataMappingsWithDefaults = (siteData.dataMappings || []).map(mapping => {
          return {
            ...mapping,
            headerRowsToSkip: 4, // Always set to 4
            priority: mapping.priority ?? 0,
            isActive: mapping.isActive ?? true,
          };
        });

        const mappedSiteType = validateSiteType(siteTypeValue);
        
        const payload: CreateSitePayload = {
          info: {
            code: siteData.code || '',
            name: siteData.name || '',
            arabicName: siteData.arabicName || '',
            siteType: mappedSiteType,
            canal: siteData.canal || '',
            longitude: siteData.longitude || 0,
            latitude: siteData.latitude || 0,
            directorateId: siteData.directorateId 
              ? siteData.directorateId 
              : getDirectorateIdByName(siteData.directorateName || ''),
            simCardIP: siteData.simId || '',
            dataLoggerType: siteData.dataLoggerType || '',
          },
          config: {
            hasUS: siteData.hasUS ?? false,
            hasDS1: siteData.hasDS1 ?? false,
            hasDS2: siteData.hasDS2 ?? false,
            numPumps: siteData.numPumps || 0,
          },
          dataMappings: dataMappingsWithDefaults,
          flowCalculation: siteData.flowCalculation || {
            equationId: 0,
            formulaConstants: '',
          },
        };

        const response = await apiService.post<any>('/v1/Sites', payload);
        
        if (response) {
          toast.success(t('sites.stage3.createSuccess'));
          return {
            success: true,
            data: response,
            messageKey: 'sites.stage3.createSuccess',
          };
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to create site';
        setError(errorMessage);
        toast.error(t('sites.stage3.createError'));
        return {
          success: false,
          messageKey: 'sites.stage3.createError',
        };
      } finally {
        setIsLoading(false);
      }

      return {
        success: false,
        messageKey: 'sites.stage3.createError',
      };
    },
    []
  );

  return { createSite, isLoading, error };
}
