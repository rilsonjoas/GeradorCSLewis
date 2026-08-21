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

### 🟠 Grave — qualidade visual e conteúdo

- [ ] **Título da página exibe a citação do dia, não "Citações de C. S. Lewis"** — corrigir `<title>` da página para ser descritivo e estático. A citação pode aparecer como meta description ou subtitle, não como title.
- [ ] **Fundo da imagem gerada para compartilhamento** — o fundo atual não conversa com o Design Narniano. Usar paleta Narniano (gradiente suave ou textura sutil compatível com o estilo do projeto). Deve ser fácil de compartilhar (boa legibilidade, não poluído).
- [ ] **Fonte de "Gerador de citações de C. S. Lewis" não conversa com o projeto** — verificar se usa as fontes do Design Narniano (`Cormorant Garamond`, `EB Garamond` ou equivalente literário). Corrigir heading principal.

### 🟡 Melhoria — UX

- [ ] **"Conheça também" com espaçamento estranho** — a seção de links para outros projetos (Narniano, Bíblia na Arte, Scriptorium, Lecionário) tem espaçamento inconsistente. Usar o mesmo componente/estilo do Lecionário quando corrigido lá. (Componente compartilhado — corrigir nos dois ao mesmo tempo.)

---

## Padrão de Infra (referência)

- Infraestrutura/VPS → `hetzner-infra/PADRAO-DE-ENGENHARIA.md`
- Readiness para produção → `hetzner-infra/PADRAO-DE-ENGENHARIA.md` (SHIELD)
