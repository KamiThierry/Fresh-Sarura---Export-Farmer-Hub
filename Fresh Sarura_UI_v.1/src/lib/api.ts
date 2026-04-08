const API_BASE_URL = 'http://localhost:3000/api/v1';

export const api = {
    post: async (endpoint: string, data: object) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Something went wrong');
        return result;
    },
};