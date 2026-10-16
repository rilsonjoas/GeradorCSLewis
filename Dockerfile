FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# `--legacy-peer-deps` é obrigatório aqui pelo mesmo motivo dos workflows:
# sem ele o npm 10 quebra em `#loadPeerSet` (arborist) ao resolver o grafo de
# peers do vitest — "Cannot read properties of null (reading 'edgesOut')".
# Este estágio instala devDependencies (o runner não recebe node_modules), e o
# vitest é justamente a dependência com o grafo conflitante.
# ACHADO 2026-10-16: este `npm ci` estava SEM a flag. Como o vitest só entrou no
# lockfile no commit 692f99c (que ainda não tinha sido publicado), o problema
# estava latente e só apareceria no primeiro deploy que trouxesse esse commit —
# build quebrado DENTRO do ssh-action, na VPS. Reproduzido e confirmado local
# antes de corrigir: `npm ci` → ERESOLVE; `npm ci --legacy-peer-deps` → ok.
RUN npm ci --legacy-peer-deps

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
