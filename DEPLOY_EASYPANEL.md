# Deploy no EasyPanel

Este projeto está pronto para rodar no EasyPanel via Docker.

## Arquivos relevantes
- `Dockerfile` — build multi-stage (Node 22 alpine) usando `vite.config.node.ts`
- `server.mjs` — servidor Node que serve `dist/client` + SSR de `dist/server/server.js`
- `vite.config.node.ts` — build sem Cloudflare Workers
- `.dockerignore` — exclui `node_modules`, `.env`, `.git`, etc.

## Passo a passo

1. **Crie um App** no EasyPanel → tipo **App** (não Compose).
2. **Source**: aponte para o repositório Git do projeto (branch principal).
3. **Build**: selecione **Dockerfile** (o EasyPanel detecta automaticamente).
4. **Port**: configure a porta exposta para **3000**.
5. **Domains**: adicione o domínio desejado e habilite HTTPS (Let's Encrypt).
6. **Environment**: copie as variáveis de `.env.example` e preencha os valores
   reais (especialmente `SUPABASE_SERVICE_ROLE_KEY`).
7. Clique **Deploy**.

## Observações
- O build roda `npx vite build --config vite.config.node.ts` para gerar
  artefatos compatíveis com Node.js (sem dependências Cloudflare).
- As variáveis `VITE_*` precisam estar presentes **no momento do build**
  (EasyPanel injeta as env vars durante o build do Docker).
- Para atualizar, basta dar push no repositório e clicar em **Rebuild** no
  EasyPanel.

## Healthcheck (opcional)
- Path: `/`
- Porta: `3000`
