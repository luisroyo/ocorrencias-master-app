import React, { useState } from 'react';
import { BaseScreen } from '../components/BaseScreen';
import { RondaProductionMessage } from '../components/RondaProductionMessage';
import { useRondaState } from '../hooks/useRondaState';
import { useRondaActions } from '../hooks/useRondaActions';
import { isProduction } from '../utils/environment';
import { RondaTipoSelector } from '../components/ronda/RondaTipoSelector';
import { RondaConfiguracoes } from '../components/ronda/RondaConfiguracoes';
import { RondaStatus } from '../components/ronda/RondaStatus';
import { RondaControles } from '../components/ronda/RondaControles';
import { RondaConsolidacao } from '../components/ronda/RondaConsolidacao';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { colors } from '../theme/colors';

interface RondaScreenProps {
    token?: string;
}

export const RondaScreen: React.FC<RondaScreenProps> = ({ token = 'mock-token' }) => {
    // Verificar se está em produção
    if (isProduction()) {
        return <RondaProductionMessage />;
    }

    // Usar hooks personalizados
    const rondaState = useRondaState(token);
    const rondaActions = useRondaActions(token, rondaState.setLoading);

    // Estados adicionais
    const [validacaoHorario, setValidacaoHorario] = useState<any>(null);
    const [resultadoConsolidacao, setResultadoConsolidacao] = useState<any>(null);

    // Handlers específicos
    const handleValidarHorario = async () => {
        const resultado = await rondaActions.handleValidarHorario(rondaState.horaEntrada);
        setValidacaoHorario(resultado);
    };

    const handleIniciarRonda = async () => {
        const sucesso = await rondaActions.handleIniciarRonda(rondaState.tipoRonda, {
            condominioId: rondaState.condominioId,
            dataPlantao: rondaState.dataPlantao,
            escalaPlantao: rondaState.escalaPlantao,
            supervisorId: rondaState.supervisorId,
            horaEntrada: rondaState.horaEntrada,
            turno: rondaState.turno,
            userId: rondaState.userId,
            observacoes: rondaState.observacoes
        });

        if (sucesso) {
            rondaState.verificarRondaAtual();
        }
    };

    const handleFinalizarRonda = async () => {
        const rondaAtiva = rondaState.rondaAtiva?.ronda;
        if (!rondaAtiva) {
            alert('Nenhuma ronda em andamento encontrada.');
            return;
        }

        const sucesso = await rondaActions.handleFinalizarRonda(rondaState.tipoRonda, rondaAtiva.id, {
            logBruto: rondaState.logBruto,
            horaSaida: rondaState.horaSaida,
            observacoes: rondaState.observacoes
        });

        if (sucesso) {
            rondaState.verificarRondaAtual();
            // Limpar campos
            rondaState.setLogBruto('');
            rondaState.setHoraSaida('');
            rondaState.setObservacoes('');
        }
    };

    const handleGerarRelatorio = async () => {
        await rondaActions.handleGerarRelatorio(rondaState.condominioId, rondaState.dataPlantao);
    };

    const handleEnviarWhatsApp = async () => {
        await rondaActions.handleEnviarWhatsApp(rondaState.condominioId, rondaState.dataPlantao);
    };

    const handleConsolidarTurno = async () => {
        const resultado = await rondaActions.handleConsolidarTurno(rondaState.condominioId, rondaState.dataPlantao);
        setResultadoConsolidacao(resultado);
    };

    const handleProcessoCompleto = async () => {
        const resultado = await rondaActions.handleProcessoCompleto(rondaState.condominioId, rondaState.dataPlantao);
        setResultadoConsolidacao(resultado);
    };

    const handleMarcarProcessadas = async () => {
        await rondaActions.handleMarcarProcessadas(rondaState.condominioId, rondaState.dataPlantao);
    };

    return (
        <BaseScreen title="Controle de Rondas" subtitle="Gerencie rondas regulares e esporádicas">
            <div style={{ padding: '20px' }}>
                {/* Seletor de Tipo de Ronda */}
                <RondaTipoSelector
                    tipoRonda={rondaState.tipoRonda}
                    onTipoChange={rondaState.setTipoRonda}
                />

                {/* Configurações Básicas */}
                <RondaConfiguracoes
                    tipoRonda={rondaState.tipoRonda}
                    condominioId={rondaState.condominioId}
                    setCondominioId={rondaState.setCondominioId}
                    dataPlantao={rondaState.dataPlantao}
                    setDataPlantao={rondaState.setDataPlantao}
                    escalaPlantao={rondaState.escalaPlantao}
                    setEscalaPlantao={rondaState.setEscalaPlantao}
                    horaEntrada={rondaState.horaEntrada}
                    setHoraEntrada={rondaState.setHoraEntrada}
                    turno={rondaState.turno}
                    setTurno={rondaState.setTurno}
                    userId={rondaState.userId}
                    setUserId={rondaState.setUserId}
                    supervisorId={rondaState.supervisorId}
                    setSupervisorId={rondaState.setSupervisorId}
                    validacaoHorario={validacaoHorario}
                    onValidarHorario={handleValidarHorario}
                    loading={rondaState.loading}
                />

                {/* Status da Ronda */}
                {rondaState.rondaAtiva && (
                    <RondaStatus rondaAtiva={rondaState.rondaAtiva} />
                )}

                {/* Controles de Ronda */}
                <RondaControles
                    rondaAtiva={rondaState.rondaAtiva}
                    tipoRonda={rondaState.tipoRonda}
                    logBruto={rondaState.logBruto}
                    setLogBruto={rondaState.setLogBruto}
                    horaSaida={rondaState.horaSaida}
                    setHoraSaida={rondaState.setHoraSaida}
                    observacoes={rondaState.observacoes}
                    setObservacoes={rondaState.setObservacoes}
                    onIniciarRonda={handleIniciarRonda}
                    onFinalizarRonda={handleFinalizarRonda}
                    onGerarRelatorio={handleGerarRelatorio}
                    onEnviarWhatsApp={handleEnviarWhatsApp}
                    loading={rondaState.loading}
                />

                {/* Consolidação de Rondas Esporádicas */}
                {rondaState.tipoRonda === 'esporadica' && (
                    <RondaConsolidacao
                        dataInicioConsolidacao={rondaState.dataInicioConsolidacao}
                        setDataInicioConsolidacao={rondaState.setDataInicioConsolidacao}
                        dataFimConsolidacao={rondaState.dataFimConsolidacao}
                        setDataFimConsolidacao={rondaState.setDataFimConsolidacao}
                        resultadoConsolidacao={resultadoConsolidacao}
                        onConsolidarTurno={handleConsolidarTurno}
                        onProcessoCompleto={handleProcessoCompleto}
                        onMarcarProcessadas={handleMarcarProcessadas}
                        loading={rondaState.loading}
                    />
                )}

                {/* Loading Overlay */}
                {rondaState.loading && <LoadingOverlay />}
            </div>
        </BaseScreen>
    );
}; 