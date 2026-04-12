const API_BASE_URL = 'http://localhost:3000/api/v1';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

export const api = {
    get: async (endpoint: string) => {
<<<<<<< HEAD
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: getHeaders(),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Something went wrong');
        return result;
    },
    post: async (endpoint: string, data: object) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
=======
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Request failed');
        }
        return res.json();
    },

    post: async (endpoint: string, data: any) => {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
>>>>>>> a5d9669 (updated FM portal version)
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Something went wrong');
        return result;
    },
    patch: async (endpoint: string, data: object) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
<<<<<<< HEAD
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Something went wrong');
        return result;
    },
    delete: async (endpoint: string) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Something went wrong');
        return result;
=======
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Request failed');
        }
        return res.json();
    },

    delete: async (endpoint: string) => {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Request failed');
        }
        return res.json();
>>>>>>> a5d9669 (updated FM portal version)
    },
};