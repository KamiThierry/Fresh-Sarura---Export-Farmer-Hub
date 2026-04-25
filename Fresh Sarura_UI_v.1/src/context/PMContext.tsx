import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { CropCycle, Farmer, BudgetRequest } from '@/types';

interface PMContextType {
  cycles: CropCycle[];
  farmers: Farmer[];
  shipments: any[];
  pendingRequests: BudgetRequest[];
  pendingForecasts: any[];
  pendingReports: any[];
  pendingRoomRequests: any[];
  loading: boolean;
  error: string | null;
  refreshCycles: () => Promise<void>;
  refreshFarmers: () => Promise<void>;
  refreshShipments: () => Promise<void>;
  refreshPendingRequests: () => Promise<void>;
  refreshPendingForecasts: () => Promise<void>;
  refreshPendingReports: () => Promise<void>;
  refreshPendingRoomRequests: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const PMContext = createContext<PMContextType | undefined>(undefined);

export const PMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cycles, setCycles] = useState<CropCycle[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<BudgetRequest[]>([]);
  const [pendingForecasts, setPendingForecasts] = useState<any[]>([]);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [pendingRoomRequests, setPendingRoomRequests] = useState<any[]>([]);
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

  const refreshShipments = useCallback(async () => {
    try {
        const res = await api.get('/shipments');
        const data = res.data?.data ?? res?.data ?? res ?? [];
        setShipments(Array.isArray(data) ? data : []);
    } catch (err: any) {
        console.error('PMContext: Failed to fetch shipments', err);
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

  const refreshPendingRoomRequests = useCallback(async () => {
    try {
      const res = await api.get('/processing-batches/pending-room');
      const data = res.data?.data ?? res?.data ?? res ?? [];
      setPendingRoomRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('PMContext: Failed to fetch pending room requests', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      refreshCycles(),
      refreshFarmers(),
      refreshPendingRequests(),
      refreshPendingForecasts(),
      refreshPendingReports(),
      refreshPendingRoomRequests(),
      refreshShipments(),
    ]);
    setLoading(false);
  }, [refreshCycles, refreshFarmers, refreshPendingRequests, refreshPendingForecasts, refreshPendingReports, refreshPendingRoomRequests, refreshShipments]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <PMContext.Provider value={{
      cycles,
      farmers,
      shipments,
      pendingRequests,
      pendingForecasts,
      pendingReports,
      pendingRoomRequests,
      loading,
      error,
      refreshCycles,
      refreshFarmers,
      refreshShipments,
      refreshPendingRequests,
      refreshPendingForecasts,
      refreshPendingReports,
      refreshPendingRoomRequests,
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
