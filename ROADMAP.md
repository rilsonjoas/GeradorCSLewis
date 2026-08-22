# Roadmap — Gerador de Citações C. S. Lewis

**Status (2026-08-20):** No ar em `cslewis.narniano.com`. Migrado do Vercel para VPS Hetzner, healthcheck real, monitorado no Uptime Kuma.

Segue o padrão comum documentado em `hetzner-infra/PADRAO-DE-ENGENHARIA.md`.

---

## Status técnico atual

- [x] Deploy no VPS (Docker + Traefik + Let's Encrypt)
- [x] Healthcheck configurado + Uptime Kuma
- [x] 165 citações C.S. Lewis com seleção date-seeded
- [x] Link Amazon (afiliados)
- [x] Seção "Conheça também" com links para outros projetos

---

## Backlog de Produto — Issues e Bugs (levantamento 2026-08-21)

> Levantamento feito pelo Rilson ao usar o produto de verdade.
> Rodada de correções 1 e 2 aplicada em 2026-08-21; validação visual
> feita em `localhost:3001` com build de produção antes de qualquer deploy.

### 🟠 Grave — qualidade visual e conteúdo

- [x] **Título da página exibe a citação do dia, não "Citações de C. S. Lewis" — RESOLVIDO (2026-08-21)**. Causa raiz: a home troca a URL pra `/citacao/[id]` via `router.replace` ao sortear, e a metadata dessa rota sobrescrevia o `<title>` com a citação. Agora: template no layout (`"%s | Citações de C. S. Lewis"`), `<title>` das rotas de citação = nome da obra + marca, e a citação mora na description/OG (onde ela brilha no card de compartilhamento). Bônus: OG image restaurada nas rotas de citação (estava sendo descartada pelo override do openGraph).
- [x] **Fundo da imagem gerada para compartilhamento — RESOLVIDO (2026-08-21)**. Redesign completo do ShareCard: fundo branco-quente (`#fffefb`, a pedido — antes era gradiente branco→rosado), moldura dupla dourada com cantoneiras ✦, retrato em tondo com anel duplo, filigrana separadora, autor em caps espaçadas + obra em itálico-assinatura Cormorant, e só "narniano.com" pequenininho na base central (antes: "CSLEWIS.NARNIANO.COM" grande em caps). Fonte da citação escala por comprimento (56px→29px em 5 faixas) — a maior citação do acervo (408 chars) fecha com folga nos 1080×1080. Achado real: html2canvas ignora `object-fit: cover` e esticava o retrato 300×382 (achatado na PNG) — corrigido com `background-image` + `background-size: cover` em div aninhado, que ele rasteriza certo.
- [x] **Fonte de "Gerador de citações de C. S. Lewis" não conversa com o projeto — RESOLVIDO (2026-08-21)**. Heading redesenhado: overline "GERADOR DE CITAÇÕES" em caps espaçadas + "C. S. Lewis" em Cormorant Garamond semibold (font-display, "A Voz da Tradição" do guia) + filigrana ✦ dourada; borda superior do card migrou pro dourado. Cormorant agora carrega pesos/styles normais+itálico 500-700.

### 🟡 Melhoria — UX

- [x] **"Conheça também" com espaçamento estranho — RESOLVIDO (2026-08-21)**. Reescrito com hierarquia de 3 níveis numa família só (Lato): rótulo caps espaçadas → links uniformes com ✦ dourado em grupos atômicos `flex-wrap` (ornamento viaja junto do link, nunca sobra separador órfão na quebra) → © discreto. **Este footer virou o modelo aprovado do cluster** — replicar no Lecionário, Bíblia na Arte e Scriptorium (registrado nos ROADMAPs dos três em 2026-08-21).
- [x] **Botões A-/A+ entre citação e fonte — RESOLVIDO (2026-08-21)**. Movidos pra baixo dos botões de ação, centralizados (testado também alinhado à direita; o autor preferiu centro).
- [x] **Responsividade mobile — RESOLVIDO (2026-08-21)**. Overline e H1 com `whitespace-nowrap` + tamanhos por breakpoint (não quebram mais em 2 linhas), retrato menor no mobile (80→96→120px), paddings/gaps comprimidos abaixo de `sm`, botões de ação empilham em largura total no mobile e lado a lado no desktop. Validado claro/escuro.

---

## Padrão de Infra (referência)

- Infraestrutura/VPS → `hetzner-infra/PADRAO-DE-ENGENHARIA.md`
- Readiness para produção → `hetzner-infra/PADRAO-DE-ENGENHARIA.md` (SHIELD)
