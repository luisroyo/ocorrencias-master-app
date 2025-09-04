import React from 'react';

interface UpdateNotificationProps {
  hasUpdate: boolean;
  isUpdating: boolean;
  onUpdate: () => void;
  onForceUpdate?: () => void;
  onCheckForUpdates?: () => void; // Nova prop para verificação manual
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  hasUpdate,
  isUpdating,
  onUpdate,
  onForceUpdate,
  onCheckForUpdates
}) => {
  // Só mostra quando há uma atualização disponível
  if (!hasUpdate) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#2196F3',
      color: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      maxWidth: '350px',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
        🔄 Nova versão disponível!
      </div>
      <div style={{ fontSize: '14px', marginBottom: '12px' }}>
        Uma nova versão do app está disponível. Clique para atualizar.
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={onUpdate}
          disabled={isUpdating}
          style={{
            backgroundColor: 'white',
            color: '#2196F3',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: isUpdating ? 0.7 : 1,
            flex: 1
          }}
        >
          {isUpdating ? '🔄 Atualizando...' : 'Atualizar Agora'}
        </button>

        {onForceUpdate && (
          <button
            onClick={onForceUpdate}
            disabled={isUpdating}
            style={{
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: isUpdating ? 0.7 : 1,
              fontSize: '12px'
            }}
            title="Força atualização completa (limpa cache)"
          >
            🔥 Forçar
          </button>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
