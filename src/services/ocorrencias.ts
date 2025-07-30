import { apiFetch } from './api';

export interface Ocorrencia {
    id: number;
    relatorio_final: string;
    data_hora_ocorrencia?: string;
    turno?: string;
    status: string;
    endereco_especifico?: string;
    condominio?: string;
    tipo?: string;
    supervisor?: number;
    colaboradores?: string[];
    orgaos_acionados?: string[];
    data_criacao?: string;
    data_modificacao?: string;
}

export interface FiltrosOcorrencia {
    status?: string;
    condominio_id?: number;
    tipo_id?: number;
    data_inicio?: string;
    data_fim?: string;
    supervisor_id?: number;
}

// Analisar relatório (já existe, mas vou melhorar)
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

// Buscar histórico de ocorrências
export async function buscarHistoricoOcorrencias(token: string, filtros?: FiltrosOcorrencia): Promise<{ historico: Ocorrencia[], error?: string }> {
    try {
        console.log('Buscando histórico de ocorrências:', filtros);

        const params = new URLSearchParams();
        if (filtros?.status) params.append('status', filtros.status);
        if (filtros?.condominio_id) params.append('condominio_id', filtros.condominio_id.toString());
        if (filtros?.tipo_id) params.append('tipo_id', filtros.tipo_id.toString());
        if (filtros?.data_inicio) params.append('data_inicio', filtros.data_inicio);
        if (filtros?.data_fim) params.append('data_fim', filtros.data_fim);
        if (filtros?.supervisor_id) params.append('supervisor_id', filtros.supervisor_id.toString());

        const response = await apiFetch(`/api/ocorrencias/historico?${params.toString()}`, {
            method: 'GET',
        }, token);

        console.log('Resposta do histórico:', response);
        return { historico: response.historico || [] };
    } catch (error: any) {
        console.error('Erro ao buscar histórico:', error);
        return { historico: [], error: error.message };
    }
}

// Buscar detalhes de uma ocorrência específica
export async function buscarDetalhesOcorrencia(token: string, ocorrenciaId: number): Promise<Ocorrencia | null> {
    try {
        console.log('Buscando detalhes da ocorrência:', { ocorrenciaId });

        const response = await apiFetch(`/api/ocorrencias/${ocorrenciaId}`, {
            method: 'GET',
        }, token);

        console.log('Detalhes da ocorrência:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao buscar detalhes da ocorrência:', error);
        return null;
    }
}

// Salvar nova ocorrência
export async function salvarOcorrencia(token: string, dados: {
    relatorio_final: string;
    turno?: string;
    endereco_especifico?: string;
    condominio_id?: number;
    ocorrencia_tipo_id?: number;
    registrado_por_user_id?: number;
    supervisor_id?: number;
}): Promise<{ sucesso: boolean, message?: string, ocorrencia_id?: number, error?: string }> {
    try {
        console.log('Salvando ocorrência:', dados);

        const response = await apiFetch('/api/ocorrencias/salvar', {
            method: 'POST',
            body: JSON.stringify(dados),
        }, token);

        console.log('Resposta do salvamento:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao salvar ocorrência:', error);
        return { sucesso: false, error: error.message };
    }
} 