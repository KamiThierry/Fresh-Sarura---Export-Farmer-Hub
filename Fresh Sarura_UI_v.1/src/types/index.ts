
export interface Farmer {
    id: string;
    full_name: string;
    cooperative_name: string | null;
    district: string;
    sector: string;
    produce_types: string[];
    farm_size_hectares: number;
    production_capacity_tons: number;
    phone: string;
    email: string | null;
    id_certificate_url: string | null;
    status: 'active' | 'inactive';
    photo_url: string | null;
    created_at: string;
    updated_at: string;
    // Added coordinates
    latitude?: number;
    longitude?: number;
}
