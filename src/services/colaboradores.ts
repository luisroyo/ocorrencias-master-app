import { apiFetch } from './api';

export async function buscarColaboradores(nome: string, token?: string) {
    const params = new URLSearchParams({ nome });
    return apiFetch(`/api/colaboradores_view?${params.toString()}`, {}, token);
}

export async function detalhesColaborador(token: string, id: number) {
    return apiFetch(`/colaborador/${id}/details`, {}, token);
} 