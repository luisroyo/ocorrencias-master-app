const API_BASE_URL = 'https://processador-relatorios-ia.onrender.com'; // Backend Flask Render

export async function apiFetch(endpoint: string, options: RequestInit = {}, token?: string) {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Erro na requisição');
    }
    return response.json();
} 