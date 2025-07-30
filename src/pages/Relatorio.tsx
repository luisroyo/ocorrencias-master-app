import React, { useState } from 'react';
import axios from 'axios';

const Relatorio: React.FC = () => {
  const [data, setData] = useState<Date | null>(null);
  const [hora, setHora] = useState<Date | null>(null);
  const [vtr, setVtr] = useState('');
  const [local, setLocal] = useState('');
  const [ocorrencia, setOcorrencia] = useState('');
  const [envolvidos, setEnvolvidos] = useState('');
  const [medidas, setMedidas] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const vtrOptions = ['', 'VTR-001', 'VTR-002', 'VTR-003', 'VTR-004', 'VTR-005'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/relatorio', {
        data: data?.toISOString().split('T')[0],
        hora: hora?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        vtr,
        local,
        ocorrencia,
        envolvidos,
        medidas,
        observacoes
      });

      if (response.data.success) {
        setResult(response.data.relatorio_corrigido || response.data.relatorio);
      } else {
        setResult('Erro ao gerar relatório');
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
        Gerador de Relatório
      </h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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

            <div className="form-group">
              <label htmlFor="hora">Hora</label>
              <input
                type="time"
                id="hora"
                value={hora ? hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const [h, m] = e.target.value.split(':');
                    const newDate = new Date();
                    newDate.setHours(Number(h));
                    newDate.setMinutes(Number(m));
                    setHora(newDate);
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
            <label htmlFor="local">Local</label>
            <input
              type="text"
              id="local"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ocorrencia">Ocorrência</label>
            <textarea
              id="ocorrencia"
              value={ocorrencia}
              onChange={(e) => setOcorrencia(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="envolvidos">Envolvidos</label>
            <textarea
              id="envolvidos"
              value={envolvidos}
              onChange={(e) => setEnvolvidos(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="medidas">Medidas Adotadas</label>
            <textarea
              id="medidas"
              value={medidas}
              onChange={(e) => setMedidas(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="observacoes">Observações</label>
            <textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>

          <button 
            type="submit" 
            className="btn" 
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </button>
        </form>
      </div>

      {result && (
        <div className="card">
          <h3>Relatório Gerado:</h3>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace'
          }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default Relatorio; 