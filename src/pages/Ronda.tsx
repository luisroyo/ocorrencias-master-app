import React, { useState, useEffect } from 'react';
import { BaseScreen } from '../components/BaseScreen';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors } from '../theme/colors';
import {
    verificarRondaEmAndamento,
    iniciarRonda,
    finalizarRonda,
    atualizarRonda,
    gerarRelatorioRonda,
    enviarRondaWhatsApp,
    // Rondas Esporádicas
    validarHorarioEntrada,
    verificarRondaEsporadicaEmAndamento,
    iniciarRondaEsporadica,
    finalizarRondaEsporadica,
    atualizarRondaEsporadica,
    listarRondasEsporadicasDoDia,
    // Consolidação
    consolidarTurnoRondasEsporadicas,
    consolidarEEEnviarWhatsApp,
    marcarRondasProcessadas,
    processoCompletoConsolidacao,
    statusConsolidacao,
    RondaEmAndamento,
    ValidacaoHorario,
    ConsolidacaoResultado
} from '../services/rondas';

interface RondaScreenProps {
    token?: string;
}

export const RondaScreen: React.FC<RondaScreenProps> = ({ token = 'mock-token' }) => {
    // Estados para Rondas Regulares
    const [condominioId, setCondominioId] = useState<number>(1);
    const [dataPlantao, setDataPlantao] = useState<string>('');
    const [escalaPlantao, setEscalaPlantao] = useState<string>('');
    const [logBruto, setLogBruto] = useState<string>('');
    const [observacoes, setObservacoes] = useState<string>('');
    const [rondaEmAndamento, setRondaEmAndamento] = useState<RondaEmAndamento | null>(null);
    const [loading, setLoading] = useState(false);

    // Estados para Rondas Esporádicas
    const [tipoRonda, setTipoRonda] = useState<'regular' | 'esporadica'>('regular');
    const [horaEntrada, setHoraEntrada] = useState<string>('');
    const [horaSaida, setHoraSaida] = useState<string>('');
    const [turno, setTurno] = useState<string>('');
    const [userId, setUserId] = useState<number>(1);
    const [supervisorId, setSupervisorId] = useState<number>(1);
    const [validacaoHorario, setValidacaoHorario] = useState<ValidacaoHorario | null>(null);
    const [rondaEsporadicaEmAndamento, setRondaEsporadicaEmAndamento] = useState<RondaEmAndamento | null>(null);

    // Estados para Consolidação
    const [dataInicioConsolidacao, setDataInicioConsolidacao] = useState<string>('');
    const [dataFimConsolidacao, setDataFimConsolidacao] = useState<string>('');
    const [resultadoConsolidacao, setResultadoConsolidacao] = useState<ConsolidacaoResultado | null>(null);

    // Inicializar data atual
    useEffect(() => {
        const hoje = new Date().toISOString().split('T')[0];
        setDataPlantao(hoje);
        setDataInicioConsolidacao(hoje);
        setDataFimConsolidacao(hoje);
    }, []);

    // Verificar ronda em andamento ao carregar
    useEffect(() => {
        if (dataPlantao) {
            verificarRondaAtual();
        }
    }, [dataPlantao, tipoRonda]);

    const verificarRondaAtual = async () => {
        setLoading(true);
        try {
            if (tipoRonda === 'regular') {
                const resultado = await verificarRondaEmAndamento(token, condominioId);
                setRondaEmAndamento(resultado);
                setRondaEsporadicaEmAndamento(null);
            } else {
                const resultado = await verificarRondaEsporadicaEmAndamento(token, condominioId, dataPlantao);
                setRondaEsporadicaEmAndamento(resultado);
                setRondaEmAndamento(null);
            }
        } catch (error) {
            console.error('Erro ao verificar ronda:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleValidarHorario = async () => {
        if (!horaEntrada) {
            alert('Por favor, informe o horário de entrada.');
            return;
        }

        setLoading(true);
        try {
            const resultado = await validarHorarioEntrada(token, horaEntrada);
            setValidacaoHorario(resultado);
            
            if (!resultado.horario_valido) {
                alert(resultado.mensagem);
            }
        } catch (error) {
            console.error('Erro ao validar horário:', error);
            alert('Erro ao validar horário.');
        } finally {
            setLoading(false);
        }
    };

    const handleIniciarRonda = async () => {
        if (!dataPlantao) {
            alert('Por favor, informe a data do plantão.');
            return;
        }

        setLoading(true);
        try {
            let resultado;
            
            if (tipoRonda === 'regular') {
                resultado = await iniciarRonda(token, {
                    condominio_id: condominioId,
                    data_plantao: dataPlantao,
                    escala_plantao: escalaPlantao,
                    supervisor_id: supervisorId
                });
            } else {
                if (!horaEntrada || !turno) {
                    alert('Por favor, preencha todos os campos obrigatórios.');
                    return;
                }

                resultado = await iniciarRondaEsporadica(token, {
                    condominio_id: condominioId,
                    user_id: userId,
                    data_plantao: dataPlantao,
                    hora_entrada: horaEntrada,
                    escala_plantao: escalaPlantao,
                    turno: turno,
                    supervisor_id: supervisorId,
                    observacoes: observacoes
                });
            }

            if (resultado.sucesso) {
                alert(resultado.message);
                await verificarRondaAtual();
            } else {
                alert(resultado.message);
            }
        } catch (error) {
            console.error('Erro ao iniciar ronda:', error);
            alert('Erro ao iniciar ronda.');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalizarRonda = async () => {
        const rondaAtiva = tipoRonda === 'regular' ? rondaEmAndamento?.ronda : rondaEsporadicaEmAndamento?.ronda;
        
        if (!rondaAtiva) {
            alert('Nenhuma ronda em andamento encontrada.');
            return;
        }

        setLoading(true);
        try {
            let resultado;
            
            if (tipoRonda === 'regular') {
                resultado = await finalizarRonda(token, rondaAtiva.id, {
                    log_bruto: logBruto,
                    observacoes: observacoes
                });
            } else {
                if (!horaSaida) {
                    alert('Por favor, informe o horário de saída.');
                    return;
                }

                resultado = await finalizarRondaEsporadica(token, rondaAtiva.id, {
                    hora_saida: horaSaida,
                    observacoes: observacoes
                });
            }

            if (resultado.sucesso) {
                alert(resultado.message);
                await verificarRondaAtual();
                // Limpar campos
                setLogBruto('');
                setObservacoes('');
                setHoraSaida('');
            } else {
                alert(resultado.message);
            }
        } catch (error) {
            console.error('Erro ao finalizar ronda:', error);
            alert('Erro ao finalizar ronda.');
        } finally {
            setLoading(false);
        }
    };

    const handleGerarRelatorio = async () => {
        if (!dataPlantao) {
            alert('Por favor, informe a data do plantão.');
            return;
        }

        setLoading(true);
        try {
            const resultado = await gerarRelatorioRonda(token, condominioId, dataPlantao);
            
            if (resultado.sucesso && resultado.relatorio) {
                navigator.clipboard.writeText(resultado.relatorio);
                alert('Relatório copiado para a área de transferência!');
            } else {
                alert(resultado.message);
            }
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            alert('Erro ao gerar relatório.');
        } finally {
            setLoading(false);
        }
    };

    const handleEnviarWhatsApp = async () => {
        if (!dataPlantao) {
            alert('Por favor, informe a data do plantão.');
            return;
        }

        setLoading(true);
        try {
            const resultado = await enviarRondaWhatsApp(token, condominioId, dataPlantao);
            
            if (resultado.sucesso) {
                alert('Relatório enviado via WhatsApp!');
            } else {
                alert(resultado.message);
            }
        } catch (error) {
            console.error('Erro ao enviar WhatsApp:', error);
            alert('Erro ao enviar WhatsApp.');
        } finally {
            setLoading(false);
        }
    };

    // Funções de Consolidação
    const handleConsolidarTurno = async () => {
        if (!dataPlantao) {
            alert('Por favor, informe a data do plantão.');
            return;
        }

        setLoading(true);
        try {
            const resultado = await consolidarTurnoRondasEsporadicas(token, condominioId, dataPlantao);
            setResultadoConsolidacao(resultado);
            
            if (resultado.sucesso) {
                alert('Turno consolidado com sucesso!');
            } else {
                alert(resultado.message);
            }
        } catch (error) {
            console.error('Erro ao consolidar turno:', error);
            alert('Erro ao consolidar turno.');
        } finally {
            setLoading(false);
        }
    };

    const handleProcessoCompleto = async () => {
        if (!dataPlantao) {
            alert('Por favor, informe a data do plantão.');
            return;
        }

        setLoading(true);
        try {
            const resultado = await processoCompletoConsolidacao(token, condominioId, dataPlantao);
            setResultadoConsolidacao(resultado);
            
            if (resultado.sucesso) {
                alert('Processo completo executado com sucesso!');
            } else {
                alert(resultado.message);
            }
        } catch (error) {
            console.error('Erro no processo completo:', error);
            alert('Erro no processo completo.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarcarProcessadas = async () => {
        if (!dataPlantao) {
            alert('Por favor, informe a data do plantão.');
            return;
        }

        setLoading(true);
        try {
            const resultado = await marcarRondasProcessadas(token, condominioId, dataPlantao);
            
            if (resultado.sucesso) {
                alert('Rondas marcadas como processadas!');
            } else {
                alert(resultado.message);
            }
        } catch (error) {
            console.error('Erro ao marcar como processadas:', error);
            alert('Erro ao marcar como processadas.');
        } finally {
            setLoading(false);
        }
    };

    const rondaAtiva = tipoRonda === 'regular' ? rondaEmAndamento : rondaEsporadicaEmAndamento;

    return (
        <BaseScreen title="Controle de Rondas" subtitle="Gerencie rondas regulares e esporádicas">
            <div style={{ padding: '20px' }}>
                {/* Seletor de Tipo de Ronda */}
                <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                    border: '1px solid #e9ecef'
                }}>
                    <h3 style={{ marginBottom: '16px', color: colors.headingText }}>
                        🎯 Tipo de Ronda
                    </h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button
                            title="🔄 Ronda Regular"
                            onClick={() => setTipoRonda('regular')}
                            variant={tipoRonda === 'regular' ? 'primary' : 'secondary'}
                            style={{ flex: 1 }}
                        />
                        <Button
                            title="⏰ Ronda Esporádica"
                            onClick={() => setTipoRonda('esporadica')}
                            variant={tipoRonda === 'esporadica' ? 'primary' : 'secondary'}
                            style={{ flex: 1 }}
                        />
                    </div>
                </div>

                {/* Configurações Básicas */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginBottom: '16px', color: colors.headingText }}>
                        ⚙️ Configurações
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                                Condomínio ID
                            </label>
                            <Input
                                type="number"
                                value={condominioId}
                                onChange={(e) => setCondominioId(parseInt(e.target.value) || 1)}
                                style={{
                                    backgroundColor: '#fff',
                                    color: colors.headingText,
                                    fontSize: '16px',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    border: '1px solid #dee2e6',
                                    width: '100%'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                                Data do Plantão
                            </label>
                            <Input
                                type="date"
                                value={dataPlantao}
                                onChange={(e) => setDataPlantao(e.target.value)}
                                style={{
                                    backgroundColor: '#fff',
                                    color: colors.headingText,
                                    fontSize: '16px',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    border: '1px solid #dee2e6',
                                    width: '100%'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                                Escala do Plantão
                            </label>
                            <Input
                                value={escalaPlantao}
                                onChange={(e) => setEscalaPlantao(e.target.value)}
                                placeholder="Ex: 06h às 18h"
                                style={{
                                    backgroundColor: '#fff',
                                    color: colors.headingText,
                                    fontSize: '16px',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    border: '1px solid #dee2e6',
                                    width: '100%'
                                }}
                            />
                        </div>

                        {tipoRonda === 'esporadica' && (
                            <>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                                        Hora de Entrada
                                    </label>
                                    <Input
                                        type="time"
                                        value={horaEntrada}
                                        onChange={(e) => setHoraEntrada(e.target.value)}
                                        style={{
                                            backgroundColor: '#fff',
                                            color: colors.headingText,
                                            fontSize: '16px',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            border: '1px solid #dee2e6',
                                            width: '100%'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                                        Turno
                                    </label>
                                    <select
                                        value={turno}
                                        onChange={(e) => setTurno(e.target.value)}
                                        style={{
                                            backgroundColor: '#fff',
                                            color: colors.headingText,
                                            fontSize: '16px',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            border: '1px solid #dee2e6',
                                            width: '100%'
                                        }}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Diurno">Diurno</option>
                                        <option value="Noturno">Noturno</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                                        User ID
                                    </label>
                                    <Input
                                        type="number"
                                        value={userId}
                                        onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
                                        style={{
                                            backgroundColor: '#fff',
                                            color: colors.headingText,
                                            fontSize: '16px',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            border: '1px solid #dee2e6',
                                            width: '100%'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                                        Supervisor ID
                                    </label>
                                    <Input
                                        type="number"
                                        value={supervisorId}
                                        onChange={(e) => setSupervisorId(parseInt(e.target.value) || 1)}
                                        style={{
                                            backgroundColor: '#fff',
                                            color: colors.headingText,
                                            fontSize: '16px',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            border: '1px solid #dee2e6',
                                            width: '100%'
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {tipoRonda === 'esporadica' && (
                        <div style={{ marginTop: '16px' }}>
                            <Button
                                title="✅ Validar Horário"
                                onClick={handleValidarHorario}
                                disabled={loading || !horaEntrada}
                                variant="success"
                                style={{ marginRight: '12px' }}
                            />
                            {validacaoHorario && (
                                <span style={{
                                    backgroundColor: validacaoHorario.horario_valido ? colors.success : colors.danger,
                                    color: '#fff',
                                    padding: '4px 12px',
                                    borderRadius: '16px',
                                    fontSize: '12px',
                                    marginLeft: '12px'
                                }}>
                                    {validacaoHorario.mensagem}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Status da Ronda */}
                {rondaAtiva && (
                    <div style={{
                        backgroundColor: rondaAtiva.em_andamento ? '#d4edda' : '#f8d7da',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '20px',
                        border: `1px solid ${rondaAtiva.em_andamento ? '#c3e6cb' : '#f5c6cb'}`
                    }}>
                        <h3 style={{ marginBottom: '16px', color: colors.headingText }}>
                            {rondaAtiva.em_andamento ? '🟢 Ronda em Andamento' : '🔴 Nenhuma Ronda Ativa'}
                        </h3>
                        
                        {rondaAtiva.em_andamento && rondaAtiva.ronda && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', color: colors.headingText, fontWeight: 'bold' }}>
                                        ID da Ronda:
                                    </p>
                                    <p style={{ margin: '0', color: colors.mutedText }}>
                                        {rondaAtiva.ronda.id}
                                    </p>
                                </div>
                                
                                {rondaAtiva.ronda.inicio && (
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', color: colors.headingText, fontWeight: 'bold' }}>
                                            Início:
                                        </p>
                                        <p style={{ margin: '0', color: colors.mutedText }}>
                                            {new Date(rondaAtiva.ronda.inicio).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                )}
                                
                                {rondaAtiva.ronda.hora_entrada && (
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', color: colors.headingText, fontWeight: 'bold' }}>
                                            Hora de Entrada:
                                        </p>
                                        <p style={{ margin: '0', color: colors.mutedText }}>
                                            {rondaAtiva.ronda.hora_entrada}
                                        </p>
                                    </div>
                                )}
                                
                                {rondaAtiva.ronda.escala_plantao && (
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', color: colors.headingText, fontWeight: 'bold' }}>
                                            Escala:
                                        </p>
                                        <p style={{ margin: '0', color: colors.mutedText }}>
                                            {rondaAtiva.ronda.escala_plantao}
                                        </p>
                                    </div>
                                )}
                                
                                {rondaAtiva.ronda.turno && (
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', color: colors.headingText, fontWeight: 'bold' }}>
                                            Turno:
                                        </p>
                                        <p style={{ margin: '0', color: colors.mutedText }}>
                                            {rondaAtiva.ronda.turno}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Controles de Ronda */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginBottom: '16px', color: colors.headingText }}>
                        🎮 Controles
                    </h3>
                    
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <Button
                            title="🚀 Iniciar Ronda"
                            onClick={handleIniciarRonda}
                            disabled={loading || (rondaAtiva?.em_andamento || false)}
                            style={{ minWidth: '140px' }}
                        />
                        
                        <Button
                            title="⏹️ Finalizar Ronda"
                            onClick={handleFinalizarRonda}
                            disabled={loading || !(rondaAtiva?.em_andamento || false)}
                            variant="danger"
                            style={{ minWidth: '140px' }}
                        />
                        
                        <Button
                            title="📄 Gerar Relatório"
                            onClick={handleGerarRelatorio}
                            disabled={loading}
                            variant="secondary"
                            style={{ minWidth: '140px' }}
                        />
                        
                        <Button
                            title="📱 Enviar WhatsApp"
                            onClick={handleEnviarWhatsApp}
                            disabled={loading}
                            variant="success"
                            style={{ minWidth: '140px' }}
                        />
                    </div>

                    {/* Campos para finalização */}
                    {rondaAtiva?.em_andamento && (
                        <div style={{ marginTop: '16px' }}>
                            <h4 style={{ marginBottom: '12px', color: colors.headingText }}>
                                📝 Dados para Finalização
                            </h4>
                            
                            {tipoRonda === 'regular' && (
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                                        Log Bruto
                                    </label>
                                    <textarea
                                        value={logBruto}
                                        onChange={(e) => setLogBruto(e.target.value)}
                                        placeholder="Digite o log da ronda..."
                                        style={{
                                            backgroundColor: '#fff',
                                            color: colors.headingText,
                                            fontSize: '16px',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            border: '1px solid #dee2e6',
                                            width: '100%',
                                            minHeight: '80px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            )}

                            {tipoRonda === 'esporadica' && (
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                                        Hora de Saída
                                    </label>
                                    <Input
                                        type="time"
                                        value={horaSaida}
                                        onChange={(e) => setHoraSaida(e.target.value)}
                                        style={{
                                            backgroundColor: '#fff',
                                            color: colors.headingText,
                                            fontSize: '16px',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            border: '1px solid #dee2e6',
                                            width: '100%'
                                        }}
                                    />
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                                    Observações
                                </label>
                                <textarea
                                    value={observacoes}
                                    onChange={(e) => setObservacoes(e.target.value)}
                                    placeholder="Digite observações..."
                                    style={{
                                        backgroundColor: '#fff',
                                        color: colors.headingText,
                                        fontSize: '16px',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        border: '1px solid #dee2e6',
                                        width: '100%',
                                        minHeight: '60px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Consolidação de Rondas Esporádicas */}
                {tipoRonda === 'esporadica' && (
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '20px',
                        border: '1px solid #e9ecef',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ marginBottom: '16px', color: colors.headingText }}>
                            📊 Consolidação de Rondas Esporádicas
                        </h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                                    Data Início
                                </label>
                                <Input
                                    type="date"
                                    value={dataInicioConsolidacao}
                                    onChange={(e) => setDataInicioConsolidacao(e.target.value)}
                                    style={{
                                        backgroundColor: '#fff',
                                        color: colors.headingText,
                                        fontSize: '16px',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        border: '1px solid #dee2e6',
                                        width: '100%'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                                    Data Fim
                                </label>
                                <Input
                                    type="date"
                                    value={dataFimConsolidacao}
                                    onChange={(e) => setDataFimConsolidacao(e.target.value)}
                                    style={{
                                        backgroundColor: '#fff',
                                        color: colors.headingText,
                                        fontSize: '16px',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        border: '1px solid #dee2e6',
                                        width: '100%'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <Button
                                title="📋 Consolidar Turno"
                                onClick={handleConsolidarTurno}
                                disabled={loading}
                                variant="secondary"
                                style={{ minWidth: '140px' }}
                            />
                            
                            <Button
                                title="🔄 Processo Completo"
                                onClick={handleProcessoCompleto}
                                disabled={loading}
                                variant="primary"
                                style={{ minWidth: '140px' }}
                            />
                            
                            <Button
                                title="✅ Marcar Processadas"
                                onClick={handleMarcarProcessadas}
                                disabled={loading}
                                variant="success"
                                style={{ minWidth: '140px' }}
                            />
                        </div>

                        {resultadoConsolidacao && (
                            <div style={{
                                marginTop: '16px',
                                padding: '12px',
                                backgroundColor: resultadoConsolidacao.sucesso ? '#d4edda' : '#f8d7da',
                                borderRadius: '8px',
                                border: `1px solid ${resultadoConsolidacao.sucesso ? '#c3e6cb' : '#f5c6cb'}`
                            }}>
                                <p style={{ margin: '0', color: resultadoConsolidacao.sucesso ? '#155724' : '#721c24' }}>
                                    <strong>{resultadoConsolidacao.sucesso ? '✅' : '❌'} {resultadoConsolidacao.message}</strong>
                                </p>
                                {resultadoConsolidacao.relatorio_consolidado && (
                                    <details style={{ marginTop: '8px' }}>
                                        <summary style={{ cursor: 'pointer', color: '#155724' }}>
                                            Ver Relatório Consolidado
                                        </summary>
                                        <pre style={{
                                            marginTop: '8px',
                                            padding: '8px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            whiteSpace: 'pre-wrap',
                                            maxHeight: '200px',
                                            overflowY: 'auto'
                                        }}>
                                            {resultadoConsolidacao.relatorio_consolidado}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <span>⏳ Processando...</span>
                    </div>
                )}
            </div>
        </BaseScreen>
    );
}; 