import React from 'react';

interface UpdateNotificationProps {
  hasUpdate: boolean;
  isUpdating: boolean;
  onUpdate: () => void;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  hasUpdate,
  isUpdating,
  onUpdate
}) => {
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
      maxWidth: '300px',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
        🔄 Nova versão disponível!
      </div>
      <div style={{ fontSize: '14px', marginBottom: '12px' }}>
        Uma nova versão do app está disponível. Clique para atualizar.
      </div>
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
          opacity: isUpdating ? 0.7 : 1
        }}
      >
        {isUpdating ? '🔄 Atualizando...' : 'Atualizar Agora'}
      </button>
      
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
