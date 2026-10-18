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

## Resiliência: o que fazer quando as APIs do cluster falham (2026-10-17)

**Política do cluster para quando uma API de que este projeto depende falha** (mapa completo em `CONTRATOS-ENTRE-PROJETOS.md`, seção 10, no repositório de infraestrutura, que é privado):
1. **Card "do dia": some inteiro** (sem título solto, sem espaço reservado, sem erro de JavaScript) e **nunca** mostra conteúdo substituto, porque o "do dia" tem de ser o mesmo item em todo o cluster. Permitido reaproveitar o último valor bom **da mesma data**.
2. **Sorteio ou lista: fallback permitido** (qualquer item do acervo serve): é o caso do Gerador, com uma cópia embutida vigiada pelo canário.
3. **Falha de API nunca vira 404** numa página que existe: 500 ou 503, que o crawler repete.
4. **Toda chamada tem limite de tempo**: uma API lenta é pior que uma fora do ar.
5. **Esconder em silêncio exige um vigia**: o canário do cluster confere o formato das rotas de hora em hora.

**Estado deste projeto.** O Gerador é o único consumidor **com fallback**, e a política o permite porque o sorteio aceita qualquer citação do acervo: o servidor guarda a lista em memória
(10 min), usa a última lista boa se a API cair e, se acabou de subir, uma **cópia embutida** (`src/data/lewis-quotes.snapshot.json`). **Verificado com a imagem real de produção** em
contêineres descartáveis (API fora: sorteio 200 da reserva, citação da cópia 200, sitemap com 157 URLs; API lenta: 1ª chamada 3,09 s e a seguinte 8 ms). Detalhes e a decisão de manter a cópia:
`README.md`, seção "Integrações" (e `CONTRATOS-ENTRE-PROJETOS.md`, 2.7).

**Itens abertos:**
- [ ] **R6b (média): regerar a cópia embutida automaticamente** (PR gerado quando o canário acusar deriva, ou uma verificação agendada). Hoje: `npm run quotes:sync`, revisar o diff, publicar.
- [ ] **Medir a janela pós-reinício do VPS** (quanto tempo o Gerador fica sem alcançar o Scriptorium depois de um reinício; não há `depends_on` entre eles). Se for longa, a cópia ganha importância; se for de segundos, reavaliar o custo.
- [ ] **Procedimento ao retirar uma citação do Scriptorium:** regerar a cópia (`npm run quotes:sync`) e publicar; o canário acusa em até 1 h se for esquecido.

## Qualidade de Conteúdo (2026-08-22)

