import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
export const useFarmManager = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [cycles, setCycles] = useState<any[]>([]);
  const [budgetRequests, setBudgetRequests] = useState<any[]>([]);
  const [fieldReports, setFieldReports] = useState<any[]>([]);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get('/farm-manager/dashboard');
      setDashboard(res.data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const fetchCycles = useCallback(async () => {
    try {
      const res = await api.get('/farm-manager/cycles');
      setCycles(res.data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const fetchBudgetRequests = useCallback(async () => {
    try {
      const res = await api.get('/farm-manager/budget-requests');
      setBudgetRequests(res.data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const fetchFieldReports = useCallback(async () => {
    try {
      const res = await api.get('/farm-manager/field-reports');
      setFieldReports(res.data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const fetchForecasts = useCallback(async () => {
    try {
      const res = await api.get('/farm-manager/yield-forecasts');
      setForecasts(res.data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const submitBudgetRequest = async (data: {
    cycleId: string;
    cycleName: string;
    startDate: string;
    endDate: string;
    lineItems: { activityName: string; estimatedCostRwf: number }[];
  }) => {
    const res = await api.post('/farm-manager/budget-requests', data);
    await fetchBudgetRequests();
    await fetchCycles();
    return res;
  };

  const submitFieldReport = async (data: {
    cycleId: string;
    description: string;
    category?: string;
    block?: string;
    approvedAmountRwf?: number;
    actualCostRwf: number;
    notes?: string;
    hasProof?: boolean;
    budgetRequestId?: string;
  }) => {
    const res = await api.post('/farm-manager/field-reports', data);
    await fetchFieldReports();
    await fetchCycles();
    await fetchDashboard();
    return res;
  };

  const submitYieldForecast = async (data: {
    cycleId: string;
    harvestDate: string;
    predictionKg: number;
    confidence: string;
    notes?: string;
  }) => {
    const res = await api.post('/farm-manager/yield-forecasts', data);
    await fetchForecasts();
    return res;
  };

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchDashboard(),
      fetchCycles(),
      fetchBudgetRequests(),
      fetchFieldReports(),
      fetchForecasts(),
    ]);
    setLoading(false);
  }, [fetchDashboard, fetchCycles, fetchBudgetRequests, fetchFieldReports, fetchForecasts]);

  useEffect(() => {
    refreshAll();
  }, []);

  return {
    dashboard,
    cycles,
    budgetRequests,
    fieldReports,
    forecasts,
    loading,
    error,
    submitBudgetRequest,
    submitFieldReport,
    submitYieldForecast,
    refreshAll,
    fetchCycles,
    fetchForecasts,
  };
};