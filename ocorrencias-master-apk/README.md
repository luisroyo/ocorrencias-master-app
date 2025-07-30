# Ocorrências Mobile App

Aplicativo mobile para registro e acompanhamento de ocorrências, integrado a um backend Flask.

## Funcionalidades
- Login com e-mail e senha (token JWT)
- Salvamento automático do e-mail após login (campo de e-mail já aparece preenchido na próxima vez)
- Listagem e detalhamento de ocorrências (dados reais da API)
- Cadastro e edição de ocorrências
- Busca de colaboradores (autocomplete via API)
- Preenchimento automático de campos (endereços, colaboradores)
- Envio de relatórios via WhatsApp (nativo e web)
- Integração total com API Flask (endpoints REST)

## Requisitos
- Node.js >= 16
- Expo CLI (`npm install -g expo`)
- Backend Flask rodando e acessível (com CORS liberado)
- @react-native-async-storage/async-storage (instalado automaticamente via npm install)

## Permissões Android
O app solicita as seguintes permissões:
- INTERNET
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE
- VIBRATE
- SYSTEM_ALERT_WINDOW

## Instalação
```sh
npm install
```

## Rodando o app
```sh
npx expo start
```
- Use o Expo Go no celular ou emulador para testar.

## Build de produção
Para gerar um APK/AAB de produção:
```sh
eas build -p android --profile production
```
Para iOS:
```sh
eas build -p ios --profile production
```

## Configuração da API
Edite o arquivo `src/services/api.ts` e ajuste a URL base da API para o endereço do seu backend Flask:
```ts
const API_BASE_URL = 'http://127.0.0.1:5000/api';
```

## Endpoints utilizados
- `POST /api/ocorrencias/analisar-relatorio` — Análise e correção de relatório
  - Payload: `{ "texto_relatorio": "..." }`
- `GET /api/colaboradores?nome=...` — Busca de colaboradores (autocomplete)
- `GET /api/logradouros_view?nome=...` — Busca de endereços (autocomplete)
- `GET /api/ocorrencias/historico` — Listagem de ocorrências (com filtros opcionais)
- `GET /ocorrencias/{id}` — Detalhes de ocorrência

## Exemplo de uso dos serviços
```ts
// Analisar relatório
const resp = await analisarRelatorio(token, texto_relatorio);
// Buscar colaboradores
const resp = await buscarColaboradores('João', token);
// Buscar endereços
const resp = await buscarEnderecos('Rua', token);
// Listar ocorrências
const resp = await listarOcorrencias(token, { status: 'Pendente' });
// Detalhe de ocorrência
const resp = await detalheOcorrencia(token, 123);
```

## Observações
- O backend Flask deve retornar um campo `token` no login para autenticação JWT.
- Sempre envie o token JWT no header Authorization: `Bearer <token>`.
- Endpoints REST devem estar liberados para CORS.
- Não esqueça de criar um usuário válido no backend para testar o login.

## FAQ
- **O ícone e nome do app não aparecem no Expo Go:** Isso é normal, só aparecem em builds instalados (APK/AAB/IPA).
- **Como limpar o e-mail salvo?** Basta apagar o campo de e-mail e fazer login com outro e-mail.
- **Como enviar relatório pelo WhatsApp?** O app tenta abrir o WhatsApp nativo, se não houver, abre o WhatsApp Web.

## Estrutura de pastas
```
src/
  components/      # Componentes reutilizáveis
  screens/
    Relatorio/
      index.tsx    # Tela de relatório
      styles.ts    # Estilos da tela de relatório
    Login/
      index.tsx    # Tela de login
      styles.ts    # Estilos da tela de login
    OccurrencesList/
      index.tsx    # Tela de lista de ocorrências
      styles.ts    # Estilos da tela de lista de ocorrências
    OccurrenceDetail/
      index.tsx    # Tela de detalhes da ocorrência
      styles.ts    # Estilos da tela de detalhes da ocorrência
    RelatorioCorrigido/
      index.tsx    # Tela de relatório corrigido
      styles.ts    # Estilos da tela de relatório corrigido
    ...outras telas (cada uma em sua pasta)
  services/        # Serviços de API
  theme/           # Temas e cores
```

---

Desenvolvido por Luis Eduardo Rodrigues Royo. 