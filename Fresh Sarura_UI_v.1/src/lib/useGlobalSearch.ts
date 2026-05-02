import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

export type SearchType = 'Farmer' | 'Crop Cycle' | 'Forecast' | 'Field Report' | 'Shipment' | 'Batch' | 'User' | 'Intake';

export interface SearchResult {
    id: string;
    type: SearchType;
    title: string;
    subtitle: string;
    badge?: string;
    url: string;
}

/**
 * A universal search hook that adapts its data fetching and results based on the user role.
 */
export const useUniversalSearch = (query: string, role: string): { results: SearchResult[]; loading: boolean } => {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Cache for all searchable entities
    const cacheRef = useRef<{
        farmers: any[];
        cycles: any[];
        shipments: any[];
        batches: any[];
        users: any[];
    }>({ farmers: [], cycles: [], shipments: [], batches: [], users: [] });
    
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        setLoading(true);

        const endpoints = [
            api.get('/farmers'),
            api.get('/crop-cycles'),
        ];

        // Add role-specific data fetching
        if (['admin', 'logistics_officer'].includes(role)) {
            endpoints.push(api.get('/shipments'));
        }
        if (['admin', 'production_manager', 'quality_officer'].includes(role)) {
            endpoints.push(api.get('/stock')); // Processing Batches
        }
        if (role === 'admin') {
            endpoints.push(api.get('/auth/users'));
        }

        Promise.allSettled(endpoints).then((responses) => {
            responses.forEach((res, idx) => {
                if (res.status === 'fulfilled') {
                    const data = (res.value as any).data ?? res.value;
                    if (idx === 0) cacheRef.current.farmers = (res.value as any).farmers ?? data ?? [];
                    else if (idx === 1) cacheRef.current.cycles = data ?? [];
                    else {
                        // Dynamically map the rest based on what was added
                        const offsetIdx = idx - 2;
                        const activeEndpoints = endpoints.slice(2);
                        // This mapping depends on the order they were pushed above
                        // Admin: [shipments, stock, users]
                        // Logistics: [shipments]
                        // QC: [stock]
                        if (role === 'admin') {
                            if (offsetIdx === 0) cacheRef.current.shipments = data ?? [];
                            if (offsetIdx === 1) cacheRef.current.batches = data ?? [];
                            if (offsetIdx === 2) cacheRef.current.users = data ?? [];
                        } else if (role === 'logistics_officer') {
                            if (offsetIdx === 0) cacheRef.current.shipments = data ?? [];
                        } else if (role === 'quality_officer') {
                            if (offsetIdx === 0) cacheRef.current.batches = data ?? [];
                        } else if (role === 'production_manager') {
                            if (offsetIdx === 0) cacheRef.current.batches = data ?? [];
                        }
                    }
                }
            });
        }).finally(() => setLoading(false));
    }, [role]);

    useEffect(() => {
        const q = query.trim().toLowerCase();
        if (q.length < 2) { setResults([]); return; }

        const { farmers, cycles, shipments, batches, users } = cacheRef.current;
        const allResults: SearchResult[] = [];

        // 1. Farmer Results
        farmers.filter(f => 
            f.full_name?.toLowerCase().includes(q) || 
            f.farm_name?.toLowerCase().includes(q) ||
            f.national_id?.toLowerCase().includes(q)
        ).slice(0, 3).forEach(f => {
            allResults.push({
                id: f._id,
                type: 'Farmer',
                title: f.full_name,
                subtitle: `${f.farm_name || 'Individual'} · ${f.district || ''}`,
                badge: f.status,
                url: role === 'admin' ? '/admin/farmers' : '/pm/farmers'
            });
        });

        // 2. Crop Cycles
        cycles.filter(c => 
            c.crop_name?.toLowerCase().includes(q) || 
            c.cycleId?.toLowerCase().includes(q)
        ).slice(0, 3).forEach(c => {
            allResults.push({
                id: c._id,
                type: 'Crop Cycle',
                title: `${c.crop_name} (${c.season})`,
                subtitle: `${c.cycleId} · ${c.status}`,
                badge: c.status,
                url: role === 'admin' ? '/admin/dashboard' : '/pm/crop-planning'
            });
        });

        // 3. Shipments
        if (['admin', 'logistics_officer'].includes(role)) {
            shipments.filter(s => 
                s.plNumber?.toLowerCase().includes(q) || 
                s.destination?.toLowerCase().includes(q)
            ).slice(0, 3).forEach(s => {
                allResults.push({
                    id: s._id,
                    type: 'Shipment',
                    title: `Packing List: ${s.plNumber}`,
                    subtitle: `${s.destination} · ${s.totalWeightKg}kg`,
                    badge: s.status,
                    url: role === 'admin' ? '/admin/reports' : '/logistics/shipments'
                });
            });
        }

        // 4. Batches
        if (['admin', 'production_manager', 'quality_officer'].includes(role)) {
            batches.filter(b => 
                b.stockId?.toLowerCase().includes(q) || 
                b.cropName?.toLowerCase().includes(q)
            ).slice(0, 3).forEach(b => {
                allResults.push({
                    id: b._id,
                    type: 'Batch',
                    title: `Batch: ${b.stockId || b._id.slice(-6)}`,
                    subtitle: `${b.cropName} · ${b.processedWeightKg || 0}kg`,
                    badge: b.status,
                    url: role === 'admin' ? '/admin/reports' : (role === 'quality_officer' ? '/qc/inspection' : '/pm/stock')
                });
            });
        }

        // 5. Users (Admin Only)
        if (role === 'admin') {
            users.filter(u => 
                u.name?.toLowerCase().includes(q) || 
                u.email?.toLowerCase().includes(q) ||
                u.role?.toLowerCase().includes(q)
            ).slice(0, 3).forEach(u => {
                allResults.push({
                    id: u._id,
                    type: 'User',
                    title: u.name,
                    subtitle: `${u.email} · ${u.role.replace('_', ' ')}`,
                    badge: u.isActive ? 'Active' : 'Pending',
                    url: '/admin/users'
                });
            });
        }

        setResults(allResults.slice(0, 8));
    }, [query, role]);

    return { results, loading };
};

// Legacy support for backward compatibility if needed, but redirects to useUniversalSearch
export const usePMSearch = (query: string) => useUniversalSearch(query, 'production_manager');
export const useFMSearch = (query: string, cycles: any[], forecasts: any[], fieldReports: any[]) => {
    // FM search is slightly different as it uses local state often, keeping it as is but updated
    const [results, setResults] = useState<SearchResult[]>([]);
    useEffect(() => {
        const q = query.trim().toLowerCase();
        if (q.length < 2) { setResults([]); return; }
        const all: SearchResult[] = [];
        cycles.filter(c => c.crop_name?.toLowerCase().includes(q)).slice(0, 3).forEach(c => all.push({
            id: c._id, type: 'Crop Cycle', title: c.crop_name, subtitle: c.cycleId, url: '/farm-manager/crop-planning'
        }));
        forecasts.filter(f => f.notes?.toLowerCase().includes(q)).slice(0, 2).forEach(f => all.push({
            id: f._id, type: 'Forecast', title: 'Yield Forecast', subtitle: f.notes, url: '/farm-manager/yield-forecast'
        }));
        setResults(all.slice(0, 8));
    }, [query, cycles, forecasts]);
    return results;
};

