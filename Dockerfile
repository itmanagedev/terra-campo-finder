# syntax=docker/dockerfile:1.6

# ============================================
# Stage 1: Build
# ============================================
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .

# Build args - precisam ser passados no EasyPanel (Build > Build Args)
# As variáveis VITE_* SÃO embutidas no bundle no momento do build,
# por isso precisam estar disponíveis aqui (não basta defini-las em runtime).
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ARG SUPABASE_URL
ARG SUPABASE_PUBLISHABLE_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID
ENV SUPABASE_URL=$SUPABASE_URL
ENV SUPABASE_PUBLISHABLE_KEY=$SUPABASE_PUBLISHABLE_KEY

# Falha cedo com mensagem clara se faltar variável crítica de build
RUN test -n "$VITE_SUPABASE_URL" || (echo "ERRO: VITE_SUPABASE_URL não definida nos Build Args do EasyPanel" && exit 1)
RUN test -n "$VITE_SUPABASE_PUBLISHABLE_KEY" || (echo "ERRO: VITE_SUPABASE_PUBLISHABLE_KEY não definida nos Build Args do EasyPanel" && exit 1)

# Build com config Node.js (sem Cloudflare) para rodar no EasyPanel
RUN npx vite build --config vite.config.node.ts

# Prune dev dependencies for the runtime image
RUN npm prune --omit=dev --legacy-peer-deps

# ============================================
# Stage 2: Runtime
# ============================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.mjs ./server.mjs

EXPOSE 3000

CMD ["node", "server.mjs"]
