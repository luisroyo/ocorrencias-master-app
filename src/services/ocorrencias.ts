import { apiFetch } from './api';

export async function listarOcorrencias(token: string, filtros: Record<string, any> = {}) {
    const params = new URLSearchParams(filtros as any).toString();
    return apiFetch(`/ocorrencias${params ? '?' + params : ''}`, {}, token);
}

export async function detalheOcorrencia(token: string, id: number) {
    return apiFetch(`/ocorrencias/${id}`, {}, token);
}

export async function criarOcorrencia(token: string, dados: any) {
    return apiFetch('/ocorrencias', {
        method: 'POST',
        body: JSON.stringify(dados),
    }, token);
}

export async function editarOcorrencia(token: string, id: number, dados: any) {
    return apiFetch(`/ocorrencias/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados),
    }, token);
} 