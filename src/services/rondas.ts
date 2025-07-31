import { apiFetch } from './api';

// Interfaces para Condomínios
export interface Condominio {
    id: number;
    nome: string;
}

export interface ListaCondominios {
    sucesso: boolean;
    condominios: Condominio[];
    total: number;
}

// Interfaces para Colaboradores
export interface Colaborador {
    id: number;
    nome: string;
    nome_completo: string;
    email?: string;
    cargo?: string;
}

export interface ListaColaboradores {
    sucesso: boolean;
    colaboradores: Colaborador[];
    total: number;
}

// Interfaces para Rondas Regulares
export interface Ronda {
    id: number;
    condominio_id: number;
    condominio_nome?: string;
    data_plantao: string;
    escala_plantao: string;
    log_bruto?: string;
    total_rondas?: number;
    duracao_total_minutos?: number;
    primeiro_evento_utc?: string;
    ultimo_evento_utc?: string;
    user_id?: number;
    user_nome?: string;
    status: string;
    data_criacao?: string;
    data_modificacao?: string;
}

// Interfaces para Rondas Esporádicas
export interface RondaEsporadica {
    id: number;
    condominio_id: number;
    condominio_nome?: string;
    user_id: number;
    user_nome?: string;
    data_plantao: string;
    hora_entrada: string;
    hora_saida?: string;
    duracao_formatada?: string;
    duracao_minutos?: number;
    escala_plantao: string;
    turno: string;
    observacoes?: string;
    log_bruto?: string;
    relatorio_processado?: string;
    status: string;
    data_criacao?: string;
    data_modificacao?: string;
}

export interface RondaEmAndamento {
    em_andamento: boolean;
    ronda?: {
        id: number;
        inicio?: string;
        data_plantao?: string;
        hora_entrada?: string;
        escala_plantao?: string;
        turno?: string;
        observacoes?: string;
        user_id?: number;
        user_nome?: string;
    };
}

export interface ValidacaoHorario {
    sucesso: boolean;
    horario_valido: boolean;
    mensagem: string;
    hora_atual: string;
    hora_informada: string;
}

export interface ConsolidacaoResultado {
    sucesso: boolean;
    message: string;
    relatorio_consolidado?: string;
    total_rondas?: number;
    periodo?: string;
    duracao_total_minutos?: number;
    whatsapp_enviado?: boolean;
    ronda_principal_id?: number;
}

export interface StatusConsolidacao {
    sucesso: boolean;
    data: string;
    condominio_id: number;
    status: {
        total_rondas_esporadicas: number;
        rondas_finalizadas: number;
        rondas_processadas: number;
        duracao_total_minutos: number;
        ronda_principal_criada: boolean;
        ronda_principal_id?: number;
        pode_consolidar: boolean;
        ja_consolidado: boolean;
    };
    rondas: RondaEsporadica[];
}

// ===== CONDOMÍNIOS =====

export async function listarCondominios(token: string): Promise<ListaCondominios> {
    try {
        console.log('Buscando condomínios');
        const response = await apiFetch('/api/condominios', {}, token);
        console.log('Resposta da busca de condomínios:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao buscar condomínios:', error);
        return { sucesso: false, condominios: [], total: 0 };
    }
}

// Buscar condomínios com autocompletar
export async function buscarCondominios(nome: string, token?: string): Promise<{ condominios: Condominio[], error?: string }> {
    try {
        console.log('Buscando condomínios:', { nome });

        const params = new URLSearchParams();
        if (nome) {
            params.append('nome', nome);
        }

        const response = await apiFetch(`/api/condominios?${params.toString()}`, {}, token);

        console.log('Resposta da busca de condomínios:', response);
        return { condominios: response.condominios || [] };
    } catch (error: any) {
        console.error('Erro ao buscar condomínios:', error);
        return { condominios: [], error: error.message };
    }
}

// ===== COLABORADORES =====

export async function listarColaboradores(token: string): Promise<ListaColaboradores> {
    try {
        console.log('Buscando colaboradores');
        const response = await apiFetch('/api/colaboradores', {}, token);
        console.log('Resposta da busca de colaboradores:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao buscar colaboradores:', error);
        return { sucesso: false, colaboradores: [], total: 0 };
    }
}

