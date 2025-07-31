import React from 'react';
import { Input } from '../Input';
import { Button } from '../Button';
import { AutoComplete } from '../AutoComplete';
import { colors } from '../../theme/colors';
import { Condominio, Colaborador, buscarColaboradores } from '../../services/rondas';

interface RondaConfiguracoesProps {
    tipoRonda: 'regular' | 'esporadica';
    condominios: Condominio[];
    condominiosLoading: boolean;
    condominioId: number;
    setCondominioId: (id: number) => void;
    colaboradores: Colaborador[];
    colaboradoresLoading: boolean;
    dataPlantao: string;
    setDataPlantao: (data: string) => void;
    escalaPlantao: string;
    setEscalaPlantao: (escala: string) => void;
    logBruto: string;
    setLogBruto: (log: string) => void;
    observacoes: string;
    setObservacoes: (obs: string) => void;
    horaEntrada: string;
    setHoraEntrada: (hora: string) => void;
    horaSaida: string;
    setHoraSaida: (hora: string) => void;
    turno: string;
    setTurno: (turno: string) => void;
    userId: number;
    setUserId: (id: number) => void;
    colaboradorNome: string;
    setColaboradorNome: (nome: string) => void;
    validacaoHorario: any;
    onValidarHorario: () => void;
    loading: boolean;
    token?: string;
}

export const RondaConfiguracoes: React.FC<RondaConfiguracoesProps> = ({
    tipoRonda,
    condominios,
    condominiosLoading,
    condominioId,
    setCondominioId,
    colaboradores,
    colaboradoresLoading,
    dataPlantao,
    setDataPlantao,
    escalaPlantao,
    setEscalaPlantao,
    logBruto,
    setLogBruto,
    observacoes,
    setObservacoes,
    horaEntrada,
    setHoraEntrada,
    horaSaida,
    setHoraSaida,
    turno,
    setTurno,
    userId,
    setUserId,
    colaboradorNome,
    setColaboradorNome,
    validacaoHorario,
    onValidarHorario,
    loading,
    token,
}) => {
    return (
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
                        Condomínio
                    </label>
                    {condominiosLoading ? (
                        <div style={{ padding: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                            Carregando condomínios...
                        </div>
                    ) : (
                        <select
                            value={condominioId}
                            onChange={(e) => setCondominioId(Number(e.target.value))}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                backgroundColor: 'white'
                            }}
                        >
                            {condominios.map((condominio) => (
                                <option key={condominio.id} value={condominio.id}>
                                    {condominio.nome}
                                </option>
                            ))}
                        </select>
                    )}
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
                        <option value="">Selecione a escala</option>
                        <option value="06 às 18">06 às 18</option>
                        <option value="18 às 06">18 às 06</option>
                    </select>
                </div>
                {tipoRonda === 'esporadica' && (
                    <>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Colaborador
                            </label>
                            {colaboradoresLoading ? (
                                <div style={{ padding: '10px', backgroundColor: colors.lightGray, borderRadius: '4px' }}>
                                    Carregando colaboradores...
                                </div>
                            ) : (
                                <>
                                    <AutoComplete
                                        placeholder="Digite o nome do colaborador"
                                        value={colaboradorNome}
                                        onChange={setColaboradorNome}
                                        onSelect={(colaborador) => {
                                            console.log('Colaborador selecionado:', colaborador);
                                            setUserId(colaborador.id);
                                            setColaboradorNome(colaborador.nome_completo);
                                        }}
                                        searchFunction={async (query: string) => {
                                            try {
                                                const response = await buscarColaboradores(query, token);
                                                return response.colaboradores || [];
                                            } catch (error) {
                                                console.error('Erro ao buscar colaboradores:', error);
                                                return [];
                                            }
                                        }}
                                        displayField="nome_completo"
                                        token={token}
                                        style={{
                                            backgroundColor: '#FFFFFF',
                                            color: '#000000',
                                            border: '2px solid #007bff'
                                        }}
                                    />
                                    <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                                        Valor atual: "{colaboradorNome}"
                                    </div>
                                </>
                            )}
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                                Hora de Entrada
                            </label>
                            <Input
                                type="time"
                                value={horaEntrada}
                                onChange={(e) => setHoraEntrada(e.target.value)}
                                placeholder="HH:MM"
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
                    </>
                )}
            </div>
            {tipoRonda === 'esporadica' && (
                <div style={{ marginTop: '16px' }}>
                    <Button
                        title="✅ Validar Horário"
                        onClick={onValidarHorario}
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
    );
}; 