# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (better cache)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy source and build (TanStack Start → Node server bundle in .output/)
COPY . .
RUN npm run build

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Install only runtime dependencies required by the SSR bundle
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy the built Node server output
COPY --from=builder /app/.output ./.output

EXPOSE 3000

# Run the TanStack Start Node server
CMD ["node", ".output/server/index.mjs"]

