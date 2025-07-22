import { apiFetch } from './api';

export async function buscarEnderecos(nome: string, token?: string) {
    const params = new URLSearchParams({ nome });
    return apiFetch(`/api/logradouros_view?${params.toString()}`, {}, token);
} 