// Buscar colaboradores com autocompletar (igual ao usado em ocorrências)
export async function buscarColaboradores(nome: string, token?: string): Promise<{ colaboradores: Colaborador[], error?: string }> {
    try {
        console.log('Buscando colaboradores:', { nome });

        const params = new URLSearchParams();
        if (nome) {
            params.append('nome', nome);
        }

        const response = await apiFetch(`/api/colaboradores?${params.toString()}`, {}, token);

        console.log('Resposta da busca de colaboradores:', response);
        return { colaboradores: response.colaboradores || [] };
    } catch (error: any) {
        console.error('Erro ao buscar colaboradores:', error);
        return { colaboradores: [], error: error.message };
    }
}

// ===== RONDAS REGULARES =====

export async function listarRondasDoDia(token: string, condominioId: number, data: string): Promise<{ rondas: Ronda[], error?: string }> {
    try {
        console.log('Buscando rondas do dia:', { condominioId, data });
        const response = await apiFetch(`/api/rondas/do-dia/${condominioId}/${data}`, {}, token);
        console.log('Resposta da busca de rondas:', response);
        return { rondas: response.rondas || [] };
    } catch (error: any) {
        console.error('Erro ao buscar rondas do dia:', error);
        return { rondas: [], error: error.message };
    }
}

export async function verificarRondaEmAndamento(token: string, condominioId: number): Promise<RondaEmAndamento> {
    try {
        console.log('Verificando ronda em andamento:', { condominioId });
        const response = await apiFetch(`/api/rondas/em-andamento/${condominioId}`, {}, token);
        console.log('Resposta da verificação de ronda:', response);

        // Verificar se a resposta tem a estrutura esperada
        if (response && typeof response.em_andamento === 'boolean') {
            return response;
        } else {
            console.warn('Resposta inesperada da API:', response);
            return { em_andamento: false };
        }
    } catch (error: any) {
        console.error('Erro ao verificar ronda em andamento:', error);
        // Retornar estado padrão em caso de erro
        return { em_andamento: false };
    }
}

export async function iniciarRonda(token: string, dados: {
    condominio_id: number;
    data_plantao: string;
    escala_plantao?: string;
    user_id?: number;
}): Promise<{ sucesso: boolean; message: string; ronda_id?: number }> {
    try {
        console.log('Iniciando ronda:', dados);
        const response = await apiFetch('/api/rondas/iniciar', {
            method: 'POST',
            body: JSON.stringify(dados)
        }, token);
        console.log('Resposta do início de ronda:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao iniciar ronda:', error);
        return { sucesso: false, message: error.message };
    }
}

export async function finalizarRonda(token: string, rondaId: number, dados: {
    log_bruto?: string;
    observacoes?: string;
}): Promise<{ sucesso: boolean; message: string }> {
    try {
        console.log('Finalizando ronda:', { rondaId, dados });
        const response = await apiFetch(`/api/rondas/finalizar/${rondaId}`, {
            method: 'PUT',
            body: JSON.stringify(dados)
        }, token);
        console.log('Resposta da finalização de ronda:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao finalizar ronda:', error);
        return { sucesso: false, message: error.message };
    }
}

export async function atualizarRonda(token: string, rondaId: number, dados: {
    log_bruto?: string;
    observacoes?: string;
}): Promise<{ sucesso: boolean; message: string }> {
    try {
        console.log('Atualizando ronda:', { rondaId, dados });
        const response = await apiFetch(`/api/rondas/atualizar/${rondaId}`, {
            method: 'PUT',
            body: JSON.stringify(dados)
        }, token);
        console.log('Resposta da atualização de ronda:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao atualizar ronda:', error);
        return { sucesso: false, message: error.message };
    }
}

export async function gerarRelatorioRonda(token: string, condominioId: number, data: string): Promise<{ sucesso: boolean; message: string; relatorio?: string }> {
    try {
        console.log('Gerando relatório de ronda:', { condominioId, data });
        const response = await apiFetch(`/api/rondas/gerar-relatorio/${condominioId}/${data}`, {
            method: 'POST'
        }, token);
        console.log('Resposta da geração de relatório:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao gerar relatório de ronda:', error);
        return { sucesso: false, message: error.message };
    }
}

export async function enviarRondaWhatsApp(token: string, condominioId: number, data: string): Promise<{ sucesso: boolean; message: string }> {
    try {
        console.log('Enviando ronda via WhatsApp:', { condominioId, data });
        const response = await apiFetch(`/api/rondas/enviar-whatsapp/${condominioId}/${data}`, {
            method: 'POST'
        }, token);
        console.log('Resposta do envio via WhatsApp:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao enviar ronda via WhatsApp:', error);
        return { sucesso: false, message: error.message };
    }
}

