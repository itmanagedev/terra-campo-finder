# syntax=docker/dockerfile:1.6

# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instala dependências de build necessárias para alguns pacotes nativos
RUN apk add --no-cache libc6-compat python3 make g++

# Copia manifestos e instala dependências
COPY package.json package-lock.json* bun.lockb* ./
RUN npm install --legacy-peer-deps

# Copia o restante do projeto e gera o build de produção
COPY . .
RUN npm run build

# ============================================
# Stage 2: Runtime
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copia apenas o necessário para servir o app
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/vite.config.ts ./vite.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000

# Serve a aplicação usando o preview do Vite
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "3000"]
