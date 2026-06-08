# Deploy no EasyPanel

## ⚠️ Causa mais comum do erro "Something went wrong"

As variáveis `VITE_*` precisam estar disponíveis **durante o build do Docker**, não só em runtime. No EasyPanel você precisa configurar elas em **DOIS lugares**:

1. **Build Args** (para o `vite build` embutir no bundle)
2. **Environment Variables** (para o servidor Node em runtime)

---

## Passo a passo

### 1. Criar o App
- EasyPanel → **Create** → **App**
- Conecte ao seu repositório Git
- Build Method: **Dockerfile**
- Porta exposta: **3000**

### 2. Configurar Build Args (CRÍTICO)
Em **Build → Build Args**, adicione:

```
VITE_SUPABASE_URL=https://wgdifpxqinrevzmuaqwn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJI...sua_chave_anon
VITE_SUPABASE_PROJECT_ID=wgdifpxqinrevzmuaqwn
```

> Sem isso o build até passa, mas o site quebra em SSR com "Something went wrong".

### 3. Configurar Environment Variables (runtime)
Em **Environment**, adicione:

```
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
SUPABASE_URL=https://wgdifpxqinrevzmuaqwn.supabase.co
SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJI...sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...sua_service_role_key
VITE_SUPABASE_URL=https://wgdifpxqinrevzmuaqwn.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJI...sua_chave_anon
```

> A `SUPABASE_SERVICE_ROLE_KEY` é necessária para criar usuários no painel admin.

### 4. Domínio e HTTPS
- **Domains** → adicione seu domínio → ative HTTPS (Let's Encrypt)

### 5. Deploy
Clique em **Deploy** e acompanhe os logs. Se aparecer:
```
ERRO: VITE_SUPABASE_URL não definida nos Build Args do EasyPanel
```
volte ao passo 2.

---

## Diagnóstico rápido

| Sintoma | Causa provável |
|---|---|
| "Something went wrong" em todas as páginas | Faltou Build Args `VITE_*` |
| Login falha mas página abre | Faltou env vars de runtime |
| Painel admin não cria usuários | Faltou `SUPABASE_SERVICE_ROLE_KEY` |
| 502 / container reinicia | Verifique se a porta 3000 está exposta |
