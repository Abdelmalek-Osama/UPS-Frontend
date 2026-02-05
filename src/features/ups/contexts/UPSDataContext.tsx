import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { 
  Site, 
  SiteData, 
  GovernorateData, 
  MasterData, 
  TimeRange, 
  SystemKPIs 
} from '../types';

/**
 * UPS Data Context for managing dashboard data state
 */
interface UPSDataState {
  sites: Site[];
  currentSiteData: SiteData | null;
  governorateData: GovernorateData | null;
  masterData: MasterData | null;
  kpis: SystemKPIs | null;
  timeRange: TimeRange;
  isLoading: boolean;
  error: string | null;
}

type UPSDataAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SITES'; payload: Site[] }
  | { type: 'SET_SITE_DATA'; payload: SiteData }
  | { type: 'SET_GOVERNORATE_DATA'; payload: GovernorateData }
  | { type: 'SET_MASTER_DATA'; payload: MasterData }
  | { type: 'SET_KPIS'; payload: SystemKPIs }
  | { type: 'SET_TIME_RANGE'; payload: TimeRange }
  | { type: 'CLEAR_DATA' };

const initialState: UPSDataState = {
  sites: [],
  currentSiteData: null,
  governorateData: null,
  masterData: null,
  kpis: null,
  timeRange: { type: 'latest' },
  isLoading: false,
  error: null,
};

function upsDataReducer(state: UPSDataState, action: UPSDataAction): UPSDataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_SITES':
      return { ...state, sites: action.payload, error: null };
    case 'SET_SITE_DATA':
      return { ...state, currentSiteData: action.payload, error: null };
    case 'SET_GOVERNORATE_DATA':
      return { ...state, governorateData: action.payload, error: null };
    case 'SET_MASTER_DATA':
      return { ...state, masterData: action.payload, error: null };
    case 'SET_KPIS':
      return { ...state, kpis: action.payload, error: null };
    case 'SET_TIME_RANGE':
      return { ...state, timeRange: action.payload };
    case 'CLEAR_DATA':
      return { ...initialState, timeRange: state.timeRange };
    default:
      return state;
  }
}

interface UPSDataContextType {
  state: UPSDataState;
  dispatch: React.Dispatch<UPSDataAction>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSites: (sites: Site[]) => void;
  setSiteData: (data: SiteData) => void;
  setGovernorateData: (data: GovernorateData) => void;
  setMasterData: (data: MasterData) => void;
  setKPIs: (kpis: SystemKPIs) => void;
  setTimeRange: (range: TimeRange) => void;
  clearData: () => void;
}

const UPSDataContext = createContext<UPSDataContextType | undefined>(undefined);

interface UPSDataProviderProps {
  children: ReactNode;
}

export const UPSDataProvider: React.FC<UPSDataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(upsDataReducer, initialState);

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setSites = (sites: Site[]) => {
    dispatch({ type: 'SET_SITES', payload: sites });
  };

  const setSiteData = (data: SiteData) => {
    dispatch({ type: 'SET_SITE_DATA', payload: data });
  };

  const setGovernorateData = (data: GovernorateData) => {
    dispatch({ type: 'SET_GOVERNORATE_DATA', payload: data });
  };

  const setMasterData = (data: MasterData) => {
    dispatch({ type: 'SET_MASTER_DATA', payload: data });
  };

  const setKPIs = (kpis: SystemKPIs) => {
    dispatch({ type: 'SET_KPIS', payload: kpis });
  };

  const setTimeRange = (range: TimeRange) => {
    dispatch({ type: 'SET_TIME_RANGE', payload: range });
  };

  const clearData = () => {
    dispatch({ type: 'CLEAR_DATA' });
  };

  const value: UPSDataContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    setSites,
    setSiteData,
    setGovernorateData,
    setMasterData,
    setKPIs,
    setTimeRange,
    clearData,
  };

  return (
    <UPSDataContext.Provider value={value}>
      {children}
    </UPSDataContext.Provider>
  );
};

export const useUPSData = (): UPSDataContextType => {
  const context = useContext(UPSDataContext);
  if (context === undefined) {
    throw new Error('useUPSData must be used within a UPSDataProvider');
  }
  return context;
};