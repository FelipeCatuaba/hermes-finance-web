# HERMES Frontend (Angular)

Frontend oficial do HERMES em Angular 17 standalone, com design tokens orientados por `docs/DESIGN.md` e autenticação via Clerk (JWT para backend Spring Resource Server).

## Setup

1. Instale dependências:
   ```bash
   npm install
   ```
2. Configure runtime env em `src/assets/env.js` (ou injete `window.__HERMES_ENV__` no deploy):
   - `API_BASE_URL`
   - `CLERK_PUBLISHABLE_KEY`
   - `CORS_ORIGIN`
3. Rode local:
   ```bash
   npm start
   ```

## Scripts

- `npm start` - desenvolvimento
- `npm run build` - build produção
- `npm run lint` - lint TypeScript
- `npm test` - testes unitários

## Arquitetura

- Rotas públicas: `/`, `/auth`
- Rotas protegidas: `/dashboard`, `/settings`
- `DashboardFacade` usa `/api/health` real + fallback mock para snapshot
- `SettingsFacade` mock tipado encapsulado para troca por endpoints reais

## Notas de autenticação

O pacote `@clerk/angular` não está disponível no npm. A integração foi implementada com `@clerk/clerk-js` encapsulada em `AuthSessionService`, mantendo baixo acoplamento e contrato JWT estável.