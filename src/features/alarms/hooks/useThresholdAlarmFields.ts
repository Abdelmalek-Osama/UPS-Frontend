import { useState, useEffect } from 'react';
import apiService, { ApiResponse } from '../../../shared/utils/apiService';
import { SiteDetails } from '../types';
import { FIELDS } from '../utils/alarmConstants';

export const useThresholdAlarmFields = (siteId: number | null) => {
  const [availableFields, setAvailableFields] = useState<string[]>(FIELDS);
  const [isFetchingSiteDetails, setIsFetchingSiteDetails] = useState(false);

  useEffect(() => {
    const fetchSiteDetails = async () => {
      if (!siteId) {
        setAvailableFields(FIELDS);
        return;
      }

      setIsFetchingSiteDetails(true);
      try {
        const response = await apiService.get<ApiResponse<SiteDetails>>(`/v1/Sites/${siteId}`);
        if (response.isSuccess && response.data) {
          const site = response.data;
          const newFields = ['Calculated_flow', 'Total_uptime', 'Total_flow', 'Battery'];

          if (site.hasUS) newFields.push('USWL');
          if (site.hasDS1) newFields.push('DSWL1');
          if (site.hasDS2) newFields.push('DSWL2');

          for (let i = 1; i <= site.numPumps; i++) {
            newFields.push(`P${i}_Time`);
            newFields.push(`P${i}_Flow`);
          }

          setAvailableFields(newFields);
        }
      } catch (error) {
        console.error("Error fetching site details", error);
        setAvailableFields(FIELDS);
      } finally {
        setIsFetchingSiteDetails(false);
      }
    };

    fetchSiteDetails();
  }, [siteId]);

  return { availableFields, isFetchingSiteDetails };
};
