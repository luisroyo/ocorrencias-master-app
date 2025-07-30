import { apiFetch } from './api';

export interface Colaborador {
    id: number;
    nome_completo: string;
    cargo: string;
    matricula: string;
    data_admissao?: string;
    status: string;
    data_criacao?: string;
    data_modificacao?: string;
}

// Buscar colaboradores com autocompletar
export async function buscarColaboradores(nome: string, token?: string): Promise<{ colaboradores: Colaborador[], error?: string }> {
    try {
        console.log('Buscando colaboradores:', { nome });

        const params = new URLSearchParams();
        if (nome) {
            params.append('nome', nome);
        }

        const response = await apiFetch(`/api/colaboradores?${params.toString()}`, {}, token);

        console.log('Resposta da busca de colaboradores:', response);
        return { colaboradores: response.colaboradores || [] };
    } catch (error: any) {
        console.error('Erro ao buscar colaboradores:', error);
        return { colaboradores: [], error: error.message };
    }
}

// Buscar colaboradores da view (com mais informações)
export async function buscarColaboradoresView(nome: string, token?: string): Promise<{ colaboradores: Colaborador[], error?: string }> {
    try {
        console.log('Buscando colaboradores (view):', { nome });

        const params = new URLSearchParams();
        if (nome) {
            params.append('nome', nome);
        }

        const response = await apiFetch(`/api/colaboradores_view?${params.toString()}`, {}, token);

        console.log('Resposta da busca de colaboradores (view):', response);
        return { colaboradores: response.colaboradores || [] };
    } catch (error: any) {
        console.error('Erro ao buscar colaboradores (view):', error);
        return { colaboradores: [], error: error.message };
    }
} 