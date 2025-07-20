import { apiFetch } from './api';

// Função para buscar o CSRF token
export async function getCsrfToken() {
    const response = await fetch('https://processador-relatorios-ia.onrender.com/login', {
        method: 'GET',
        credentials: 'include',
    });
    try {
        const data = await response.json();
        if (data.csrf_token) return data.csrf_token;
    } catch { }
    return null;
}

export async function login(email: string, password: string) {
    return fetch('https://processador-relatorios-ia.onrender.com/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    }).then(async res => {
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Erro na requisição');
        }
        return res.json();
    });
}