Padrão cross-projeto: `Padrão de Qualidade de Conteúdo.md` no vault
(princípio #7 de `Filosofia e Padrões de Engenharia.md`). Risco
específico deste projeto: **C.S. Lewis é um dos autores mais
mal-citados da internet** — frases nunca escritas por ele circulam com
atribuição confiante há décadas (o caso mais famoso é a "citação da
hospitalidade", nunca encontrada em nenhuma obra dele). Hoje cada
citação tem `source` (título do livro) em `src/lib/quotes.ts`, mas
não existe processo documentado de verificação — `source` sozinho não
prova que a frase está de fato naquele livro, só registra de onde ela
*deveria* vir.

- [ ] **Auditoria de verificação das 165 citações** — confirmar cada
      uma contra uma edição real (Cristianismo Puro e Simples, Os
      Quatro Amores, etc.), não contra site agregador de frases. Pode
      ser incremental (lote por lote), mas fica registrado aqui como
      dívida de conteúdo até estar 100% verificado.
- [ ] Quando adicionar citação nova: só entra com o trecho confirmado
      textualmente na obra — mesma régua do rodapé de citação usado em
      [[Bíblia na Arte]] (autor, obra, ano).
- [ ] Considerar guardar capítulo/localização além do título do livro,
      pra facilitar reverificação futura sem precisar reler a obra
      inteira de novo.

---

## Backlog de Produto — Issues e Bugs (levantamento 2026-08-21)

> Levantamento feito pelo Rilson ao usar o produto de verdade.
> Rodada de correções 1 e 2 aplicada em 2026-08-21; validação visual
> feita em `localhost:3001` com build de produção antes de qualquer deploy.

### 🟠 Grave — qualidade visual e conteúdo

- [x] **Título da página exibe a citação do dia, não "Citações de C. S. Lewis" — RESOLVIDO (2026-08-21)**. Causa raiz: a home troca a URL pra `/citacao/[id]` via `router.replace` ao sortear, e a metadata dessa rota sobrescrevia o `<title>` com a citação. Agora: template no layout (`"%s | Citações de C. S. Lewis"`), `<title>` das rotas de citação = nome da obra + marca, e a citação mora na description/OG (onde ela brilha no card de compartilhamento). Bônus: OG image restaurada nas rotas de citação (estava sendo descartada pelo override do openGraph).
- [x] **Fundo da imagem gerada para compartilhamento — RESOLVIDO (2026-08-21)**. Redesign completo do ShareCard: fundo branco-quente (`#fffefb`, a pedido — antes era gradiente branco→rosado), moldura dupla dourada com cantoneiras ✦, retrato em tondo com anel duplo, filigrana separadora, autor em caps espaçadas + obra em itálico-assinatura Cormorant, e só "narniano.com" pequenininho na base central (antes: "CSLEWIS.NARNIANO.COM" grande em caps). Fonte da citação escala por comprimento (56px→29px em 5 faixas) — a maior citação do acervo (408 chars) fecha com folga nos 1080×1080. Achado real: html2canvas ignora `object-fit: cover` e esticava o retrato 300×382 (achatado na PNG) — corrigido com `background-image` + `background-size: cover` em div aninhado, que ele rasteriza certo.
- [x] **Fonte de "Gerador de citações de C. S. Lewis" não conversa com o projeto — RESOLVIDO (2026-08-21)**. Heading redesenhado: overline "GERADOR DE CITAÇÕES" em caps espaçadas + "C. S. Lewis" em Cormorant Garamond semibold (font-display, "A Voz da Tradição" do guia) + filigrana ✦ dourada; borda superior do card migrou pro dourado. Cormorant agora carrega pesos/styles normais+itálico 500-700.

### 🟠 Aberto — encontrado na validação do layout (2026-10-16)

> Dois bugs que apareceram ao medir o layout e **não** são do layout. Nenhum
> foi corrigido aqui; os dois são pré-existentes (confirmado rodando o mesmo
> script de medição contra o código original, via `git stash`).

- [x] **Erro de hydration em produção: React #418 + #423 em `/` e em `/citacao/[id]` — RESOLVIDO (2026-10-16)**. Causa raiz: **não era nenhuma das três suspeitas** que eu tinha anotado aqui (`new Date().getFullYear()` no `ClusterFooter`, `next-themes` sem `suppressHydrationWarning` — que já tinha, `ShareCard` com `fixed left-[-9999px]`). Era o `<script dangerouslySetInnerHTML>` do opt-out de anúncios no `<head>` do `RootLayout`: o servidor o renderiza com conteúdo vazio, o cliente hidrata com o `__html`, o React detecta ("Prop `dangerouslySetInnerHTML` did not match. Server: \"\"") e descarta a árvore inteira. O `next dev` localiza em `at script > at head > at html > at RootLayout`. Convertido para `next/script`.
  - **Havia um segundo erro escondido atrás do primeiro.** O `defer` do script do Umami também não bate (`Server: null` / `Client: true`, atributo booleano não serializado), mas ficava invisível porque o React aborta a hidratação no primeiro erro — corrigido o `dangerouslySetInnerHTML`, a hidratação avançou e bateu nele. Convertido para `next/script strategy="afterInteractive"`. O loader do AdSense (`async src`) não dá descasamento e segue como `<script>` puro.
  - **`beforeInteractive` e não `afterInteractive` no opt-out**, para o script voltar ao HTML servido e continuar vencendo o loader `async` do AdSense — que é a ordem original. Verificado no HTML servido: a estrutura do `<head>` ficou igual à de produção.
  - O efeito real era maior do que o erro no console: **todo o HTML servido era jogado fora e remontado no cliente**.
  - Verificado sem regressão de monetização/analytics: opt-out inline no `<head>`, Umami carregando com o `website-id` certo, e contagem de pageviews idêntica entre o build antigo e o novo na rota `/citacao/[id]` (1 send nos dois). Na home a produção manda 2 pageviews e o build local 1 — é o `router.replace` pós-sorteio que não acontece em localhost por causa do CORS, não a correção.
  - Nota de método: a primeira leitura acusou `google_top_exp.js?fcd=true` como sintoma de opt-out perdido. **Era falso** — 5 runs de produção e 5 do build novo deram `top_exp=nao` em todos; é A/B do Google. Registrado aqui porque a infra já tem um incidente documentado sobre "diagnóstico incompleto na primeira ocorrência = recaída garantida".
- [ ] **Não dá para ver citação real na home em localhost.** A API do Scriptorium responde `vary: Origin` + `access-control-allow-credentials: true` mas **sem `access-control-allow-origin` para origem desconhecida** — a allowlist só tem `https://cslewis.narniano.com`. Verificado: `localhost:3000` e `localhost:3399` recebem resposta sem o header, e o `fetch` no browser falha com `Failed to fetch` (enquanto `curl` na mesma máquina funciona, 200 OK). Resultado: em dev a home fica eternamente no estado vazio ("Clique no botão abaixo…"), que é **o estado de menor altura do card** — medir o layout nele dá um número otimista demais. Duas saídas: (a) liberar `http://localhost:3000` na allowlist CORS do Scriptorium (origem só de desenvolvimento, sem risco); (b) testar layout pela rota `/citacao/[id]`, que busca no servidor e **funciona em localhost**, já que não passa por CORS. Isso é a mesma limitação de "não existe staging" registrada na nota do vault.

### 🟡 Melhoria — UX

- [x] **Rodapé "Conheça também" só aparecia com rolagem no desktop — RESOLVIDO (2026-10-16)**. Relatado em 2026-10-14 e confirmado medindo em Chrome headless contra o build de produção. A página pedia **864px de altura** com qualquer citação (609 do card + 80 de `pt-20` + 48 de margem morta do AdUnit + 36 do `mt-9` do rodapé + 67 do rodapé + 24 de `pb-6`) — ou seja, só monitor 1080p com browser magro via; notebook 1366×768 (~590px úteis) empurrava o rodapé 274px abaixo da dobra. Duas causas, uma delas bug:
  - **`AdUnit` com caixa de 0px e 48px de margem.** O `PageShell` chama `<AdUnit />` sem `slot`. Sem `data-ad-slot` o AdSense não processa o `<ins>` e nunca escreve `data-ad-status`, então o `MutationObserver` esperava um evento que não vinha, `isUnfilled` nunca virava `true` e o `return null` nunca disparava. O comentário no arquivo afirmava que o slot ausente levava a `unfilled` — medi e é falso. Agora, sem `slot`, o componente não renderiza nada. **48px recuperados.**
  - **Coluna de três faixas com o miolo em `flex-1`** e `ClusterFooter` no fim do `flex`. Ritmo vertical do card apertado só a partir de `lg:` (retrato 120→104px, `py-6`→`py-5`, `gap-6`→`gap-4`, `mb-8`→`mb-5`, `pt-20`→`pt-12`). **-144px no total; a página desce de 864px para 726px com citação curta.**
  - Duas decisões que parecem óbvias e não são. **`min-h-screen`, nunca `h-screen`/`overflow-hidden`**: altura travada corta conteúdo em A+, em 200% de zoom de texto e em celular deitado — é o SC 1.4.10 (Reflow) da auditoria de 2026-09-25 voltando. E o miolo centraliza por **`my-auto` no filho, não `justify-center` no pai**: `justify-content: center` num flex que não cabe empurra o estouro pros dois lados e o topo do card fica inalcançável pela rolagem. Verificado: topo e rodapé alcançáveis em todos os tamanhos testados.
  - **Alturas reais medidas depois da correção** (Chrome headless, build de produção): citação curta (44ch) 726px · média (330ch) 850px · mais longa do acervo (408ch, "Surpreendido pela Alegria") 882px · essa mesma no A+ (36px) 1106px. O rodapé entra na dobra sozinho a partir dessas alturas. **Notebook 1366×768 continua rolando com citação média ou longa** — decisão consciente: cabe o rodapé sem encolher o card até o ponto de perder o retrato.
  - Mobile não mudou nada: abaixo de `lg` nenhum breakpoint novo aplica. O bônus do AdUnit morto vale para qualquer largura.
- [x] **"Conheça também" com espaçamento estranho — RESOLVIDO (2026-08-21)**. Reescrito com hierarquia de 3 níveis numa família só (Lato): rótulo caps espaçadas → links uniformes com ✦ dourado em grupos atômicos `flex-wrap` (ornamento viaja junto do link, nunca sobra separador órfão na quebra) → © discreto. **Este footer virou o modelo aprovado do cluster** — replicar no Lecionário, Bíblia na Arte e Scriptorium (registrado nos ROADMAPs dos três em 2026-08-21).
- [x] **Botões A-/A+ entre citação e fonte — RESOLVIDO (2026-08-21)**. Movidos pra baixo dos botões de ação, centralizados (testado também alinhado à direita; o autor preferiu centro).
- [x] **Responsividade mobile — RESOLVIDO (2026-08-21)**. Overline e H1 com `whitespace-nowrap` + tamanhos por breakpoint (não quebram mais em 2 linhas), retrato menor no mobile (80→96→120px), paddings/gaps comprimidos abaixo de `sm`, botões de ação empilham em largura total no mobile e lado a lado no desktop. Validado claro/escuro.

---

## Padrão de Infra (referência)

- Infraestrutura/VPS → `hetzner-infra/PADRAO-DE-ENGENHARIA.md`
- Readiness para produção → `hetzner-infra/PADRAO-DE-ENGENHARIA.md` (SHIELD)

---

## Marketing e Distribuição (2026-08-22)

> Teto baixo por natureza (página única), mas custo de divulgação quase zero porque os canais já existem.

### Canal natural: @narnianoexistencialista

- O perfil (manual completo no Obsidian, `12 - Redes sociais`) É o funil deste gerador: citações de Lewis + reflexão são o conteúdo do feed, e o gerador é a ferramenta do público
- Stories/reels usando o próprio render das citações apontando pro site

### Loop embutido no produto

- "Baixar como imagem" (html2canvas) já funciona — cada imagem compartilhada é anúncio do gerador
- [ ] Conferir se toda imagem exportada carrega a marca discreta (`narniano.com`) — validar o fluxo de download, hoje só o ShareCard garante isso

### Afiliado Amazon (tag `rilson-20`, já no ar)

- [x] Vincular o livro citado (Mero Cristianismo, O Problema do Sofrimento...) sob cada citação — monetização coerente com o conteúdo, não intrusiva. **Concluído** — `affiliateUrl` vem da API do Scriptorium (`/api/v1/quotes`, com `tag=rilson-20` por obra) e `QuoteGenerator.tsx` renderiza o CTA quando o link existe (verificado 2026-09-24). Citações sem link (ex.: Spurgeon, domínio público) não exibem o CTA.

### Pinterest (segunda frente)

- Cards de citação são formato nativo do Pinterest e o pin vive anos — tráfego composto pro teto baixo

### Cluster A Biblioteca

- Rodapé cruzado já no ar nos projetos irmãos; manter o bloco "Conheça também" como padrão nos próximos sites
