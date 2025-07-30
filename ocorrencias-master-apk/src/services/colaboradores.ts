import { apiFetch } from './api';

export async function buscarColaboradores(nome: string, token?: string) {
    const params = new URLSearchParams({ nome });
    try {
        const resp = await apiFetch(`/api/colaboradores?${params.toString()}`, {}, token);
        return resp;
    } catch (error) {
        return { colaboradores: [], error };
    }
}

// Caso precise buscar pela view, descomente abaixo:
// export async function buscarColaboradoresView(nome: string, token?: string) {
//     const params = new URLSearchParams({ nome });
//     return apiFetch(`/api/colaboradores_view?${params.toString()}`, {}, token);
// }

export async function detalhesColaborador(token: string, id: number) {
    return apiFetch(`/colaborador/${id}/details`, {}, token);
} 