import { useState, useEffect } from 'react';

interface UpdateInfo {
  hasUpdate: boolean;
  isUpdating: boolean;
  updateApp: () => void;
}

export const useAppUpdate = (): UpdateInfo => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Registrar o Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);

          // Verificar atualizações periodicamente
          const checkForUpdates = () => {
            registration.update();
          };

          // Verificar a cada 5 minutos
          const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

          // Listener para quando uma nova versão está disponível
          registration.addEventListener('updatefound', () => {
            console.log('Nova versão do app disponível!');
            // Só mostra a notificação se não estiver atualizando
            if (!isUpdating) {
              setHasUpdate(true);
            }
          });

          // Listener para quando o Service Worker é atualizado
          const handleControllerChange = () => {
            console.log('Service Worker atualizado!');
            setHasUpdate(false);
            setIsUpdating(false);
            // Recarregar a página para aplicar as atualizações
            window.location.reload();
          };

          // Listener para mensagens do Service Worker
          const handleMessage = (event: MessageEvent) => {
            console.log('Mensagem recebida do Service Worker:', event.data);
            if (event.data && event.data.type === 'UPDATE_READY') {
              console.log('Atualização pronta - recarregando...');
              setHasUpdate(false);
              setIsUpdating(false);
              window.location.reload();
            }
          };

          navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
          navigator.serviceWorker.addEventListener('message', handleMessage);

          // Verificar se já há uma atualização pendente
          if (registration.waiting) {
            console.log('Atualização pendente encontrada!');
            setHasUpdate(true);
          }

          return () => {
            clearInterval(interval);
            navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
            navigator.serviceWorker.removeEventListener('message', handleMessage);
          };
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, [isUpdating]); // Adiciona isUpdating como dependência

  const updateApp = () => {
    setIsUpdating(true);
    setHasUpdate(false); // Esconde a notificação imediatamente
    console.log('Iniciando atualização...');
    
    // Forçar atualização do Service Worker
    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        // Se já temos um controller, envia mensagem para pular espera
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        console.log('Mensagem SKIP_WAITING enviada');
        
        // Fallback: se não receber resposta em 3 segundos, recarrega
        setTimeout(() => {
          if (isUpdating) {
            console.log('Fallback: timeout - recarregando página');
            window.location.reload();
          }
        }, 3000);
      } else {
        // Fallback: recarrega a página diretamente
        console.log('Fallback: recarregando página diretamente');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } else {
      // Fallback para navegadores sem Service Worker
      console.log('Fallback: navegador sem Service Worker');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return {
    hasUpdate,
    isUpdating,
    updateApp
  };
};
