import { apiFetch } from './api';

export async function analisarRelatorio(token: string, texto_relatorio: string) {
    try {
        console.log('Analisando relatório:', { texto_relatorio: texto_relatorio.substring(0, 100) + '...' });
        
        const response = await apiFetch('/api/ocorrencias/analisar-relatorio', {
            method: 'POST',
            body: JSON.stringify({ texto_relatorio }),
        }, token);
        
        console.log('Resposta da análise:', response);
        return response;
    } catch (error) {
        console.error('Erro ao analisar relatório:', error);
        return { sucesso: false, message: 'Erro ao analisar relatório', error };
    }
} 