import { apiFetch } from './api';

export async function buscarEnderecos(nome: string, token?: string) {
    const params = new URLSearchParams({ nome });
    try {
        const resp = await apiFetch(`/api/logradouros_view?${params.toString()}`, {}, token);
        return resp;
    } catch (error) {
        return { logradouros: [], error };
    }
} 