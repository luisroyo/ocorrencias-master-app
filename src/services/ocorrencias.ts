import { apiFetch } from './api';

export interface Ocorrencia {
    id: number;
    relatorio_final?: string; // Campo opcional, pode vir como 'descricao' do backend
    descricao?: string; // Campo que o backend retorna
    data_hora_ocorrencia?: string;
    turno?: string;
    status: string;
    endereco_especifico?: string; // Campo opcional, pode vir como 'endereco' do backend
    endereco?: string; // Campo que o backend retorna
    condominio?: string;
    tipo?: string;
    supervisor?: string; // Backend retorna string (nome do supervisor), não number
    supervisor_id?: number; // ID do supervisor
    registrado_por?: string; // Nome do usuário que registrou
    registrado_por_user_id?: number; // ID do usuário que registrou
    data_criacao?: string;
    data_modificacao?: string;
    colaboradores?: string[];
    orgaos_acionados?: string[];
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
        if (!token) {
            console.error('Token não fornecido para análise de relatório');
            return { sucesso: false, message: 'Token de autenticação não fornecido' };
        }

        if (!texto_relatorio || texto_relatorio.trim() === '') {
            console.error('Texto do relatório vazio');
            return { sucesso: false, message: 'Texto do relatório é obrigatório' };
        }

        console.log('Analisando relatório:', {
            token: token ? 'Presente' : 'Ausente',
            texto_relatorio: texto_relatorio.substring(0, 100) + '...'
        });

        const requestBody = { relatorio_bruto: texto_relatorio };
        console.log('Enviando para API:', JSON.stringify(requestBody, null, 2));

        const response = await apiFetch('/api/ocorrencias/analisar-relatorio', {
            method: 'POST',
            body: JSON.stringify(requestBody),
        }, token);

        console.log('Resposta da análise:', response);

        // Verificar se a resposta tem a estrutura esperada
        if (response.classificacao && response.relatorio_processado) {
            return {
                sucesso: true,
                dados: {
                    classificacao: response.classificacao,
                    relatorio_corrigido: response.relatorio_processado,
                    // Outros campos que podem vir do backend
                    ...response
                }
            };
        }

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
        return { historico: response.ocorrencias || [] };
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