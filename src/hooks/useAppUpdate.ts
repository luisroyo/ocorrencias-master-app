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
            setHasUpdate(true);
          });

          // Listener para quando o Service Worker é atualizado
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service Worker atualizado!');
            setHasUpdate(false);
            setIsUpdating(false);
            // Recarregar a página para aplicar as atualizações
            window.location.reload();
          });

          return () => clearInterval(interval);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  const updateApp = () => {
    setIsUpdating(true);
    // Forçar atualização do Service Worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return {
    hasUpdate,
    isUpdating,
    updateApp
  };
};
