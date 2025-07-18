import { apiFetch } from './api';

export async function analisarRelatorio(token: string, texto_relatorio: string) {
    return apiFetch('/ocorrencias/analisar-relatorio', {
        method: 'POST',
        body: JSON.stringify({ texto_relatorio }),
    }, token);
} 