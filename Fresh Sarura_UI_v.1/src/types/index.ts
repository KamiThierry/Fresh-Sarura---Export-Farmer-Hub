
export interface Farmer {
    _id: string;
    full_name: string;
    farm_name?: string | null;
    district: string;
    sector: string;
    cell: string;
    village: string;
    produce_types: string[];
    farm_size_hectares: number;
    production_capacity_tons: number;
    phone: string;
    email: string | null;
    national_id: string;
    status: 'Active' | 'Inactive' | 'Auditing';
    grade?: string;
    photo_url?: string | null;
    id_certificate_url?: string | null;
    created_at?: string;
    updated_at?: string;
    latitude?: number;
    longitude?: number;
}
