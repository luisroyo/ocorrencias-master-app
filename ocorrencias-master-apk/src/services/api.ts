// Para produção (Render), use o endereço abaixo:
const API_BASE_URL = 'https://processador-relatorios-ia.onrender.com'; // Backend Flask Render
// Para desenvolvimento local, troque para:
// const API_BASE_URL = 'http://localhost:5000';

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