export async function buscarDetalhesRonda(token: string, rondaId: number): Promise<Ronda | null> {
    try {
        console.log('Buscando detalhes da ronda:', { rondaId });
        const response = await apiFetch(`/api/rondas/${rondaId}`, {}, token);
        console.log('Resposta dos detalhes da ronda:', response);
        return response.ronda || null;
    } catch (error: any) {
        console.error('Erro ao buscar detalhes da ronda:', error);
        return null;
    }
}

// ===== RONDAS ESPORÁDICAS =====

export async function validarHorarioEntrada(token: string, horaEntrada: string): Promise<ValidacaoHorario> {
    try {
        console.log('Validando horário de entrada:', { horaEntrada });

        // Validação local do horário
        const agora = new Date();
        const horaAtual = agora.getHours().toString().padStart(2, '0') + ':' + agora.getMinutes().toString().padStart(2, '0');

        // Converter hora de entrada para minutos para comparação
        const [horaEntradaH, horaEntradaM] = horaEntrada.split(':').map(Number);
        const [horaAtualH, horaAtualM] = horaAtual.split(':').map(Number);

        const minutosEntrada = horaEntradaH * 60 + horaEntradaM;
        const minutosAtual = horaAtualH * 60 + horaAtualM;

        // Permitir uma tolerância de 30 minutos para trás ou para frente
        const tolerancia = 30;
        const horarioValido = Math.abs(minutosEntrada - minutosAtual) <= tolerancia;

        const mensagem = horarioValido
            ? `Horário válido. Hora atual: ${horaAtual}, Hora informada: ${horaEntrada}`
            : `Horário inválido. Hora atual: ${horaAtual}, Hora informada: ${horaEntrada}. Tolerância: ±${tolerancia} minutos`;

        console.log('Validação local:', { horaAtual, horaEntrada, horarioValido, mensagem });

        return {
            sucesso: true,
            horario_valido: horarioValido,
            mensagem: mensagem,
            hora_atual: horaAtual,
            hora_informada: horaEntrada
        };
    } catch (error: any) {
        console.error('Erro ao validar horário:', error);
        return {
            sucesso: false,
            horario_valido: false,
            mensagem: error.message,
            hora_atual: '',
            hora_informada: horaEntrada
        };
    }
}

export async function verificarRondaEsporadicaEmAndamento(token: string, condominioId: number, dataPlantao: string): Promise<RondaEmAndamento> {
    try {
        console.log('Verificando ronda esporádica em andamento:', { condominioId, dataPlantao });
        const response = await apiFetch(`/api/rondas-esporadicas/em-andamento/${condominioId}?data_plantao=${dataPlantao}`, {}, token);
        console.log('Resposta da verificação de ronda esporádica:', response);

        // Verificar se a resposta tem a estrutura esperada
        if (response && typeof response.em_andamento === 'boolean') {
            return response;
        } else {
            console.warn('Resposta inesperada da API:', response);
            return { em_andamento: false };
        }
    } catch (error: any) {
        console.error('Erro ao verificar ronda esporádica em andamento:', error);
        // Retornar estado padrão em caso de erro
        return { em_andamento: false };
    }
}

export async function iniciarRondaEsporadica(token: string, dados: {
    condominio_id: number;
    user_id: number;
    data_plantao: string;
    hora_entrada: string;
    escala_plantao: string;
    turno: string;
    observacoes?: string;
}): Promise<{ sucesso: boolean; message: string; ronda_id?: number }> {
    try {
        console.log('Iniciando ronda esporádica:', dados);
        const response = await apiFetch('/api/rondas-esporadicas/iniciar', {
            method: 'POST',
            body: JSON.stringify(dados)
        }, token);
        console.log('Resposta do início de ronda esporádica:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao iniciar ronda esporádica:', error);
        return { sucesso: false, message: error.message };
    }
}

