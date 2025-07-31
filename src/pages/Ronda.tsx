import React, { useState, useEffect } from 'react';
import { BaseScreen } from '../components/BaseScreen';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { colors } from '../theme/colors';
import { salvarRondaCompleta, enviarRelatorioRondasWhatsApp } from '../services/rondas';

interface RondaScreenProps {
    token: string;
}

interface Ronda {
    id?: number;
    residencial: string;
    inicio: string;
    termino: string;
    duracao: number; // em minutos
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

    const adicionarRonda = () => {
        if (!residencial || !inicioRonda || !terminoRonda) {
            alert('Preencha todos os campos!');
            return;
        }

        const duracao = calcularDuracao(inicioRonda, terminoRonda);
        
        if (duracao <= 0) {
            alert('O horário de término deve ser posterior ao início!');
            return;
        }
        
        const novaRonda: Ronda = {
            residencial,
            inicio: inicioRonda,
            termino: terminoRonda,
            duracao
        };

        setRondas(prev => [...prev, novaRonda]);
        setInicioRonda('');
        setTerminoRonda('');
        setContador(1200); // Reset do contador
        setContadorAtivo(false);
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
                await salvarRondaCompleta(token, {
                    condominio_id: 1, // ID do condomínio (pode ser ajustado)
                    user_id: 1, // ID do usuário
                    data_plantao: dataPlantao,
                    hora_entrada: ronda.inicio,
                    hora_saida: ronda.termino,
                    escala_plantao: "18 às 06", // Pode ser ajustado
                    turno: "Noite",
                    observacoes: `Ronda no residencial ${ronda.residencial}`
                });
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
                rondas: rondas
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
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Residencial
                            </label>
                            <Input
                                value={residencial}
                                onChange={(e) => setResidencial(e.target.value)}
                                placeholder="Nome do residencial"
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Início
                            </label>
                            <Input
                                type="time"
                                value={inicioRonda}
                                onChange={(e) => setInicioRonda(e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Término
                            </label>
                            <Input
                                type="time"
                                value={terminoRonda}
                                onChange={(e) => setTerminoRonda(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <Button onClick={adicionarRonda} disabled={loading}>
                            ➕ Adicionar Ronda
                        </Button>
                        
                        <div style={{ marginLeft: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Data do Plantão
                            </label>
                            <Input
                                type="date"
                                value={dataPlantao}
                                onChange={(e) => setDataPlantao(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

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
                            onClick={iniciarContador} 
                            disabled={contadorAtivo}
                            style={{ backgroundColor: colors.success }}
                        >
                            ▶️ Iniciar
                        </Button>
                        <Button 
                            onClick={pararContador} 
                            disabled={!contadorAtivo}
                            style={{ backgroundColor: colors.danger }}
                        >
                            ⏹️ Parar
                        </Button>
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
                                        onClick={() => removerRonda(index)}
                                        style={{ backgroundColor: colors.danger, padding: '5px 10px' }}
                                    >
                                        ❌
                                    </Button>
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
                            onClick={salvarRondas} 
                            disabled={loading}
                            style={{ backgroundColor: colors.primary }}
                        >
                            💾 Salvar Rondas
                        </Button>
                        
                        <Button 
                            onClick={enviarWhatsApp} 
                            disabled={loading}
                            style={{ backgroundColor: colors.success }}
                        >
                            📱 Enviar WhatsApp
                        </Button>
                    </div>
                )}
            </div>
        </BaseScreen>
    );
}; 