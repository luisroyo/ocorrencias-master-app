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

// Função para detectar se está em produção
const isProduction = () => {
    return window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1' &&
        !window.location.hostname.includes('localhost');
};

export const RondaScreen: React.FC<RondaScreenProps> = ({ token = 'mock-token' }) => {
    // Verificar se está em produção
    const isProd = isProduction();

    // Se estiver em produção, mostrar mensagem de teste
    if (isProd) {
        return (
            <BaseScreen title="Controle de Rondas" subtitle="Funcionalidade em Desenvolvimento">
                <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    <div style={{
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffeaa7',
                        borderRadius: '8px',
                        padding: '30px',
                        marginBottom: '20px'
                    }}>
                        <h2 style={{
                            color: '#856404',
                            marginBottom: '20px',
                            fontSize: '24px'
                        }}>
                            🚧 Funcionalidade em Teste
                        </h2>

                        <p style={{
                            color: '#856404',
                            fontSize: '16px',
                            lineHeight: '1.6',
                            marginBottom: '20px'
                        }}>
                            A página de <strong>Controle de Rondas</strong> ainda está em desenvolvimento e testes.
                        </p>

                        <p style={{
                            color: '#856404',
                            fontSize: '16px',
                            lineHeight: '1.6',
                            marginBottom: '30px'
                        }}>
                            Em breve teremos novidades! Esta funcionalidade incluirá:
                        </p>

                        <div style={{
                            textAlign: 'left',
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '6px',
                            border: '1px solid #e9ecef'
                        }}>
                            <ul style={{
                                color: '#495057',
                                fontSize: '14px',
                                lineHeight: '1.8',
                                margin: '0',
                                paddingLeft: '20px'
                            }}>
                                <li>🎯 <strong>Rondas Regulares:</strong> Controle de plantões diários</li>
                                <li>⏰ <strong>Rondas Esporádicas:</strong> Registro de rondas pontuais</li>
                                <li>📊 <strong>Consolidação:</strong> Relatórios consolidados por turno</li>
                                <li>📱 <strong>WhatsApp:</strong> Envio automático de relatórios</li>
                                <li>📈 <strong>Estatísticas:</strong> Análise de performance</li>
                                <li>✅ <strong>Validações:</strong> Controle de horários e permissões</li>
                            </ul>
                        </div>

                        <div style={{
                            marginTop: '30px',
                            padding: '15px',
                            backgroundColor: '#d4edda',
                            border: '1px solid #c3e6cb',
                            borderRadius: '6px'
                        }}>
                            <p style={{
                                color: '#155724',
                                fontSize: '14px',
                                margin: '0'
                            }}>
                                <strong>💡 Dica:</strong> Para testar esta funcionalidade, acesse a aplicação em ambiente de desenvolvimento (localhost).
                            </p>
                        </div>
                    </div>

                    <Button
                        title="🔙 Voltar ao Menu Principal"
                        onClick={() => window.history.back()}
                        variant="secondary"
                        style={{ marginTop: '20px' }}
                    />
                </div>
            </BaseScreen>
        );
    }

    // States for Regular Rondas
    const [condominioId, setCondominioId] = useState<number>(1);
    const [dataPlantao, setDataPlantao] = useState<string>('');
    const [escalaPlantao, setEscalaPlantao] = useState<string>('');
    const [logBruto, setLogBruto] = useState<string>('');
    const [observacoes, setObservacoes] = useState<string>('');
    const [rondaEmAndamento, setRondaEmAndamento] = useState<RondaEmAndamento | null>(null);
    const [loading, setLoading] = useState(false);

    // States for Sporadic Rondas
    const [tipoRonda, setTipoRonda] = useState<'regular' | 'esporadica'>('regular');
    const [horaEntrada, setHoraEntrada] = useState<string>('');
    const [horaSaida, setHoraSaida] = useState<string>('');
    const [turno, setTurno] = useState<string>('');
    const [userId, setUserId] = useState<number>(1);
    const [supervisorId, setSupervisorId] = useState<number>(1);
    const [validacaoHorario, setValidacaoHorario] = useState<ValidacaoHorario | null>(null);
    const [rondaEsporadicaEmAndamento, setRondaEsporadicaEmAndamento] = useState<RondaEmAndamento | null>(null);

    // States for Consolidation
    const [dataInicioConsolidacao, setDataInicioConsolidacao] = useState<string>('');
    const [dataFimConsolidacao, setDataFimConsolidacao] = useState<string>('');
    const [resultadoConsolidacao, setResultadoConsolidacao] = useState<ConsolidacaoResultado | null>(null);

    // Initialize dates
    useEffect(() => {
        const hoje = new Date();
        const dataFormatada = hoje.toISOString().split('T')[0];
        setDataPlantao(dataFormatada);
        setDataInicioConsolidacao(dataFormatada);
        setDataFimConsolidacao(dataFormatada);
    }, []);

    // Verify current ronda
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

    const handleValidarHorario = async () => {
        if (!horaEntrada) {
            alert('Por favor, informe a hora de entrada.');
            return;
        }

        try {
            setLoading(true);
            const resultado = await validarHorarioEntrada(token, horaEntrada);
            setValidacaoHorario(resultado);

            if (!resultado.horario_valido) {
                alert(resultado.mensagem);
            } else {
                alert('Horário válido!');
            }
        } catch (error) {
            console.error('Erro ao validar horário:', error);
            alert('Erro ao validar horário.');
        } finally {
            setLoading(false);
        }
    };

    const handleIniciarRonda = async () => {
        if (!dataPlantao || !escalaPlantao) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        try {
            setLoading(true);
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
                    alert('Para rondas esporádicas, hora de entrada e turno são obrigatórios.');
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
                alert('Ronda iniciada com sucesso!');
                verificarRondaAtual();
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

        try {
            setLoading(true);
            let resultado;

            if (tipoRonda === 'regular') {
                resultado = await finalizarRonda(token, rondaAtiva.id, {
                    log_bruto: logBruto,
                    observacoes: observacoes
                });
            } else {
                if (!horaSaida) {
                    alert('Para rondas esporádicas, hora de saída é obrigatória.');
                    return;
                }
                resultado = await finalizarRondaEsporadica(token, rondaAtiva.id, {
                    hora_saida: horaSaida,
                    observacoes: observacoes
                });
            }

            if (resultado.sucesso) {
                alert('Ronda finalizada com sucesso!');
                verificarRondaAtual();
                // Limpar campos
                setLogBruto('');
                setHoraSaida('');
                setObservacoes('');
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

        try {
            setLoading(true);
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

        try {
            setLoading(true);
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

    const handleConsolidarTurno = async () => {
        if (!dataPlantao) {
            alert('Por favor, informe a data.');
            return;
        }

        try {
            setLoading(true);
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
            alert('Por favor, informe a data.');
            return;
        }

        try {
            setLoading(true);
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
            alert('Por favor, informe a data.');
            return;
        }

        try {
            setLoading(true);
            const resultado = await marcarRondasProcessadas(token, condominioId, dataPlantao);

            if (resultado.sucesso) {
                alert('Rondas marcadas como processadas!');
            } else {
                alert(resultado.message);
            }
        } catch (error) {
            console.error('Erro ao marcar processadas:', error);
            alert('Erro ao marcar processadas.');
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
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{
                        color: colors.primary,
                        marginBottom: '16px',
                        fontSize: '18px',
                        fontWeight: 'bold'
                    }}>
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
                    backgroundColor: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{
                        color: colors.primary,
                        marginBottom: '16px',
                        fontSize: '18px',
                        fontWeight: 'bold'
                    }}>
                        ⚙️ Configurações
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Condomínio ID
                            </label>
                            <Input
                                type="number"
                                value={condominioId}
                                onChange={(e) => setCondominioId(Number(e.target.value))}
                                placeholder="ID do condomínio"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Data do Plantão
                            </label>
                            <Input
                                type="date"
                                value={dataPlantao}
                                onChange={(e) => setDataPlantao(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Escala do Plantão
                            </label>
                            <Input
                                type="text"
                                value={escalaPlantao}
                                onChange={(e) => setEscalaPlantao(e.target.value)}
                                placeholder="Ex: 06h às 18h"
                            />
                        </div>
                        {tipoRonda === 'esporadica' && (
                            <>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                        Hora de Entrada
                                    </label>
                                    <Input
                                        type="time"
                                        value={horaEntrada}
                                        onChange={(e) => setHoraEntrada(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                        Turno
                                    </label>
                                    <Input
                                        type="text"
                                        value={turno}
                                        onChange={(e) => setTurno(e.target.value)}
                                        placeholder="Ex: Manhã, Tarde, Noite"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                        User ID
                                    </label>
                                    <Input
                                        type="number"
                                        value={userId}
                                        onChange={(e) => setUserId(Number(e.target.value))}
                                        placeholder="ID do usuário"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                        Supervisor ID
                                    </label>
                                    <Input
                                        type="number"
                                        value={supervisorId}
                                        onChange={(e) => setSupervisorId(Number(e.target.value))}
                                        placeholder="ID do supervisor"
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
                                    color: validacaoHorario.horario_valido ? '#28a745' : '#dc3545',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
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
                        backgroundColor: '#e7f3ff',
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{
                            color: colors.primary,
                            marginBottom: '16px',
                            fontSize: '18px',
                            fontWeight: 'bold'
                        }}>
                            {rondaAtiva.em_andamento ? '🟢 Ronda em Andamento' : '🔴 Nenhuma Ronda Ativa'}
                        </h3>

                        {rondaAtiva.em_andamento && rondaAtiva.ronda && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                <div>
                                    <p style={{ margin: '0', fontWeight: 'bold' }}>ID da Ronda:</p>
                                    <p style={{ margin: '0', color: '#666' }}>{rondaAtiva.ronda.id}</p>
                                </div>

                                {rondaAtiva.ronda.inicio && (
                                    <div>
                                        <p style={{ margin: '0', fontWeight: 'bold' }}>Início:</p>
                                        <p style={{ margin: '0', color: '#666' }}>{rondaAtiva.ronda.inicio}</p>
                                    </div>
                                )}

                                {rondaAtiva.ronda.hora_entrada && (
                                    <div>
                                        <p style={{ margin: '0', fontWeight: 'bold' }}>Hora de Entrada:</p>
                                        <p style={{ margin: '0', color: '#666' }}>{rondaAtiva.ronda.hora_entrada}</p>
                                    </div>
                                )}

                                {rondaAtiva.ronda.escala_plantao && (
                                    <div>
                                        <p style={{ margin: '0', fontWeight: 'bold' }}>Escala:</p>
                                        <p style={{ margin: '0', color: '#666' }}>{rondaAtiva.ronda.escala_plantao}</p>
                                    </div>
                                )}

                                {rondaAtiva.ronda.turno && (
                                    <div>
                                        <p style={{ margin: '0', fontWeight: 'bold' }}>Turno:</p>
                                        <p style={{ margin: '0', color: '#666' }}>{rondaAtiva.ronda.turno}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Controles de Ronda */}
                <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{
                        color: colors.primary,
                        marginBottom: '16px',
                        fontSize: '18px',
                        fontWeight: 'bold'
                    }}>
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
                        <div style={{
                            backgroundColor: '#fff',
                            padding: '16px',
                            borderRadius: '6px',
                            border: '1px solid #dee2e6'
                        }}>
                            <h4 style={{
                                color: colors.primary,
                                marginBottom: '12px',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}>
                                📝 Dados para Finalização
                            </h4>

                            {tipoRonda === 'regular' && (
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                        Log Bruto
                                    </label>
                                    <textarea
                                        value={logBruto}
                                        onChange={(e) => setLogBruto(e.target.value)}
                                        placeholder="Descreva as atividades realizadas..."
                                        style={{
                                            width: '100%',
                                            minHeight: '80px',
                                            padding: '8px',
                                            border: '1px solid #ced4da',
                                            borderRadius: '4px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            )}

                            {tipoRonda === 'esporadica' && (
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                        Hora de Saída
                                    </label>
                                    <Input
                                        type="time"
                                        value={horaSaida}
                                        onChange={(e) => setHoraSaida(e.target.value)}
                                    />
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    Observações
                                </label>
                                <textarea
                                    value={observacoes}
                                    onChange={(e) => setObservacoes(e.target.value)}
                                    placeholder="Observações adicionais..."
                                    style={{
                                        width: '100%',
                                        minHeight: '60px',
                                        padding: '8px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
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
                        backgroundColor: '#f8f9fa',
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        <h3 style={{
                            color: colors.primary,
                            marginBottom: '16px',
                            fontSize: '18px',
                            fontWeight: 'bold'
                        }}>
                            📊 Consolidação de Rondas Esporádicas
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    Data Início
                                </label>
                                <Input
                                    type="date"
                                    value={dataInicioConsolidacao}
                                    onChange={(e) => setDataInicioConsolidacao(e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    Data Fim
                                </label>
                                <Input
                                    type="date"
                                    value={dataFimConsolidacao}
                                    onChange={(e) => setDataFimConsolidacao(e.target.value)}
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
                                backgroundColor: '#d4edda',
                                padding: '16px',
                                borderRadius: '6px',
                                marginTop: '16px',
                                border: '1px solid #c3e6cb'
                            }}>
                                <h4 style={{
                                    color: '#155724',
                                    marginBottom: '8px',
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}>
                                    Resultado da Consolidação
                                </h4>
                                <p style={{
                                    color: '#155724',
                                    margin: '0',
                                    fontSize: '14px'
                                }}>
                                    {resultadoConsolidacao.message}
                                </p>
                                {resultadoConsolidacao.relatorio_consolidado && (
                                    <details style={{ marginTop: '12px' }}>
                                        <summary style={{
                                            color: '#155724',
                                            cursor: 'pointer',
                                            fontWeight: 'bold'
                                        }}>
                                            Ver Relatório Consolidado
                                        </summary>
                                        <pre style={{
                                            backgroundColor: '#fff',
                                            padding: '12px',
                                            borderRadius: '4px',
                                            marginTop: '8px',
                                            fontSize: '12px',
                                            whiteSpace: 'pre-wrap',
                                            overflow: 'auto',
                                            maxHeight: '200px'
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
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                border: '4px solid #f3f3f3',
                                borderTop: '4px solid #3498db',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 10px'
                            }}></div>
                            <p style={{ margin: 0, color: '#666' }}>Processando...</p>
                        </div>
                    </div>
                )}
            </div>
        </BaseScreen>
    );
}; 