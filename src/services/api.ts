// Configuração automática baseada no ambiente
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000'  // Backend local em desenvolvimento
        : 'https://processador-relatorios-ia.onrender.com' // Backend de produção
);

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (!IS_PRODUCTION) {
    console.log('[API] NODE_ENV:', process.env.NODE_ENV);
    console.log('[API] REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);
    console.log('[API] Usando API_BASE_URL:', API_BASE_URL);
}

async function parseResponseSafely(response: Response): Promise<any> {
    if (response.status === 204) return {};
    const contentType = response.headers.get('content-type') || '';
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') return {};
    if (contentType.includes('application/json')) {
        try {
            return await response.json();
        } catch {
            return {};
        }
    }
    try {
        const text = await response.text();
        // Tenta JSON se texto parece JSON, senão retorna texto embrulhado
        try {
            return JSON.parse(text);
        } catch {
            return { raw: text };
        }
    } catch {
        return {};
    }
}

export async function apiFetch(endpoint: string, options: RequestInit = {}, token?: string): Promise<any> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    if (!IS_PRODUCTION) {
        console.log('Headers finais:', {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token.substring(0, 10)}...` : 'None'
        });
        console.log(`API Request: ${API_BASE_URL}${endpoint}`, {
            headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token.substring(0, 10)}...` : 'None' },
            options
        });
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!IS_PRODUCTION) {
        console.log(`API Response:`, { status: response.status, ok: response.ok, url: response.url });
    }

    if (response.status === 401) {
        if (!IS_PRODUCTION) console.warn('API 401 - Não autorizado. Redirecionando para login.');
        try { window.location.assign('/'); } catch { /* noop */ }
        throw new Error('Não autorizado');
    }

    const parsed = await parseResponseSafely(response);

    if (!response.ok) {
        const message = parsed?.message || parsed?.error || parsed?.detail || (parsed?.raw || `Erro na requisição (${response.status})`);
        if (!IS_PRODUCTION) {
            console.error('API Error payload:', parsed);
            console.error('Response status:', response.status);
        }
        throw new Error(message);
    }

    return parsed;
}

// Função para fazer login real
export async function loginUser(email: string, password: string): Promise<any> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const parsed = await parseResponseSafely(response);

        if (!response.ok) {
            const message = parsed?.message || parsed?.error || parsed?.detail || 'Credenciais inválidas';
            throw new Error(message);
        }

        return parsed;
    } catch (error: any) {
        if (!IS_PRODUCTION) console.error('Login error:', error);
        throw error;
    }
} 