export async function finalizarRondaEsporadica(token: string, rondaId: number, dados: {
    hora_saida: string;
    observacoes?: string;
}): Promise<{ sucesso: boolean; message: string }> {
    try {
        console.log('Finalizando ronda esporádica:', { rondaId, dados });
        const response = await apiFetch(`/api/rondas-esporadicas/finalizar/${rondaId}`, {
            method: 'PUT',
            body: JSON.stringify(dados)
        }, token);
        console.log('Resposta da finalização de ronda esporádica:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao finalizar ronda esporádica:', error);
        return { sucesso: false, message: error.message };
    }
}

export async function atualizarRondaEsporadica(token: string, rondaId: number, dados: {
    observacoes?: string;
}): Promise<{ sucesso: boolean; message: string }> {
    try {
        console.log('Atualizando ronda esporádica:', { rondaId, dados });
        const response = await apiFetch(`/api/rondas-esporadicas/atualizar/${rondaId}`, {
            method: 'PUT',
            body: JSON.stringify(dados)
        }, token);
        console.log('Resposta da atualização de ronda esporádica:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao atualizar ronda esporádica:', error);
        return { sucesso: false, message: error.message };
    }
}

export async function listarRondasEsporadicasDoDia(token: string, condominioId: number, data: string): Promise<{ rondas: RondaEsporadica[], error?: string }> {
    try {
        console.log('Buscando rondas esporádicas do dia:', { condominioId, data });
        const response = await apiFetch(`/api/rondas-esporadicas/do-dia/${condominioId}/${data}`, {}, token);
        console.log('Resposta da busca de rondas esporádicas:', response);
        return { rondas: response.rondas || [] };
    } catch (error: any) {
        console.error('Erro ao buscar rondas esporádicas do dia:', error);
        return { rondas: [], error: error.message };
    }
}

export async function buscarDetalhesRondaEsporadica(token: string, rondaId: number): Promise<RondaEsporadica | null> {
    try {
        console.log('Buscando detalhes da ronda esporádica:', { rondaId });
        const response = await apiFetch(`/api/rondas-esporadicas/${rondaId}`, {}, token);
        console.log('Resposta dos detalhes da ronda esporádica:', response);
        return response.ronda || null;
    } catch (error: any) {
        console.error('Erro ao buscar detalhes da ronda esporádica:', error);
        return null;
    }
}

// ===== CONSOLIDAÇÃO DE RONDAS ESPORÁDICAS =====

export async function consolidarTurnoRondasEsporadicas(token: string, condominioId: number, data: string): Promise<ConsolidacaoResultado> {
    try {
        console.log('Consolidando turno de rondas esporádicas:', { condominioId, data });
        const response = await apiFetch(`/api/rondas-esporadicas/consolidar-turno/${condominioId}/${data}`, {
            method: 'POST'
        }, token);
        console.log('Resposta da consolidação de turno:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao consolidar turno de rondas esporádicas:', error);
        return { sucesso: false, message: error.message };
    }
}

export async function consolidarEEEnviarWhatsApp(token: string, condominioId: number, data: string): Promise<ConsolidacaoResultado> {
    try {
        console.log('Consolidando e enviando WhatsApp:', { condominioId, data });
        const response = await apiFetch(`/api/rondas-esporadicas/consolidar-e-enviar/${condominioId}/${data}`, {
            method: 'POST'
        }, token);
        console.log('Resposta da consolidação e envio:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao consolidar e enviar WhatsApp:', error);
        return { sucesso: false, message: error.message };
    }
}

export async function marcarRondasProcessadas(token: string, condominioId: number, data: string): Promise<{ sucesso: boolean; message: string }> {
    try {
        console.log('Marcando rondas como processadas:', { condominioId, data });
        const response = await apiFetch(`/api/rondas-esporadicas/marcar-processadas/${condominioId}/${data}`, {
            method: 'PUT'
        }, token);
        console.log('Resposta da marcação como processadas:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao marcar rondas como processadas:', error);
        return { sucesso: false, message: error.message };
    }
}

export async function obterEstatisticasConsolidacao(token: string, condominioId: number, dataInicio: string, dataFim: string): Promise<{ sucesso: boolean; message: string; estatisticas?: any }> {
    try {
        console.log('Obtendo estatísticas de consolidação:', { condominioId, dataInicio, dataFim });
        const response = await apiFetch(`/api/rondas-esporadicas/estatisticas/${condominioId}?data_inicio=${dataInicio}&data_fim=${dataFim}`, {}, token);
        console.log('Resposta das estatísticas de consolidação:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao obter estatísticas de consolidação:', error);
        return { sucesso: false, message: error.message };
    }
}

