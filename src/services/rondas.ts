import { apiFetch } from './api';

export interface Ronda {
    id: number;
    condominio_id: number;
    condominio_nome?: string;
    data_plantao: string;
    escala_plantao: string;
    log_bruto: string;
    total_rondas?: number;
    duracao_total_minutos?: number;
    primeiro_evento_utc?: string;
    ultimo_evento_utc?: string;
    supervisor_id?: number;
    supervisor_nome?: string;
    status: string;
    data_criacao?: string;
    data_modificacao?: string;
}

export interface RondaEmAndamento {
    em_andamento: boolean;
    ronda?: {
        id: number;
        inicio: string;
        data_plantao: string;
    };
}

export interface RelatorioRonda {
    sucesso: boolean;
    relatorio?: string;
    total_rondas?: number;
    duracao_total_minutos?: number;
    message?: string;
}

// Listar rondas do dia
export async function listarRondasDoDia(token: string, condominioId: number, data: string) {
    try {
        console.log('Listando rondas do dia:', { condominioId, data });
        
        const response = await apiFetch(`/api/rondas/do-dia/${condominioId}/${data}`, {
            method: 'GET',
        }, token);
        
        console.log('Resposta das rondas:', response);
        return response;
    } catch (error) {
        console.error('Erro ao listar rondas:', error);
        return { sucesso: false, message: 'Erro ao listar rondas', error };
    }
}

// Verificar ronda em andamento
export async function verificarRondaEmAndamento(token: string, condominioId: number): Promise<RondaEmAndamento> {
    try {
        console.log('Verificando ronda em andamento:', { condominioId });
        
        const response = await apiFetch(`/api/rondas/em-andamento/${condominioId}`, {
            method: 'GET',
        }, token);
        
        console.log('Status da ronda:', response);
        return response;
    } catch (error) {
        console.error('Erro ao verificar ronda em andamento:', error);
        return { em_andamento: false, ronda: undefined };
    }
}

// Iniciar ronda
export async function iniciarRonda(token: string, dados: {
    condominio_id: number;
    data_plantao: string;
    escala_plantao?: string;
    supervisor_id?: number;
}) {
    try {
        console.log('Iniciando ronda:', dados);
        
        const response = await apiFetch('/api/rondas/iniciar', {
            method: 'POST',
            body: JSON.stringify(dados),
        }, token);
        
        console.log('Resposta do início da ronda:', response);
        return response;
    } catch (error) {
        console.error('Erro ao iniciar ronda:', error);
        return { sucesso: false, message: 'Erro ao iniciar ronda', error };
    }
}

// Finalizar ronda
export async function finalizarRonda(token: string, rondaId: number) {
    try {
        console.log('Finalizando ronda:', { rondaId });
        
        const response = await apiFetch(`/api/rondas/finalizar/${rondaId}`, {
            method: 'PUT',
        }, token);
        
        console.log('Resposta da finalização:', response);
        return response;
    } catch (error) {
        console.error('Erro ao finalizar ronda:', error);
        return { sucesso: false, message: 'Erro ao finalizar ronda', error };
    }
}

// Atualizar ronda
export async function atualizarRonda(token: string, rondaId: number, dados: {
    observacoes?: string;
    escala_plantao?: string;
}) {
    try {
        console.log('Atualizando ronda:', { rondaId, dados });
        
        const response = await apiFetch(`/api/rondas/atualizar/${rondaId}`, {
            method: 'PUT',
            body: JSON.stringify(dados),
        }, token);
        
        console.log('Resposta da atualização:', response);
        return response;
    } catch (error) {
        console.error('Erro ao atualizar ronda:', error);
        return { sucesso: false, message: 'Erro ao atualizar ronda', error };
    }
}

// Gerar relatório de ronda
export async function gerarRelatorioRonda(token: string, condominioId: number, data: string): Promise<RelatorioRonda> {
    try {
        console.log('Gerando relatório de ronda:', { condominioId, data });
        
        const response = await apiFetch(`/api/rondas/gerar-relatorio/${condominioId}/${data}`, {
            method: 'POST',
        }, token);
        
        console.log('Relatório gerado:', response);
        return response;
    } catch (error) {
        console.error('Erro ao gerar relatório de ronda:', error);
        return { sucesso: false, message: 'Erro ao gerar relatório de ronda', error };
    }
}

// Enviar relatório via WhatsApp
export async function enviarRelatorioWhatsApp(token: string, condominioId: number, data: string) {
    try {
        console.log('Enviando relatório via WhatsApp:', { condominioId, data });
        
        const response = await apiFetch(`/api/rondas/enviar-whatsapp/${condominioId}/${data}`, {
            method: 'POST',
        }, token);
        
        console.log('Resposta do envio WhatsApp:', response);
        return response;
    } catch (error) {
        console.error('Erro ao enviar relatório via WhatsApp:', error);
        return { sucesso: false, message: 'Erro ao enviar relatório via WhatsApp', error };
    }
}

// Detalhes de uma ronda específica
export async function detalheRonda(token: string, rondaId: number): Promise<Ronda | null> {
    try {
        console.log('Buscando detalhes da ronda:', { rondaId });
        
        const response = await apiFetch(`/api/rondas/${rondaId}`, {
            method: 'GET',
        }, token);
        
        console.log('Detalhes da ronda:', response);
        return response;
    } catch (error) {
        console.error('Erro ao buscar detalhes da ronda:', error);
        return null;
    }
} 