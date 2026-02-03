import { useState, useEffect } from 'react';
import apiService, { ApiResponse } from '../../../shared/utils/apiService';
import { SiteDetails } from '../types';

export const useSensorStatusAlarmFields = (siteId: number | null) => {
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [isFetchingSiteDetails, setIsFetchingSiteDetails] = useState(false);

  useEffect(() => {
    const fetchSiteDetails = async () => {
      if (!siteId) {
        setAvailableFields([]);
        return;
      }

      setIsFetchingSiteDetails(true);
      try {
        const response = await apiService.get<ApiResponse<SiteDetails>>(`/v1/Sites/${siteId}`);
        if (response.isSuccess && response.data) {
          const site = response.data;
          const newFields: string[] = [];

          // Only add sensor-related fields based on site configuration
          if (site.hasUS) newFields.push('USWL');
          if (site.hasDS1) newFields.push('DSWL1');
          if (site.hasDS2) newFields.push('DSWL2');

          setAvailableFields(newFields);
        }
      } catch (error) {
        console.error("Error fetching site details", error);
        setAvailableFields([]);
      } finally {
        setIsFetchingSiteDetails(false);
      }
    };

    fetchSiteDetails();
  }, [siteId]);

  return { availableFields, isFetchingSiteDetails };
};
