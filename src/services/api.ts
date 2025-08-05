// Configuração automática baseada no ambiente
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000'  // Backend local em desenvolvimento
        : 'https://processador-relatorios-ia.onrender.com' // Backend de produção
);

console.log('[API] NODE_ENV:', process.env.NODE_ENV);
console.log('[API] REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);
console.log('[API] Usando API_BASE_URL:', API_BASE_URL);

export async function apiFetch(endpoint: string, options: RequestInit = {}, token?: string): Promise<any> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    console.log('Headers finais:', {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token.substring(0, 20)}...` : 'None'
    });

    console.log(`API Request: ${API_BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token.substring(0, 20)}...` : 'None' },
        options
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    console.log(`API Response:`, { status: response.status, ok: response.ok, url: response.url });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('API Error:', error);
        console.error('Response status:', response.status);
        throw new Error(error.message || 'Erro na requisição');
    }
    return response.json();
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

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Credenciais inválidas');
        }

        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error('Login error:', error);
        throw error;
    }
} 