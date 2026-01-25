import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import apiService from '../../../shared/utils/apiService';
import type { Site, DataMapping, FlowCalculation } from '../types';
import { getDirectorateIdByName } from '../utils/directorateMapping';

// Map siteType string to numeric string value for API
const mapSiteTypeToNumericString = (siteType: string): string => {
  if (!siteType || typeof siteType !== 'string' || siteType.trim() === '') {
    throw new Error('Site type is required');
  }
  
  // Trim whitespace and convert to string
  const cleanSiteType = String(siteType).trim();
  
  switch (cleanSiteType) {
    case 'WaterLevel':
      return '0';
    case 'Pumps':
      return '1';
    default:
      throw new Error(`Invalid site type: ${cleanSiteType}`);
  }
};

interface SiteInfoPayload {
  code: string;
  name: string;
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
        console.log('Raw siteType value:', siteData.siteType, 'Trimmed:', siteTypeValue);
        
        if (!siteTypeValue) {
          setError('Site type is required');
          toast.error(t('errors.siteTypeRequired'));
          return {
            success: false,
            messageKey: 'errors.siteTypeRequired',
          };
        }

        // Build dataMappings with required optional fields
        const dataMappingsWithDefaults = (siteData.dataMappings || []).map(mapping => ({
          ...mapping,
          headerRowsToSkip: mapping.headerRowsToSkip ?? 0,
          priority: mapping.priority ?? 0,
          isActive: mapping.isActive ?? true,
        }));

        const mappedSiteType = mapSiteTypeToNumericString(siteTypeValue);
        console.log('Mapped siteType:', mappedSiteType);
        
        const payload: CreateSitePayload = {
          info: {
            code: siteData.code || '',
            name: siteData.name || '',
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

        const requestBody = {
          createSiteDto: payload,
        };

        console.log('Sending site creation payload:', JSON.stringify(requestBody, null, 2));
        const response = await apiService.post<any>('/v1/Sites', requestBody);
        
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
