import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

interface Occurrence {
  id: number;
  data: string;
  hora: string;
  vtr: string;
  local: string;
  ocorrencia: string;
  envolvidos: string;
  medidas: string;
  observacoes: string;
  status: string;
}

const OccurrenceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOccurrence();
    }
  }, [id]);

  const fetchOccurrence = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/ocorrencias/${id}`);
      setOccurrence(response.data.ocorrencia);
    } catch (error) {
      console.error('Erro ao buscar ocorrência:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Carregando detalhes da ocorrência...
        </div>
      </div>
    );
  }

  if (!occurrence) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Ocorrência não encontrada.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1e3a8a', margin: 0 }}>
          Detalhes da Ocorrência #{occurrence.id}
        </h1>
        <Link 
          to="/ocorrencias"
          style={{
            color: '#1e3a8a',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          ← Voltar à lista
        </Link>
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <strong>Data:</strong> {new Date(occurrence.data).toLocaleDateString('pt-BR')}
          </div>
          <div>
            <strong>Hora:</strong> {occurrence.hora}
          </div>
          <div>
            <strong>VTR:</strong> {occurrence.vtr}
          </div>
          <div>
            <strong>Status:</strong> 
            <span style={{
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600',
              marginLeft: '8px',
              backgroundColor: occurrence.status === 'Resolvida' ? '#d1fae5' : '#fef3c7',
              color: occurrence.status === 'Resolvida' ? '#065f46' : '#92400e'
            }}>
              {occurrence.status}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <strong>Local:</strong>
          <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            {occurrence.local}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <strong>Ocorrência:</strong>
          <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
            {occurrence.ocorrencia}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <strong>Envolvidos:</strong>
          <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
            {occurrence.envolvidos}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <strong>Medidas Adotadas:</strong>
          <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
            {occurrence.medidas}
          </div>
        </div>

        {occurrence.observacoes && (
          <div style={{ marginBottom: '20px' }}>
            <strong>Observações:</strong>
            <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
              {occurrence.observacoes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OccurrenceDetail; 