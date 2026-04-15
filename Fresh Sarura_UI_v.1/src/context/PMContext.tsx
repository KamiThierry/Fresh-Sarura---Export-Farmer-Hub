import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { CropCycle, Farmer, BudgetRequest } from '@/types';

interface PMContextType {
  cycles: CropCycle[];
  farmers: Farmer[];
  pendingRequests: BudgetRequest[];
  pendingForecasts: any[];
  pendingReports: any[];
  loading: boolean;
  error: string | null;
  refreshCycles: () => Promise<void>;
  refreshFarmers: () => Promise<void>;
  refreshPendingRequests: () => Promise<void>;
  refreshPendingForecasts: () => Promise<void>;
  refreshPendingReports: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const PMContext = createContext<PMContextType | undefined>(undefined);

export const PMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cycles, setCycles] = useState<CropCycle[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [pendingRequests, setPendingRequests] = useState<BudgetRequest[]>([]);
  const [pendingForecasts, setPendingForecasts] = useState<any[]>([]);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCycles = useCallback(async () => {
    try {
      const res = await api.get('/crop-cycles');
      console.log('PMContext: refreshCycles res:', res);
      const data = res.data?.data ?? res?.data ?? res ?? [];
      setCycles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('PMContext: Failed to fetch cycles', err);
      setError(err.message);
    }
  }, []);

  const refreshFarmers = useCallback(async () => {
    try {
      const res = await api.get('/farmers');
      console.log('PMContext: refreshFarmers res:', res);
      const data = res.farmers ?? res.data?.farmers ?? res.data ?? res ?? [];
      setFarmers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('PMContext: Failed to fetch farmers', err);
      setError(err.message);
    }
  }, []);

  const refreshPendingRequests = useCallback(async () => {
    try {
      const res = await api.get('/crop-cycles/budget-requests/pending');
      const data = res.data?.data ?? res?.data ?? res ?? [];
      setPendingRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('PMContext: Failed to fetch pending requests', err);
    }
  }, []);

  const refreshPendingForecasts = useCallback(async () => {
    try {
      const res = await api.get('/crop-cycles/forecasts/pending');
      const data = res.data?.data ?? res?.data ?? res ?? [];
      setPendingForecasts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('PMContext: Failed to fetch pending forecasts', err);
    }
  }, []);

  const refreshPendingReports = useCallback(async () => {
    try {
      const res = await api.get('/crop-cycles/field-reports/pending');
      const data = res.data?.data ?? res?.data ?? res ?? [];
      setPendingReports(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('PMContext: Failed to fetch pending reports', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      refreshCycles(),
      refreshFarmers(),
      refreshPendingRequests(),
      refreshPendingForecasts(),
      refreshPendingReports()
    ]);
    setLoading(false);
  }, [refreshCycles, refreshFarmers, refreshPendingRequests, refreshPendingForecasts, refreshPendingReports]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <PMContext.Provider value={{
      cycles,
      farmers,
      pendingRequests,
      pendingForecasts,
      pendingReports,
      loading,
      error,
      refreshCycles,
      refreshFarmers,
      refreshPendingRequests,
      refreshPendingForecasts,
      refreshPendingReports,
      refreshAll
    }}>
      {children}
    </PMContext.Provider>
  );
};

export const usePMContext = () => {
  const context = useContext(PMContext);
  if (context === undefined) {
    throw new Error('usePMContext must be used within a PMProvider');
  }
  return context;
};

/*
Refactoring Tasks:
- [x] Create `PMContext.tsx` for global state management
- [x] Update `ProductionManagerRoutes.tsx` with the new Provider
- [x] Enhance `api.ts` for robust response mapping (Handled in Context)
- [x] Refactor `CropPlanning.tsx` to use `usePMContext`
- [x] Refactor `FarmerManagement.tsx` to use `usePMContext`
- [x] Verify navigation stability and data persistence
*/
