import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';

export interface SearchResult {
    id: string;
    type: 'Farmer' | 'Crop Cycle' | 'Forecast' | 'Field Report';
    title: string;
    subtitle: string;
    badge?: string;
    url: string;
}

/**
 * Fetches live data from the API and searches across it.
 * Returns results filtered by `query` (min 2 chars).
 */
export const usePMSearch = (query: string): { results: SearchResult[]; loading: boolean } => {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const cacheRef = useRef<{ farmers: any[]; cycles: any[] }>({ farmers: [], cycles: [] });
    const fetchedRef = useRef(false);

    // Fetch once on first use
    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        setLoading(true);
        Promise.allSettled([
            api.get('/farmers'),
            api.get('/crop-cycles'),
        ]).then(([farmersRes, cyclesRes]) => {
            if (farmersRes.status === 'fulfilled') {
                cacheRef.current.farmers = (farmersRes.value as any).farmers ?? [];
            }
            if (cyclesRes.status === 'fulfilled') {
                cacheRef.current.cycles = (cyclesRes.value as any).data ?? [];
            }
        }).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const q = query.trim().toLowerCase();
        if (q.length < 2) { setResults([]); return; }

        const { farmers, cycles } = cacheRef.current;

        const farmerResults: SearchResult[] = farmers
            .filter(f =>
                f.full_name?.toLowerCase().includes(q) ||
                f.farm_name?.toLowerCase().includes(q) ||
                f.national_id?.toLowerCase().includes(q) ||
                f.cell?.toLowerCase().includes(q) ||
                f.sector?.toLowerCase().includes(q)
            )
            .slice(0, 5)
            .map(f => ({
                id: f._id,
                type: 'Farmer',
                title: f.full_name,
                subtitle: [f.farm_name, f.sector, f.cell].filter(Boolean).join(' · '),
                badge: f.cooperative_name || undefined,
                url: '/pm/farmers',
            }));

        const cycleResults: SearchResult[] = cycles
            .filter((c: any) =>
                c.crop_name?.toLowerCase().includes(q) ||
                c.cycleId?.toLowerCase().includes(q) ||
                c.season?.toLowerCase().includes(q) ||
                c.status?.toLowerCase().includes(q)
            )
            .slice(0, 5)
            .map((c: any) => ({
                id: c._id,
                type: 'Crop Cycle',
                title: `${c.crop_name} — ${c.season ?? ''}`,
                subtitle: `${c.cycleId ?? ''} · ${(c.status ?? '').toUpperCase()}`,
                badge: c.status,
                url: '/pm/crop-planning',
            }));

        setResults([...farmerResults, ...cycleResults].slice(0, 8));
    }, [query]);

    return { results, loading };
};

export const useFMSearch = (
    query: string,
    cycles: any[],
    forecasts: any[],
    fieldReports: any[]
): SearchResult[] => {
    const [results, setResults] = useState<SearchResult[]>([]);

    useEffect(() => {
        const q = query.trim().toLowerCase();
        if (q.length < 2) { setResults([]); return; }

        const cycleResults: SearchResult[] = cycles
            .filter(c =>
                c.crop_name?.toLowerCase().includes(q) ||
                c.cycleId?.toLowerCase().includes(q) ||
                c.season?.toLowerCase().includes(q) ||
                c.status?.toLowerCase().includes(q)
            )
            .slice(0, 4)
            .map(c => ({
                id: c._id,
                type: 'Crop Cycle',
                title: `${c.crop_name} — ${c.season ?? ''}`,
                subtitle: `${c.cycleId ?? ''} · ${(c.status ?? '').toUpperCase()}`,
                badge: c.status,
                url: '/farm-manager/crop-planning',
            }));

        const forecastResults: SearchResult[] = forecasts
            .filter(f =>
                f.status?.toLowerCase().includes(q) ||
                f.confidence?.toLowerCase().includes(q) ||
                f.notes?.toLowerCase().includes(q)
            )
            .slice(0, 3)
            .map(f => ({
                id: f._id,
                type: 'Forecast',
                title: `${f.predictionKg ?? '?'} kg forecast`,
                subtitle: `${f.status} · Harvest ${f.harvestDate ? new Date(f.harvestDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}`,
                badge: f.confidence,
                url: '/farm-manager/yield-forecast',
            }));

        const reportResults: SearchResult[] = fieldReports
            .filter(r =>
                r.description?.toLowerCase().includes(q) ||
                r.status?.toLowerCase().includes(q) ||
                r.pmFlag?.toLowerCase().includes(q)
            )
            .slice(0, 3)
            .map(r => ({
                id: r._id,
                type: 'Field Report',
                title: r.description?.slice(0, 50) || 'Field Report',
                subtitle: `${r.status} · ${new Date(r.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`,
                badge: r.status,
                url: '/farm-manager/crop-planning',
            }));

        setResults([...cycleResults, ...forecastResults, ...reportResults].slice(0, 8));
    }, [query, cycles, forecasts, fieldReports]);

    return results;
};
