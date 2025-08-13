import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';

interface Occurrence {
  id: number;
  data: string;
  hora: string;
  local: string;
  ocorrencia: string;
  status: string;
}

const OccurrencesList: React.FC = () => {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOccurrences();
  }, []);

  const fetchOccurrences = async () => {
    try {
      const data = await apiFetch('/api/ocorrencias');
      setOccurrences(data.ocorrencias || []);
    } catch (error) {
      console.error('Erro ao buscar ocorrências:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Carregando ocorrências...
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ color: '#1e3a8a', marginBottom: '30px' }}>
        Lista de Ocorrências
      </h1>

      <div className="card">
        {occurrences.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Nenhuma ocorrência encontrada.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Data
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Hora
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Local
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Ocorrência
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {occurrences.map((occurrence) => (
                  <tr key={occurrence.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>
                      {new Date(occurrence.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {occurrence.hora}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {occurrence.local}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {occurrence.ocorrencia.length > 50 
                        ? `${occurrence.ocorrencia.substring(0, 50)}...` 
                        : occurrence.ocorrencia
                      }
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: occurrence.status === 'Resolvida' ? '#d1fae5' : '#fef3c7',
                        color: occurrence.status === 'Resolvida' ? '#065f46' : '#92400e'
                      }}>
                        {occurrence.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Link 
                        to={`/ocorrencias/${occurrence.id}`}
                        style={{
                          color: '#1e3a8a',
                          textDecoration: 'none',
                          fontWeight: '600'
                        }}
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OccurrencesList; 