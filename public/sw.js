const CACHE_NAME = 'ocorrencias-v1.0.5';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/assets/icon-512.png',
  '/assets/icon-1024.png'
];

let isInstalling = false;

// Install event - cache resources
self.addEventListener('install', (event) => {
  if (isInstalling) return; // Evita instalações duplicadas
  
  isInstalling = true;
  console.log('Service Worker instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Força a ativação imediata do novo Service Worker
        console.log('Pulando espera e ativando imediatamente...');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Erro na instalação:', error);
        isInstalling = false;
      })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  // Para arquivos JavaScript e CSS, sempre busca da rede primeiro
  if (event.request.url.includes('.js') || event.request.url.includes('.css')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cacheia a nova resposta
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Se falhar, tenta do cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Para outros recursos, usa estratégia cache-first
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se encontrou no cache, retorna
        if (response) {
          return response;
        }
        
        // Se não encontrou, busca da rede
        return fetch(event.request).then((response) => {
          // Não cacheia se não for uma resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clona a resposta para poder cachear
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativando...');
  isInstalling = false;
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Toma controle de todas as páginas abertas
      console.log('Tomando controle de todas as páginas...');
      return self.clients.claim();
    })
  );
});

// Listener para mensagens do app
self.addEventListener('message', (event) => {
  console.log('Mensagem recebida no Service Worker:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Recebida mensagem SKIP_WAITING - pulando espera...');
    self.skipWaiting().then(() => {
      console.log('skipWaiting() executado com sucesso');
      // Notifica todos os clientes sobre a atualização
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'UPDATE_READY' });
        });
      });
    });
  }
  
  // Nova mensagem para forçar atualização
  if (event.data && event.data.type === 'FORCE_UPDATE') {
    console.log('Forçando atualização...');
    // Limpa todos os caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deletando cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Notifica todos os clientes
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'FORCE_UPDATE_READY' });
        });
      });
    });
  }
}); 