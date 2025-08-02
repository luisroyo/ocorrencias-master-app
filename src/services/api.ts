// Configuração automática baseada no ambiente
const API_BASE_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'  // Backend local em desenvolvimento
    : 'https://processador-relatorios-ia.onrender.com'; // Backend de produção

export async function apiFetch(endpoint: string, options: RequestInit = {}, token?: string) {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    console.log(`API Request: ${API_BASE_URL}${endpoint}`, { headers, options });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    console.log(`API Response:`, { status: response.status, ok: response.ok });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('API Error:', error);
        throw new Error(error.message || 'Erro na requisição');
    }
    return response.json();
}

// Função para fazer login real
export async function loginUser(email: string, password: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
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