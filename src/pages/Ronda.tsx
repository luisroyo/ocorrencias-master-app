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

    // Função para buscar rondas executadas
    const buscarRondasDoCondominio = async (condominioId: number) => {
        if (!condominioId) return;
        
        setLoadingRondasExecutadas(true);
        try {
            // Buscar rondas dos últimos 30 dias
            const dataInicio = new Date();
            dataInicio.setDate(dataInicio.getDate() - 30);
            const dataFim = new Date();
            
            const resultado = await buscarRondasExecutadas(token, condominioId, dataInicio.toISOString().split('T')[0], dataFim.toISOString().split('T')[0]);
            
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

            alert('Rondas salvas com sucesso!');
            setRondas([]);
        } catch (error) {
            console.error('Erro ao salvar rondas:', error);
            alert('Erro ao salvar rondas!');
        } finally {
            setLoading(false);
        }
    };

    const enviarWhatsApp = async () => {
        if (rondas.length === 0) {
            alert('Adicione pelo menos uma ronda!');
            return;
        }

        setLoading(true);
        try {
            const resultado = await enviarRelatorioRondasWhatsApp(token, {
                data_plantao: dataPlantao,
                residencial: residencial,
                rondas: rondas.filter(r => r.termino && r.duracao).map(r => ({
                    inicio: r.inicio,
                    termino: r.termino!,
                    duracao: r.duracao!
                }))
            });

            if (resultado.sucesso) {
                alert(resultado.message);
                setRondas([]); // Limpar lista após envio
            } else {
                alert(`Erro: ${resultado.message}`);
            }

        } catch (error) {
            console.error('Erro ao enviar WhatsApp:', error);
            alert('Erro ao enviar WhatsApp!');
        } finally {
            setLoading(false);
        }
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
                                    padding: '8px',
                                    border: '1px solid #ced4da',
                                    borderRadius: '4px',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="18 às 06">18 às 06 (Noite)</option>
                                <option value="06 às 18">06 às 18 (Dia)</option>
                            </select>
                        </div>
                    </div>
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