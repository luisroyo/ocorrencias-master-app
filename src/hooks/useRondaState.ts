import { useState, useEffect } from 'react';
import {
    verificarRondaEmAndamento,
    verificarRondaEsporadicaEmAndamento,
    RondaEmAndamento
} from '../services/rondas';

export const useRondaState = (token: string) => {
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
    const [supervisorId, setSupervisorId] = useState<number>(1);
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

    // Verificar ronda atual
    useEffect(() => {
        if (dataPlantao) {
            verificarRondaAtual();
        }
    }, [dataPlantao, tipoRonda]);

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
        supervisorId, setSupervisorId,
        rondaEsporadicaEmAndamento, setRondaEsporadicaEmAndamento,
        dataInicioConsolidacao, setDataInicioConsolidacao,
        dataFimConsolidacao, setDataFimConsolidacao,
        loading, setLoading,
        rondaAtiva,
        // Funções
        verificarRondaAtual
    };
}; 