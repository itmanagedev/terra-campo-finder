# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Build tools for any native deps (rolldown/lightningcss/etc.)
RUN apk add --no-cache python3 make g++

# Install dependencies (better cache)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy source and build
COPY . .
RUN npm run build

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Bring in everything needed to run `vite preview` against the built output.
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/vite.config.ts ./vite.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.output ./.output

EXPOSE 3000

# Serves the production build on 0.0.0.0:3000 (EasyPanel maps this port).
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "3000"]
