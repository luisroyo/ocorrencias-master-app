import React, { useState } from 'react';
import axios from 'axios';

const Ronda: React.FC = () => {
  const [data, setData] = useState<Date | null>(null);
  const [horaInicio, setHoraInicio] = useState<Date | null>(null);
  const [horaFim, setHoraFim] = useState<Date | null>(null);
  const [vtr, setVtr] = useState('');
  const [rota, setRota] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const vtrOptions = ['', 'VTR-001', 'VTR-002', 'VTR-003', 'VTR-004', 'VTR-005'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/ronda', {
        data: data?.toISOString().split('T')[0],
        hora_inicio: horaInicio?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        hora_fim: horaFim?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        vtr,
        rota,
        observacoes
      });

      if (response.data.success) {
        setResult('Ronda registrada com sucesso!');
        // Limpar formulário
        setData(null);
        setHoraInicio(null);
        setHoraFim(null);
        setVtr('');
        setRota('');
        setObservacoes('');
      } else {
        setResult('Erro ao registrar ronda');
      }
    } catch (error) {
      console.error('Erro:', error);
      setResult('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ color: '#1e3a8a', marginBottom: '30px' }}>
        Registro de Ronda
      </h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="data">Data</label>
            <input
              type="date"
              id="data"
              value={data ? data.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                if (e.target.value) setData(new Date(e.target.value));
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="horaInicio">Hora de Início</label>
              <input
                type="time"
                id="horaInicio"
                value={horaInicio ? horaInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const [h, m] = e.target.value.split(':');
                    const newDate = new Date();
                    newDate.setHours(Number(h));
                    newDate.setMinutes(Number(m));
                    setHoraInicio(newDate);
                  }
                }}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="horaFim">Hora de Fim</label>
              <input
                type="time"
                id="horaFim"
                value={horaFim ? horaFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const [h, m] = e.target.value.split(':');
                    const newDate = new Date();
                    newDate.setHours(Number(h));
                    newDate.setMinutes(Number(m));
                    setHoraFim(newDate);
                  }
                }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="vtr">VTR</label>
            <select
              id="vtr"
              value={vtr}
              onChange={(e) => setVtr(e.target.value)}
              required
            >
              {vtrOptions.map(opt => (
                <option key={opt} value={opt}>
                  {opt || 'Selecione'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="rota">Rota</label>
            <input
              type="text"
              id="rota"
              value={rota}
              onChange={(e) => setRota(e.target.value)}
              placeholder="Ex: Área A - Área B - Área C"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="observacoes">Observações</label>
            <textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
              placeholder="Descreva qualquer observação relevante durante a ronda..."
            />
          </div>

          <button 
            type="submit" 
            className="btn" 
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Registrando...' : 'Registrar Ronda'}
          </button>
        </form>
      </div>

      {result && (
        <div className="card">
          <div style={{ 
            padding: '15px', 
            borderRadius: '8px',
            backgroundColor: result.includes('sucesso') ? '#d1fae5' : '#fee2e2',
            color: result.includes('sucesso') ? '#065f46' : '#991b1b',
            border: `1px solid ${result.includes('sucesso') ? '#10b981' : '#ef4444'}`
          }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default Ronda; 