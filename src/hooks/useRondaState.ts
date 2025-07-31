import { useState, useEffect } from 'react';
import {
    verificarRondaEmAndamento,
    verificarRondaEsporadicaEmAndamento,
    listarCondominios,
    listarColaboradores,
    RondaEmAndamento,
    Condominio,
    Colaborador
} from '../services/rondas';

export const useRondaState = (token: string) => {
    // Estados para Condomínios
    const [condominios, setCondominios] = useState<Condominio[]>([]);
    const [condominiosLoading, setCondominiosLoading] = useState(false);
    const [condominioNome, setCondominioNome] = useState<string>('');

    // Estados para Colaboradores
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [colaboradoresLoading, setColaboradoresLoading] = useState(false);

    // Estados para Rondas Regulares
    const [condominioId, setCondominioId] = useState<number>(1);
    const [dataPlantao, setDataPlantao] = useState<string>('');
    const [escalaPlantao, setEscalaPlantao] = useState<string>('');
    const [logBruto, setLogBruto] = useState<string>('');
    const [observacoes, setObservacoes] = useState<string>('');
    const [rondaEmAndamento, setRondaEmAndamento] = useState<RondaEmAndamento | null>(null);

    // Estados para Rondas Esporádicas
    const [tipoRonda, setTipoRonda] = useState<'regular' | 'esporadica'>('regular');
    const [horaEntrada, setHoraEntrada] = useState<string>('');
    const [horaSaida, setHoraSaida] = useState<string>('');
    const [turno, setTurno] = useState<string>('');
    const [userId, setUserId] = useState<number>(1);
    const [colaboradorNome, setColaboradorNome] = useState<string>('');
    const [rondaEsporadicaEmAndamento, setRondaEsporadicaEmAndamento] = useState<RondaEmAndamento | null>(null);

    // Estados para Consolidação
    const [dataInicioConsolidacao, setDataInicioConsolidacao] = useState<string>('');
    const [dataFimConsolidacao, setDataFimConsolidacao] = useState<string>('');

    // Estados de UI
    const [loading, setLoading] = useState(false);

    // Inicializar datas
    useEffect(() => {
        const hoje = new Date();
        const dataFormatada = hoje.toISOString().split('T')[0];
        setDataPlantao(dataFormatada);
        setDataInicioConsolidacao(dataFormatada);
        setDataFimConsolidacao(dataFormatada);
    }, []);

    // Carregar condomínios na inicialização
    useEffect(() => {
        carregarCondominios();
        carregarColaboradores();
    }, []);

    // Verificar ronda atual
    useEffect(() => {
        if (dataPlantao) {
            verificarRondaAtual();
        }
    }, [dataPlantao, tipoRonda]);

    const carregarCondominios = async () => {
        try {
            setCondominiosLoading(true);
            const resultado = await listarCondominios(token);
            if (resultado.sucesso) {
                setCondominios(resultado.condominios);
                // Se não há condomínios selecionados, selecionar o primeiro
                if (resultado.condominios.length > 0 && condominioId === 1) {
                    setCondominioId(resultado.condominios[0].id);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar condomínios:', error);
        } finally {
            setCondominiosLoading(false);
        }
    };

    const carregarColaboradores = async () => {
        try {
            setColaboradoresLoading(true);
            const resultado = await listarColaboradores(token);
            if (resultado.sucesso) {
                setColaboradores(resultado.colaboradores);
                // Se não há colaboradores selecionados, selecionar o primeiro
                if (resultado.colaboradores.length > 0 && userId === 1) {
                    setUserId(resultado.colaboradores[0].id);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar colaboradores:', error);
        } finally {
            setColaboradoresLoading(false);
        }
    };

    const verificarRondaAtual = async () => {
        try {
            setLoading(true);
            let resultado;

            if (tipoRonda === 'regular') {
                resultado = await verificarRondaEmAndamento(token, condominioId);
                setRondaEmAndamento(resultado);
            } else {
                resultado = await verificarRondaEsporadicaEmAndamento(token, condominioId, dataPlantao);
                setRondaEsporadicaEmAndamento(resultado);
            }
        } catch (error) {
            console.error('Erro ao verificar ronda:', error);
        } finally {
            setLoading(false);
        }
    };

    const rondaAtiva = tipoRonda === 'regular' ? rondaEmAndamento : rondaEsporadicaEmAndamento;

    return {
        // Estados de Condomínios
        condominios,
        setCondominios,
        condominiosLoading,
        setCondominiosLoading,
        condominioNome,
        setCondominioNome,
        carregarCondominios,
        // Estados de Colaboradores
        colaboradores,
        setColaboradores,
        colaboradoresLoading,
        setColaboradoresLoading,
        carregarColaboradores,
        // Estados
        condominioId, setCondominioId,
        dataPlantao, setDataPlantao,
        escalaPlantao, setEscalaPlantao,
        logBruto, setLogBruto,
        observacoes, setObservacoes,
        rondaEmAndamento, setRondaEmAndamento,
        tipoRonda, setTipoRonda,
        horaEntrada, setHoraEntrada,
        horaSaida, setHoraSaida,
        turno, setTurno,
        userId, setUserId,
        colaboradorNome, setColaboradorNome,
        rondaEsporadicaEmAndamento, setRondaEsporadicaEmAndamento,
        dataInicioConsolidacao, setDataInicioConsolidacao,
        dataFimConsolidacao, setDataFimConsolidacao,
        loading, setLoading,
        rondaAtiva,
        // Funções
        verificarRondaAtual
    };
}; 