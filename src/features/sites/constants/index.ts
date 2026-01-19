import { DataLoggerType } from '../types';

/**
 * Canal options for dropdown
 * These are the available canal types
 */
export const CANAL_OPTIONS: Record<string, string> = {
  LORA: 'lora',
  GSM: 'gsm',
  GPRS: 'gprs',
  WIFI: 'wifi',
};

/**
 * Directorate options for dropdown
 * These should ideally come from the API, but here are default options
 */
export const DIRECTORATE_OPTIONS: Record<string, string> = {
  DIRECTORATE_1: 'directorate1',
  DIRECTORATE_2: 'directorate2',
  DIRECTORATE_3: 'directorate3',
};

/**
 * Data Logger Type options for dropdown
 * Maps to the DataLoggerType enum
 */
export const DATA_LOGGER_TYPE_OPTIONS: Record<DataLoggerType, string> = {
  [DataLoggerType.LORA]: 'lora',
  [DataLoggerType.GSM]: 'gsm',
  [DataLoggerType.GPRS]: 'gprs',
  [DataLoggerType.WIFI]: 'wifi',
};

/**
 * Get canal options for dropdown
 * Returns an array of { value, label } for use in Select components
 */
export function getCanalOptions() {
  return Object.entries(CANAL_OPTIONS).map(([key, value]) => ({
    value: value,
    label: `sites.stage1.canalOptions.${value}`,
  }));
}

/**
 * Get directorate options for dropdown
 * Returns an array of { value, label } for use in Select components
 */
export function getDirectorateOptions() {
  return Object.entries(DIRECTORATE_OPTIONS).map(([key, value]) => ({
    value: value,
    label: `sites.stage1.directorateOptions.${value}`,
  }));
}

/**
 * Get data logger type options for dropdown
 * Returns an array of { value, label } for use in Select components
 */
export function getDataLoggerTypeOptions() {
  return Object.entries(DATA_LOGGER_TYPE_OPTIONS).map(([key, value]) => ({
    value: key,
    label: `sites.stage1.dataLoggerTypeOptions.${value}`,
  }));
}
