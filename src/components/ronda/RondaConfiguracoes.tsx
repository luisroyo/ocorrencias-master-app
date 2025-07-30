import React from 'react';
import { Input } from '../Input';
import { Button } from '../Button';
import { colors } from '../../theme/colors';
import { Condominio } from '../../services/rondas';

interface RondaConfiguracoesProps {
    tipoRonda: 'regular' | 'esporadica';
    condominios: Condominio[];
    condominiosLoading: boolean;
    condominioId: number;
    setCondominioId: (id: number) => void;
    dataPlantao: string;
    setDataPlantao: (data: string) => void;
    escalaPlantao: string;
    setEscalaPlantao: (escala: string) => void;
    horaEntrada: string;
    setHoraEntrada: (hora: string) => void;
    turno: string;
    setTurno: (turno: string) => void;
    userId: number;
    setUserId: (id: number) => void;
    supervisorId: number;
    setSupervisorId: (id: number) => void;
    validacaoHorario: any;
    onValidarHorario: () => void;
    loading: boolean;
}

export const RondaConfiguracoes: React.FC<RondaConfiguracoesProps> = ({
    tipoRonda,
    condominios,
    condominiosLoading,
    condominioId,
    setCondominioId,
    dataPlantao,
    setDataPlantao,
    escalaPlantao,
    setEscalaPlantao,
    horaEntrada,
    setHoraEntrada,
    turno,
    setTurno,
    userId,
    setUserId,
    supervisorId,
    setSupervisorId,
    validacaoHorario,
    onValidarHorario,
    loading
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