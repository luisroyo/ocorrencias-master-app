import React, { useState, useEffect } from 'react';
import { BaseScreen } from '../components/BaseScreen';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { AutoComplete } from '../components/AutoComplete';
import { colors } from '../theme/colors';
import { salvarRondaCompleta, enviarRelatorioRondasWhatsApp, buscarCondominios, buscarRondasExecutadas } from '../services/rondas';

interface RondaScreenProps {
    token: string;
}

interface Ronda {
    id?: number;
    residencial: string;
    inicio: string;
    termino?: string; // Made optional
    duracao?: number; // Made optional
    status: 'iniciada' | 'finalizada'; // Added status
}

interface Condominio {
    id: number;
    nome: string;
}

interface RondaExecutada {
    id: number;
    data_plantao: string;
    hora_entrada: string;
    hora_saida?: string; // Made optional to match RondaEsporadica
    duracao_minutos?: number; // Made optional
    escala_plantao: string;
    turno: string;
    observacoes?: string;
}

export const RondaScreen: React.FC<RondaScreenProps> = ({ token }) => {
    const [rondas, setRondas] = useState<Ronda[]>([]);
    const [residencial, setResidencial] = useState<string>('');
    const [inicioRonda, setInicioRonda] = useState<string>('');
    const [terminoRonda, setTerminoRonda] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [contador, setContador] = useState<number>(1200); // 20 minutos em segundos
    const [contadorAtivo, setContadorAtivo] = useState<boolean>(false);
    const [dataPlantao, setDataPlantao] = useState<string>(new Date().toISOString().split('T')[0]);
    const [escalaPlantao, setEscalaPlantao] = useState<string>('18 às 06'); // Added
    const [rondaAtual, setRondaAtual] = useState<Ronda | null>(null); // Added
    
    // Estados para condomínios
    const [condominioId, setCondominioId] = useState<number>(1);
    const [condominioNome, setCondominioNome] = useState<string>('');
    
    // Estados para rondas executadas
    const [rondasExecutadas, setRondasExecutadas] = useState<RondaExecutada[]>([]);
    const [loadingRondasExecutadas, setLoadingRondasExecutadas] = useState<boolean>(false);
    
    // Estados para controle inteligente
    const [periodoInicio, setPeriodoInicio] = useState<string>('');
    const [periodoFim, setPeriodoFim] = useState<string>('');
    const [condominiosPendentes, setCondominiosPendentes] = useState<string[]>([]);
    const [rondasSalvas, setRondasSalvas] = useState<Ronda[]>([]);

    // Função para calcular período do plantão (18h-06h = 12 horas)
    const calcularPeriodoPlantao = (data: string, escala: string) => {
        const dataPlantao = new Date(data);
        
        if (escala === '18 às 06') {
            // Plantão noturno: 18h do dia atual até 06h do dia seguinte
            const inicio = new Date(dataPlantao);
            inicio.setHours(18, 0, 0, 0);
            
            const fim = new Date(dataPlantao);
            fim.setDate(fim.getDate() + 1); // Próximo dia
            fim.setHours(6, 0, 0, 0);
            
            return {
                inicio: inicio.toISOString(),
                fim: fim.toISOString(),
                inicioFormatado: inicio.toLocaleString('pt-BR'),
                fimFormatado: fim.toLocaleString('pt-BR')
            };
        } else {
            // Plantão diurno: 06h até 18h do mesmo dia
            const inicio = new Date(dataPlantao);
            inicio.setHours(6, 0, 0, 0);
            
            const fim = new Date(dataPlantao);
            fim.setHours(18, 0, 0, 0);
            
            return {
                inicio: inicio.toISOString(),
                fim: fim.toISOString(),
                inicioFormatado: inicio.toLocaleString('pt-BR'),
                fimFormatado: fim.toLocaleString('pt-BR')
            };
        }
    };

    // Função inteligente para enviar WhatsApp
    const enviarWhatsAppInteligente = async (rondasParaEnviar: Ronda[]) => {
        if (rondasParaEnviar.length === 0) {
            alert('Nenhuma ronda para enviar!');
            return;
        }

        const periodo = calcularPeriodoPlantao(dataPlantao, escalaPlantao);
        let mensagem = `Plantão ${dataPlantao} (${escalaPlantao})\n`;
        mensagem += `Período: ${periodo.inicioFormatado} - ${periodo.fimFormatado}\n\n`;
        
        rondasParaEnviar.forEach((ronda, index) => {
            mensagem += `${index + 1}. ${ronda.residencial}\n`;
            mensagem += `   Início: ${ronda.inicio} - Fim: ${ronda.termino || 'Em andamento'}\n`;
            if (ronda.duracao) {
                mensagem += `   Duração: ${ronda.duracao} minutos\n`;
            }
            mensagem += '\n';
        });
        
        mensagem += `✅ Total: ${rondasParaEnviar.length} rondas no plantão`;

        // Tentar enviar para WhatsApp Mobile primeiro
        try {
            // Verificar se WhatsApp Mobile está disponível
            if (navigator.share) {
                await navigator.share({
                    title: 'Relatório de Rondas',
                    text: mensagem
                });
                alert('Relatório enviado via WhatsApp Mobile!');
            } else {
                // Fallback para WhatsApp Web
                const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
                window.open(url, '_blank');
                alert('Relatório aberto no WhatsApp Web!');
            }
        } catch (error) {
            console.error('Erro ao enviar WhatsApp:', error);
            alert('Erro ao enviar WhatsApp!');
        }
    };

    // Função para verificar condomínios pendentes
    const verificarCondominiosPendentes = () => {
        const condominiosComRondas = Array.from(new Set(rondasSalvas.map(r => r.residencial)));
        const condominiosExecutados = Array.from(new Set(rondasExecutadas.map(r => r.observacoes || '')));
        
        const pendentes = condominiosComRondas.filter(cond => 
            !condominiosExecutados.includes(cond)
        );
        
        setCondominiosPendentes(pendentes);
        
        if (pendentes.length > 0) {
            alert(`⚠️ ATENÇÃO: Faltam enviar rondas dos condomínios:\n${pendentes.join('\n')}`);
        }
    };

    // Função para buscar rondas executadas
    const buscarRondasDoCondominio = async (condominioId: number) => {
        if (!condominioId) return;
        
        setLoadingRondasExecutadas(true);
        try {
            // Calcular período do plantão
            const periodo = calcularPeriodoPlantao(dataPlantao, escalaPlantao);
            
            const resultado = await buscarRondasExecutadas(token, condominioId, periodo.inicio, periodo.fim);
            
            if (resultado.rondas) {
                setRondasExecutadas(resultado.rondas);
            }
        } catch (error) {
            console.error('Erro ao buscar rondas executadas:', error);
        } finally {
            setLoadingRondasExecutadas(false);
        }
    };

    // Contador regressivo
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (contadorAtivo && contador > 0) {
            interval = setInterval(() => {
                setContador(prev => prev - 1);
            }, 1000);
        } else if (contador === 0) {
            setContadorAtivo(false);
        }
        return () => clearInterval(interval);
    }, [contadorAtivo, contador]);

    const formatarTempo = (segundos: number): string => {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    };

    const calcularDuracao = (inicio: string, termino: string): number => {
        const [horaInicio, minInicio] = inicio.split(':').map(Number);
        const [horaTermino, minTermino] = termino.split(':').map(Number);

        let minutosInicio = horaInicio * 60 + minInicio;
        let minutosTermino = horaTermino * 60 + minTermino;

        // Se o término for menor que o início, significa que passou da meia-noite
        if (minutosTermino < minutosInicio) {
            minutosTermino += 24 * 60; // Adiciona 24 horas
        }

        return minutosTermino - minutosInicio;
    };

    const iniciarRonda = () => {
        if (!residencial || !inicioRonda) {
            alert('Preencha o residencial e horário de início!');
            return;
        }

        const novaRonda: Ronda = {
            residencial,
            inicio: inicioRonda,
            status: 'iniciada'
        };

        setRondaAtual(novaRonda);
        setInicioRonda('');
        setContador(1200); // Reset do contador
        setContadorAtivo(true);

        alert('Ronda iniciada! Agora você pode finalizar quando terminar.');
    };

    const finalizarRonda = () => {
        if (!rondaAtual || !terminoRonda) {
            alert('Preencha o horário de término!');
            return;
        }

        const duracao = calcularDuracao(rondaAtual.inicio, terminoRonda);

        if (duracao <= 0) {
            alert('O horário de término deve ser posterior ao início!');
            return;
        }

        const rondaFinalizada: Ronda = {
            ...rondaAtual,
            termino: terminoRonda,
            duracao,
            status: 'finalizada'
        };

        setRondas(prev => [...prev, rondaFinalizada]);
        setRondaAtual(null);
        setTerminoRonda('');
        setContadorAtivo(false);

        alert('Ronda finalizada e adicionada à lista!');
    };

    const removerRonda = (index: number) => {
        setRondas(prev => prev.filter((_, i) => i !== index));
    };

    const iniciarContador = () => {
        setContadorAtivo(true);
        setContador(1200); // 20 minutos
    };

    const pararContador = () => {
        setContadorAtivo(false);
    };

    const salvarRondas = async () => {
        if (rondas.length === 0) {
            alert('Adicione pelo menos uma ronda!');
            return;
        }

        setLoading(true);
        try {
            // Salvar cada ronda como esporádica completa
            for (const ronda of rondas) {
                if (ronda.termino && ronda.duracao) {
                    await salvarRondaCompleta(token, {
                        condominio_id: condominioId, // Usar o condomínio selecionado
                        user_id: 1, // ID do usuário
                        data_plantao: dataPlantao,
                        hora_entrada: ronda.inicio,
                        hora_saida: ronda.termino,
                        escala_plantao: escalaPlantao,
                        turno: escalaPlantao === "18 às 06" ? "Noite" : "Dia",
                        observacoes: `Ronda no residencial ${ronda.residencial}`
                    });
                }
            }

            // Adicionar às rondas salvas
            setRondasSalvas(prev => [...prev, ...rondas]);
            
            alert('Rondas salvas com sucesso!');
            setRondas([]);
            
            // Verificar condomínios pendentes
            verificarCondominiosPendentes();
        } catch (error) {
            console.error('Erro ao salvar rondas:', error);
            alert('Erro ao salvar rondas!');
        } finally {
            setLoading(false);
        }
    };

    const enviarWhatsApp = async () => {
        // Enviar rondas esporádicas já salvas primeiro
        if (rondasExecutadas.length > 0) {
            await enviarWhatsAppInteligente(rondasExecutadas.map(r => ({
                id: r.id,
                residencial: r.observacoes || 'Condomínio',
                inicio: r.hora_entrada,
                termino: r.hora_saida,
                duracao: r.duracao_minutos,
                status: 'finalizada' as const
            })));
        }
        
        // Depois enviar rondas atuais se houver
        if (rondas.length > 0) {
            await enviarWhatsAppInteligente(rondas);
        }
        
        // Verificar condomínios pendentes
        verificarCondominiosPendentes();
    };

    return (
        <BaseScreen title="Controle de Rondas" subtitle="Registro de rondas esporádicas">
            <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>

                {/* Configurações do Plantão */}
                <div style={{
                    backgroundColor: colors.surface,
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ margin: '0 0 20px 0', color: colors.headingText }}>
                        ⚙️ Configurações do Plantão
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Data do Plantão
                            </label>
                            <Input
                                type="date"
                                value={dataPlantao}
                                onChange={(e) => setDataPlantao(e.target.value)}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Escala do Plantão
                            </label>
                            <select
                                value={escalaPlantao}
                                onChange={(e) => setEscalaPlantao(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '2px solid #007bff',
                                    borderRadius: '4px',
                                    fontSize: '16px'
                                }}
                            >
                                <option value="06 às 18">06 às 18</option>
                                <option value="18 às 06">18 às 06</option>
                            </select>
                        </div>
                    </div>

                    {/* Período Calculado */}
                    {dataPlantao && escalaPlantao && (
                        <div style={{
                            marginTop: '15px',
                            padding: '15px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                            border: '1px solid #dee2e6'
                        }}>
                            <strong>📅 Período do Plantão:</strong>
                            <br />
                            {(() => {
                                const periodo = calcularPeriodoPlantao(dataPlantao, escalaPlantao);
                                return `${periodo.inicioFormatado} - ${periodo.fimFormatado}`;
                            })()}
                        </div>
                    )}

                    {/* Condomínios Pendentes */}
                    {condominiosPendentes.length > 0 && (
                        <div style={{
                            marginTop: '15px',
                            padding: '15px',
                            backgroundColor: '#fff3cd',
                            borderRadius: '4px',
                            border: '1px solid #ffeaa7'
                        }}>
                            <strong>⚠️ Condomínios Pendentes:</strong>
                            <br />
                            {condominiosPendentes.join(', ')}
                        </div>
                    )}
                </div>

                {/* Rondas Executadas */}
                {condominioId > 1 && (
                    <div style={{
                        backgroundColor: colors.surface,
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 20px 0', color: colors.headingText }}>
                            📋 Rondas Executadas em {condominioNome}
                        </h3>

                        {loadingRondasExecutadas ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: colors.mutedText }}>
                                🔄 Carregando rondas executadas...
                            </div>
                        ) : rondasExecutadas.length > 0 ? (
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {rondasExecutadas.map((ronda, index) => (
                                    <div key={ronda.id || index} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '10px',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '4px',
                                        marginBottom: '10px',
                                        backgroundColor: 'white'
                                    }}>
                                        <div>
                                            <strong>Data: {new Date(ronda.data_plantao).toLocaleDateString('pt-BR')}</strong>
                                            <br />
                                            <span style={{ color: '#666' }}>
                                                {ronda.hora_entrada} - {ronda.hora_saida || 'Em andamento'} 
                                                {ronda.duracao_minutos && ` (${ronda.duracao_minutos} min)`}
                                            </span>
                                            <br />
                                            <span style={{ color: '#888', fontSize: '12px' }}>
                                                {ronda.escala_plantao} | {ronda.turno}
                                            </span>
                                        </div>
                                        <div style={{ color: '#28a745', fontSize: '12px', fontWeight: 'bold' }}>
                                            ✅ Executada
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', color: colors.mutedText }}>
                                📭 Nenhuma ronda executada encontrada nos últimos 30 dias
                            </div>
                        )}
                    </div>
                )}

                {/* Formulário de Nova Ronda */}
                <div style={{
                    backgroundColor: colors.surface,
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ margin: '0 0 20px 0', color: colors.headingText }}>
                        🚀 Nova Ronda
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Condomínio
                            </label>
                            <AutoComplete
                                placeholder="Digite o nome do condomínio"
                                value={condominioNome}
                                onChange={setCondominioNome}
                                onSelect={(condominio) => {
                                    console.log('Condomínio selecionado:', condominio);
                                    setCondominioId(condominio.id);
                                    setCondominioNome(condominio.nome);
                                    setResidencial(condominio.nome); // Usar o nome do condomínio como residencial
                                    buscarRondasDoCondominio(condominio.id); // Buscar rondas executadas ao selecionar condomínio
                                }}
                                searchFunction={async (query: string) => {
                                    try {
                                        const response = await buscarCondominios(query, token);
                                        return response.condominios || [];
                                    } catch (error) {
                                        console.error('Erro ao buscar condomínios:', error);
                                        return [];
                                    }
                                }}
                                displayField="nome"
                                token={token}
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    color: '#000000',
                                    border: '2px solid #007bff'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Horário de Início
                            </label>
                            <Input
                                type="time"
                                value={inicioRonda}
                                onChange={(e) => setInicioRonda(e.target.value)}
                            />
                        </div>
                    </div>

                    <Button
                        title="▶️ Iniciar Ronda"
                        onClick={iniciarRonda}
                        disabled={loading || !residencial || !inicioRonda}
                        style={{ backgroundColor: colors.success, marginRight: '10px' }}
                    />
                </div>

                {/* Ronda Atual */}
                {rondaAtual && (
                    <div style={{
                        backgroundColor: colors.success,
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        color: 'white'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0' }}>
                            🔄 Ronda em Andamento
                        </h3>

                        <div style={{ marginBottom: '15px' }}>
                            <strong>Residencial:</strong> {rondaAtual.residencial}<br />
                            <strong>Início:</strong> {rondaAtual.inicio}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                    Horário de Término
                                </label>
                                <Input
                                    type="time"
                                    value={terminoRonda}
                                    onChange={(e) => setTerminoRonda(e.target.value)}
                                />
                            </div>

                            <Button
                                title="⏹️ Finalizar Ronda"
                                onClick={finalizarRonda}
                                disabled={loading || !terminoRonda}
                                style={{ backgroundColor: colors.danger, marginTop: '20px' }}
                            />
                        </div>
                    </div>
                )}

                {/* Contador Regressivo */}
                <div style={{
                    backgroundColor: colors.surface,
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ margin: '0 0 15px 0', color: colors.headingText }}>
                        ⏰ Contador Regressivo (20 min)
                    </h3>

                    <div style={{
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: contador < 300 ? colors.danger : colors.headingText,
                        marginBottom: '15px'
                    }}>
                        {formatarTempo(contador)}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <Button
                            title="▶️ Iniciar"
                            onClick={iniciarContador}
                            disabled={contadorAtivo}
                            style={{ backgroundColor: colors.success }}
                        />
                        <Button
                            title="⏹️ Parar"
                            onClick={pararContador}
                            disabled={!contadorAtivo}
                            style={{ backgroundColor: colors.danger }}
                        />
                    </div>
                </div>

                {/* Lista de Rondas */}
                {rondas.length > 0 && (
                    <div style={{
                        backgroundColor: colors.surface,
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 20px 0', color: colors.headingText }}>
                            📋 Rondas Registradas ({rondas.length})
                        </h3>

                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {rondas.map((ronda, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    marginBottom: '10px',
                                    backgroundColor: 'white'
                                }}>
                                    <div>
                                        <strong>{ronda.residencial}</strong>
                                        <br />
                                        <span style={{ color: '#666' }}>
                                            {ronda.inicio} - {ronda.termino} ({ronda.duracao} min)
                                        </span>
                                    </div>
                                    <Button
                                        title="❌"
                                        onClick={() => removerRonda(index)}
                                        style={{ backgroundColor: colors.danger, padding: '5px 10px' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Botões de Ação */}
                {rondas.length > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        justifyContent: 'center',
                        padding: '20px',
                        backgroundColor: colors.surface,
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <Button
                            title="💾 Salvar Rondas"
                            onClick={salvarRondas}
                            disabled={loading}
                            style={{ backgroundColor: colors.primary }}
                        />

                        <Button
                            title="📱 Enviar WhatsApp"
                            onClick={enviarWhatsApp}
                            disabled={loading}
                            style={{ backgroundColor: colors.success }}
                        />
                    </div>
                )}
            </div>
        </BaseScreen>
    );
}; 