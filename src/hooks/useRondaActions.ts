import {
    listarCondominios,
    buscarCondominios,
    validarHorarioEntrada,
    iniciarRonda,
    finalizarRonda,
    atualizarRonda,
    gerarRelatorioRonda,
    enviarRondaWhatsApp,
    iniciarRondaEsporadica,
    finalizarRondaEsporadica,
    atualizarRondaEsporadica,
    verificarRondaEsporadicaEmAndamento,
    listarRondasEsporadicasDoDia,
    consolidarTurnoRondasEsporadicas,
    processoCompletoConsolidacao,
    marcarRondasProcessadas,
    statusConsolidacao,
    ValidacaoHorario,
    ConsolidacaoResultado,
    StatusConsolidacao,
    ListaCondominios,
    Condominio
} from '../services/rondas';

export const useRondaActions = (token: string, setLoading: (loading: boolean) => void) => {
    const handleListarCondominios = async (): Promise<ListaCondominios> => {
        try {
            setLoading(true);
            const resultado = await listarCondominios(token);
            return resultado;
        } catch (error) {
            console.error('Erro ao listar condomínios:', error);
            return { sucesso: false, condominios: [], total: 0 };
        } finally {
            setLoading(false);
        }
    };

    const handleBuscarCondominios = async (nome: string): Promise<{ condominios: Condominio[], error?: string }> => {
        try {
            setLoading(true);
            const resultado = await buscarCondominios(nome, token);
            return resultado;
        } catch (error) {
            console.error('Erro ao buscar condomínios:', error);
            return { condominios: [], error: 'Erro ao buscar condomínios' };
        } finally {
            setLoading(false);
        }
    };

    const handleValidarHorario = async (horaEntrada: string) => {
        if (!horaEntrada) {
            alert('Por favor, informe a hora de entrada.');
            return null;
        }

        try {
            setLoading(true);
            const resultado = await validarHorarioEntrada(token, horaEntrada);

            if (!resultado.horario_valido) {
                alert(resultado.mensagem);
            } else {
                alert('Horário válido!');
            }

            return resultado;
        } catch (error) {
            console.error('Erro ao validar horário:', error);
            alert('Erro ao validar horário.');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleIniciarRonda = async (
        tipoRonda: 'regular' | 'esporadica',
        dados: {
            condominioId: number;
            dataPlantao: string;
            escalaPlantao: string;
            horaEntrada?: string;
            turno?: string;
            userId?: number;
            observacoes?: string;
        }
    ) => {
        if (!dados.dataPlantao || !dados.escalaPlantao) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return false;
        }

        try {
            setLoading(true);
            let resultado;

            if (tipoRonda === 'regular') {
                resultado = await iniciarRonda(token, {
                    condominio_id: dados.condominioId,
                    data_plantao: dados.dataPlantao,
                    escala_plantao: dados.escalaPlantao,
                    user_id: dados.userId
                });
            } else {
                if (!dados.horaEntrada || !dados.turno) {
                    alert('Para rondas esporádicas, hora de entrada e turno são obrigatórios.');
                    return false;
                }
                resultado = await iniciarRondaEsporadica(token, {
                    condominio_id: dados.condominioId,
                    user_id: dados.userId || 1,
                    data_plantao: dados.dataPlantao,
                    hora_entrada: dados.horaEntrada,
                    escala_plantao: dados.escalaPlantao,
                    turno: dados.turno,
                    observacoes: dados.observacoes
                });
            }

            if (resultado.sucesso) {
                alert('Ronda iniciada com sucesso!');
                return true;
            } else {
                alert(resultado.message);
                return false;
            }
        } catch (error) {
            console.error('Erro ao iniciar ronda:', error);
            alert('Erro ao iniciar ronda.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleFinalizarRonda = async (
        tipoRonda: 'regular' | 'esporadica',
        rondaId: number,
        dados: {
            logBruto?: string;
            horaSaida?: string;
            observacoes?: string;
        }
    ) => {
        try {
            setLoading(true);
            let resultado;

            if (tipoRonda === 'regular') {
                resultado = await finalizarRonda(token, rondaId, {
                    log_bruto: dados.logBruto,
                    observacoes: dados.observacoes
                });
            } else {
                if (!dados.horaSaida) {
                    alert('Para rondas esporádicas, hora de saída é obrigatória.');
                    return false;
                }
                resultado = await finalizarRondaEsporadica(token, rondaId, {
                    hora_saida: dados.horaSaida,
                    observacoes: dados.observacoes
                });
            }

            if (resultado.sucesso) {
                alert('Ronda finalizada com sucesso!');
                return true;
            } else {
                alert(resultado.message);
                return false;
            }
        } catch (error) {
            console.error('Erro ao finalizar ronda:', error);
            alert('Erro ao finalizar ronda.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleGerarRelatorio = async (condominioId: number, dataPlantao: string) => {
        if (!dataPlantao) {
            alert('Por favor, informe a data do plantão.');
            return false;
        }

        try {
            setLoading(true);
            const resultado = await gerarRelatorioRonda(token, condominioId, dataPlantao);

            if (resultado.sucesso && resultado.relatorio) {
                navigator.clipboard.writeText(resultado.relatorio);
                alert('Relatório copiado para a área de transferência!');
                return true;
            } else {
                alert(resultado.message);
                return false;
            }
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            alert('Erro ao gerar relatório.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleEnviarWhatsApp = async (condominioId: number, dataPlantao: string) => {
        if (!dataPlantao) {
            alert('Por favor, informe a data do plantão.');
            return false;
        }

        try {
            setLoading(true);
            const resultado = await enviarRondaWhatsApp(token, condominioId, dataPlantao);

            if (resultado.sucesso) {
                alert('Relatório enviado via WhatsApp!');
                return true;
            } else {
                alert(resultado.message);
                return false;
            }
        } catch (error) {
            console.error('Erro ao enviar WhatsApp:', error);
            alert('Erro ao enviar WhatsApp.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleConsolidarTurno = async (condominioId: number, dataPlantao: string) => {
        if (!dataPlantao) {
            alert('Por favor, informe a data.');
            return null;
        }

        try {
            setLoading(true);
            const resultado = await consolidarTurnoRondasEsporadicas(token, condominioId, dataPlantao);

            if (resultado.sucesso) {
                alert('Turno consolidado com sucesso!');
            } else {
                alert(resultado.message);
            }

            return resultado;
        } catch (error) {
            console.error('Erro ao consolidar turno:', error);
            alert('Erro ao consolidar turno.');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleProcessoCompleto = async (condominioId: number, dataPlantao: string) => {
        if (!dataPlantao) {
            alert('Por favor, informe a data.');
            return null;
        }

        try {
            setLoading(true);
            const resultado = await processoCompletoConsolidacao(token, condominioId, dataPlantao);

            if (resultado.sucesso) {
                alert('Processo completo executado com sucesso!');
            } else {
                alert(resultado.message);
            }

            return resultado;
        } catch (error) {
            console.error('Erro no processo completo:', error);
            alert('Erro no processo completo.');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handleMarcarProcessadas = async (condominioId: number, dataPlantao: string) => {
        if (!dataPlantao) {
            alert('Por favor, informe a data.');
            return false;
        }

        try {
            setLoading(true);
            const resultado = await marcarRondasProcessadas(token, condominioId, dataPlantao);

            if (resultado.sucesso) {
                alert('Rondas marcadas como processadas!');
                return true;
            } else {
                alert(resultado.message);
                return false;
            }
        } catch (error) {
            console.error('Erro ao marcar processadas:', error);
            alert('Erro ao marcar processadas.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleStatusConsolidacao = async (condominioId: number, dataPlantao: string): Promise<StatusConsolidacao> => {
        if (!dataPlantao) {
            alert('Por favor, informe a data.');
            return {
                sucesso: false,
                data: dataPlantao,
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

        try {
            setLoading(true);
            const resultado = await statusConsolidacao(token, condominioId, dataPlantao);
            return resultado;
        } catch (error) {
            console.error('Erro ao verificar status de consolidação:', error);
            alert('Erro ao verificar status de consolidação.');
            return {
                sucesso: false,
                data: dataPlantao,
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
        } finally {
            setLoading(false);
        }
    };

    return {
        handleListarCondominios,
        handleBuscarCondominios,
        handleValidarHorario,
        handleIniciarRonda,
        handleFinalizarRonda,
        handleGerarRelatorio,
        handleEnviarWhatsApp,
        handleConsolidarTurno,
        handleProcessoCompleto,
        handleMarcarProcessadas,
        handleStatusConsolidacao
    };
}; 