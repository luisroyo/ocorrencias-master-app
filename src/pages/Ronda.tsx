import React, { useState, useEffect } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { BaseScreen } from '../components/BaseScreen';
import { colors } from '../theme/colors';
import { 
    verificarRondaEmAndamento,
    iniciarRonda,
    finalizarRonda,
    atualizarRonda,
    gerarRelatorioRonda,
    RondaEmAndamento
} from '../services/rondas';

interface RondaScreenProps {
    token?: string;
}

export const RondaScreen: React.FC<RondaScreenProps> = ({ token = 'mock-token' }) => {
    const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);
    const [condominio, setCondominio] = useState('');
    const [supervisor, setSupervisor] = useState('');
    const [escalaPlantao, setEscalaPlantao] = useState('06h às 18h');
    const [observacoes, setObservacoes] = useState('');
    const [loading, setLoading] = useState(false);
    const [rondaEmAndamento, setRondaEmAndamento] = useState<RondaEmAndamento | null>(null);
    const [relatorioGerado, setRelatorioGerado] = useState('');
    const [condominioId, setCondominioId] = useState<number | null>(null);
    const [supervisorId, setSupervisorId] = useState<number | null>(null);

    const escalaOptions = [
        '06h às 18h',
        '18h às 06h',
        '12h às 00h',
        '00h às 12h'
    ];

    // Verificar ronda em andamento ao carregar
    useEffect(() => {
        if (condominioId) {
            verificarRondaAtual();
        }
    }, [condominioId]);

    const verificarRondaAtual = async () => {
        if (!condominioId) return;

        try {
            const resultado = await verificarRondaEmAndamento(token, condominioId);
            setRondaEmAndamento(resultado);
        } catch (error) {
            console.error('Erro ao verificar ronda em andamento:', error);
        }
    };

    const handleIniciarRonda = async () => {
        if (!condominioId) {
            alert('Selecione um condomínio.');
            return;
        }

        if (rondaEmAndamento?.em_andamento) {
            alert('Já existe uma ronda em andamento para este condomínio.');
            return;
        }

        setLoading(true);
        try {
            const resultado = await iniciarRonda(token, {
                condominio_id: condominioId,
                data_plantao: data,
                escala_plantao: escalaPlantao,
                supervisor_id: supervisorId
            });

            if (resultado.sucesso) {
                alert('Ronda iniciada com sucesso!');
                await verificarRondaAtual();
            } else {
                alert(resultado.message || 'Erro ao iniciar ronda.');
            }
        } catch (error) {
            alert('Erro ao iniciar ronda.');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalizarRonda = async () => {
        if (!rondaEmAndamento?.ronda?.id) {
            alert('Nenhuma ronda em andamento encontrada.');
            return;
        }

        setLoading(true);
        try {
            const resultado = await finalizarRonda(token, rondaEmAndamento.ronda.id);

            if (resultado.sucesso) {
                alert('Ronda finalizada com sucesso!');
                await verificarRondaAtual();
            } else {
                alert(resultado.message || 'Erro ao finalizar ronda.');
            }
        } catch (error) {
            alert('Erro ao finalizar ronda.');
        } finally {
            setLoading(false);
        }
    };

    const handleAtualizarRonda = async () => {
        if (!rondaEmAndamento?.ronda?.id) {
            alert('Nenhuma ronda em andamento encontrada.');
            return;
        }

        setLoading(true);
        try {
            const resultado = await atualizarRonda(token, rondaEmAndamento.ronda.id, {
                observacoes: observacoes,
                escala_plantao: escalaPlantao
            });

            if (resultado.sucesso) {
                alert('Ronda atualizada com sucesso!');
                setObservacoes('');
            } else {
                alert(resultado.message || 'Erro ao atualizar ronda.');
            }
        } catch (error) {
            alert('Erro ao atualizar ronda.');
        } finally {
            setLoading(false);
        }
    };

    const handleGerarRelatorio = async () => {
        if (!condominioId) {
            alert('Selecione um condomínio.');
            return;
        }

        setLoading(true);
        try {
            const resultado = await gerarRelatorioRonda(token, condominioId, data);

            if (resultado.sucesso && resultado.relatorio) {
                setRelatorioGerado(resultado.relatorio);
            } else {
                alert(resultado.message || 'Erro ao gerar relatório.');
            }
        } catch (error) {
            alert('Erro ao gerar relatório.');
        } finally {
            setLoading(false);
        }
    };

    const handleEnviarWhatsApp = () => {
        if (!relatorioGerado) {
            alert('Gere o relatório antes de enviar.');
            return;
        }
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(relatorioGerado)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleCopiarRelatorio = () => {
        navigator.clipboard.writeText(relatorioGerado);
        alert('Relatório copiado para a área de transferência.');
    };

    return (
        <BaseScreen title="Controle de Rondas" subtitle="Gerencie suas rondas">
            <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                    {/* Data */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                            📅 Data do Plantão
                        </label>
                        <input
                            type="date"
                            value={data}
                            onChange={(e) => setData(e.target.value)}
                            style={{
                                backgroundColor: '#F9F9F9',
                                color: '#333',
                                fontSize: '16px',
                                borderRadius: '10px',
                                padding: '12px 15px',
                                border: '1px solid #E0E0E0',
                                width: '100%',
                                boxSizing: 'border-box',
                                height: '48px'
                            }}
                        />
                    </div>

                    {/* Condomínio */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                            🏢 Condomínio
                        </label>
                        <Input
                            placeholder="Nome do condomínio"
                            value={condominio}
                            onChange={(e) => {
                                setCondominio(e.target.value);
                                // Simular busca de condomínios
                                if (e.target.value.length >= 2) {
                                    setCondominioId(1); // Mock ID
                                }
                            }}
                            style={{
                                backgroundColor: '#F9F9F9',
                                color: '#333',
                                fontSize: '16px',
                                borderRadius: '10px',
                                padding: '12px 15px',
                                border: '1px solid #E0E0E0',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Supervisor */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                            👨‍💼 Supervisor
                        </label>
                        <Input
                            placeholder="Nome do supervisor"
                            value={supervisor}
                            onChange={(e) => {
                                setSupervisor(e.target.value);
                                // Simular busca de supervisores
                                if (e.target.value.length >= 2) {
                                    setSupervisorId(1); // Mock ID
                                }
                            }}
                            style={{
                                backgroundColor: '#F9F9F9',
                                color: '#333',
                                fontSize: '16px',
                                borderRadius: '10px',
                                padding: '12px 15px',
                                border: '1px solid #E0E0E0',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Escala */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                            🕐 Escala do Plantão
                        </label>
                        <select
                            value={escalaPlantao}
                            onChange={(e) => setEscalaPlantao(e.target.value)}
                            style={{
                                backgroundColor: '#F9F9F9',
                                color: '#333',
                                fontSize: '16px',
                                borderRadius: '10px',
                                padding: '12px 15px',
                                border: '1px solid #E0E0E0',
                                width: '100%',
                                boxSizing: 'border-box',
                                height: '48px'
                            }}
                        >
                            {escalaOptions.map(opt => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Observações */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: colors.headingText }}>
                            📝 Observações
                        </label>
                        <textarea
                            placeholder="Observações sobre a ronda..."
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            style={{
                                backgroundColor: '#F9F9F9',
                                color: '#333',
                                fontSize: '16px',
                                borderRadius: '10px',
                                padding: '12px 15px',
                                border: '1px solid #E0E0E0',
                                width: '100%',
                                boxSizing: 'border-box',
                                minHeight: '100px',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                </div>

                {/* Status da Ronda */}
                {rondaEmAndamento && (
                    <div style={{
                        backgroundColor: rondaEmAndamento.em_andamento ? '#e8f5e8' : '#fff3cd',
                        border: `1px solid ${rondaEmAndamento.em_andamento ? '#28a745' : '#ffc107'}`,
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '20px'
                    }}>
                        <h4 style={{ 
                            margin: '0 0 8px 0', 
                            color: rondaEmAndamento.em_andamento ? '#155724' : '#856404' 
                        }}>
                            Status da Ronda: {rondaEmAndamento.em_andamento ? '🟢 Em Andamento' : '🟡 Nenhuma Ronda Ativa'}
                        </h4>
                        {rondaEmAndamento.ronda && (
                            <p style={{ 
                                margin: 0, 
                                color: rondaEmAndamento.em_andamento ? '#155724' : '#856404',
                                fontSize: '14px'
                            }}>
                                Iniciada em: {new Date(rondaEmAndamento.ronda.inicio).toLocaleString('pt-BR')}
                            </p>
                        )}
                    </div>
                )}

                {/* Botões de Controle */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {!rondaEmAndamento?.em_andamento ? (
                            <Button
                                title={loading ? 'Iniciando...' : '🚀 Iniciar Ronda'}
                                onClick={handleIniciarRonda}
                                disabled={loading}
                                style={{
                                    backgroundColor: colors.success,
                                    flex: 1,
                                    minWidth: '200px'
                                }}
                            />
                        ) : (
                            <Button
                                title={loading ? 'Finalizando...' : '⏹️ Finalizar Ronda'}
                                onClick={handleFinalizarRonda}
                                disabled={loading}
                                style={{
                                    backgroundColor: colors.danger,
                                    flex: 1,
                                    minWidth: '200px'
                                }}
                            />
                        )}

                        {rondaEmAndamento?.em_andamento && (
                            <Button
                                title="📝 Atualizar Ronda"
                                onClick={handleAtualizarRonda}
                                disabled={loading}
                                variant="secondary"
                                style={{
                                    flex: 1,
                                    minWidth: '200px'
                                }}
                            />
                        )}
                    </div>

                    <Button
                        title={loading ? 'Gerando...' : '📊 Gerar Relatório'}
                        onClick={handleGerarRelatorio}
                        disabled={loading}
                        style={{
                            backgroundColor: colors.primaryBg,
                            width: '100%'
                        }}
                    />

                    {loading && (
                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <span>⏳ Processando...</span>
                        </div>
                    )}
                </div>

                {/* Relatório Gerado */}
                {relatorioGerado && (
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #e9ecef'
                    }}>
                        <h3 style={{ marginBottom: '16px', color: colors.headingText }}>
                            📋 Relatório de Rondas
                        </h3>
                        <pre style={{
                            color: '#333',
                            fontSize: '16px',
                            lineHeight: '22px',
                            fontFamily: 'inherit',
                            whiteSpace: 'pre-line',
                            margin: 0,
                            padding: 0,
                            background: 'none',
                            border: 'none',
                            backgroundColor: '#fff',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6'
                        }}>
                            {relatorioGerado}
                        </pre>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                            <Button 
                                title="📋 Copiar Relatório" 
                                onClick={handleCopiarRelatorio} 
                                variant="success"
                                style={{ flex: 1, minWidth: '150px' }}
                            />
                            <Button 
                                title="📱 Enviar via WhatsApp" 
                                onClick={handleEnviarWhatsApp} 
                                variant="success"
                                style={{ flex: 1, minWidth: '150px' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </BaseScreen>
    );
}; 