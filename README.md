# Ocorrências Mobile App

Aplicativo mobile para registro e acompanhamento de ocorrências, integrado a um backend Flask.

## Funcionalidades
- Login com e-mail e senha (token JWT)
- Listagem e detalhamento de ocorrências
- Cadastro e edição de ocorrências
- Busca de colaboradores
- Integração total com API Flask

## Requisitos
- Node.js >= 16
- Expo CLI (`npm install -g expo-cli`)
- Backend Flask rodando e acessível (com CORS liberado)

## Instalação
```sh
npm install
```

## Rodando o app
```sh
npx expo start
```
- Use o Expo Go no celular ou emulador para testar.

## Configuração da API
Edite o arquivo `src/services/api.ts` e ajuste a URL base da API para o endereço do seu backend Flask:
```ts
const API_BASE_URL = 'http://127.0.0.1:5000/api';
```

## Observações
- O backend Flask deve retornar um campo `token` no login para autenticação JWT.
- Endpoints REST devem estar liberados para CORS.
- Não esqueça de criar um usuário válido no backend para testar o login.

## Estrutura de pastas
```
src/
  components/      # Componentes reutilizáveis
  screens/         # Telas do app
  services/        # Serviços de API
  theme/           # Temas e cores
```

---

Desenvolvido por [Seu Nome]. 