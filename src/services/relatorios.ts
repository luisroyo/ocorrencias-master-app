import { apiFetch } from './api';

export async function analisarRelatorio(token: string, texto_relatorio: string) {
    try {
        return await apiFetch('/api/ocorrencias/analisar-relatorio', {
            method: 'POST',
            body: JSON.stringify({ texto_relatorio }),
        }, token);
    } catch (error) {
        return { sucesso: false, message: 'Erro ao analisar relatório', error };
    }
} 