import { apiFetch } from './api';

export async function buscarColaboradores(token: string, termo: string) {
    return apiFetch(`/colaboradores/search?term=${encodeURIComponent(termo)}`, {}, token);
}

export async function detalhesColaborador(token: string, id: number) {
    return apiFetch(`/colaborador/${id}/details`, {}, token);
} 