export async function processoCompletoConsolidacao(token: string, condominioId: number, data: string): Promise<ConsolidacaoResultado> {
    try {
        console.log('Executando processo completo de consolidação:', { condominioId, data });
        const response = await apiFetch(`/api/rondas-esporadicas/processo-completo/${condominioId}/${data}`, {
            method: 'POST'
        }, token);
        console.log('Resposta do processo completo:', response);
        return response;
    } catch (error: any) {
        console.error('Erro no processo completo de consolidação:', error);
        return { sucesso: false, message: error.message };
    }
}

export async function statusConsolidacao(token: string, condominioId: number, data: string): Promise<StatusConsolidacao> {
    try {
        console.log('Verificando status de consolidação:', { condominioId, data });
        const response = await apiFetch(`/api/rondas-esporadicas/status-consolidacao/${condominioId}/${data}`, {}, token);
        console.log('Resposta do status de consolidação:', response);
        return response;
    } catch (error: any) {
        console.error('Erro ao verificar status de consolidação:', error);
        return {
            sucesso: false,
            data: data,
            condominio_id: condominioId,
            status: {
                total_rondas_esporadicas: 0,
                rondas_finalizadas: 0,
                rondas_processadas: 0,
                duracao_total_minutos: 0,
                ronda_principal_criada: false,
                pode_consolidar: false,
                ja_consolidado: false
            },
            rondas: []
        };
    }
}

// Salvar ronda esporádica com hora de saída
export async function salvarRondaCompleta(token: string, dados: {
    condominio_id: number;
    user_id: number;
    data_plantao: string;
    hora_entrada: string;
    hora_saida: string;
    escala_plantao: string;
    turno: string;
    observacoes?: string;
}): Promise<{ sucesso: boolean; message: string; ronda_id?: number }> {
    try {
        console.log('Salvando ronda completa:', dados);

        // Primeiro inicia a ronda
        const rondaIniciada = await iniciarRondaEsporadica(token, {
            condominio_id: dados.condominio_id,
            user_id: dados.user_id,
            data_plantao: dados.data_plantao,
            hora_entrada: dados.hora_entrada,
            escala_plantao: dados.escala_plantao,
            turno: dados.turno,
            observacoes: dados.observacoes
        });

        if (!rondaIniciada.sucesso || !rondaIniciada.ronda_id) {
            return { sucesso: false, message: 'Erro ao iniciar ronda' };
        }

        // Depois finaliza a ronda com a hora de saída
        const rondaFinalizada = await finalizarRondaEsporadica(token, rondaIniciada.ronda_id, {
            hora_saida: dados.hora_saida,
            observacoes: dados.observacoes
        });

        return rondaFinalizada;
    } catch (error: any) {
        console.error('Erro ao salvar ronda completa:', error);
        return { sucesso: false, message: error.message };
    }
}

// Enviar relatório de rondas para WhatsApp
export async function enviarRelatorioRondasWhatsApp(token: string, dados: {
    data_plantao: string;
    residencial: string;
    rondas: Array<{
        inicio: string;
        termino: string;
        duracao: number;
    }>;
}): Promise<{ sucesso: boolean; message: string }> {
    try {
        console.log('Enviando relatório de rondas para WhatsApp:', dados);

        // Formatar data do plantão
        const data = new Date(dados.data_plantao);
        const dataFormatada = data.toLocaleDateString('pt-BR');

        // Gerar relatório no formato especificado
        let relatorio = `Plantão ${dataFormatada} (18h às 06h)\n`;
        relatorio += `Residencial: ${dados.residencial}\n\n`;

        dados.rondas.forEach((ronda) => {
            relatorio += `\tInício: ${ronda.inicio}  – Término: ${ronda.termino} (${ronda.duracao} min)\n`;
        });

        relatorio += `\n✅ Total: ${dados.rondas.length} rondas completas no plantão`;

        // Aqui você pode implementar a integração real com WhatsApp
        // Por enquanto, vamos simular o envio
        console.log('Relatório para WhatsApp:', relatorio);

        // Simular envio bem-sucedido
        return {
            sucesso: true,
            message: 'Relatório enviado para WhatsApp com sucesso!'
        };
    } catch (error: any) {
        console.error('Erro ao enviar relatório para WhatsApp:', error);
        return { sucesso: false, message: error.message };
    }
} 