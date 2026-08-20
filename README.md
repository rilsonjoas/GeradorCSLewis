# 📜 Gerador de Citações C. S. Lewis

Este é um projeto web interativo que gera citações inspiradoras e profundas do renomado escritor e teólogo C. S. Lewis. A aplicação foi construída com tecnologias modernas, focando em uma experiência de usuário limpa, elegante e responsiva.

**🔗 Acesse a aplicação:** https://cslewis.narniano.com/

## ✨ Visão Geral do Projeto

O objetivo deste projeto é oferecer aos usuários uma forma simples e agradável de explorar a sabedoria de C. S. Lewis. A cada clique, uma nova citação é exibida, juntamente com a fonte (o livro ou obra de origem). Além disso, a aplicação inclui links para compra na Amazon, permitindo que os usuários interessados possam encontrar facilmente os livros mencionados.

Este projeto usa:
-   **Next.js 14:** Utilizando o App Router para uma arquitetura moderna e otimizada.
-   **TypeScript:** Para um código mais robusto e seguro.
-   **Tailwind CSS:** Para estilização rápida e consistente através de classes utilitárias.
-   **Shadcn/UI:** Para componentes de UI acessíveis, reutilizáveis e lindamente projetados, como `Card` e `Button`.
-   **Next/Font:** Para otimização de fontes (Lato e Lora), garantindo performance e uma tipografia elegante.
-   **Design Responsivo:** A interface se adapta perfeitamente a desktops, tablets e dispositivos móveis.
-   **Links de Afiliado:** Integração funcional de links de afiliado para monetização e para guiar o usuário.

## Por que isto existe

C.S. Lewis é um dos autores que mais moldou minha forma de pensar fé, razão e imaginação juntas — dá pra ver isso espalhado pelo resto do que eu construo (o próprio "Narniano" vem daí). Este projeto não nasceu de um problema de mercado, nasceu de vontade de ter um jeito bonito e rápido de topar com uma citação dele, com a fonte certa, e poder repassar isso a quem também se interessa.

É de propósito um projeto pequeno — teto baixo por natureza (um gerador de página única não vira plataforma), e não force nele o que não é. O valor aqui é outro: fazer uma coisa simples com o mesmo cuidado que faria uma grande — tipografia elegante, performance real, responsivo de verdade — porque excelência não é proporcional ao tamanho do projeto. Hoje ele já tem monetização discreta (afiliado Amazon) funcionando e SEO técnico corrigido; a visão de futuro é só isso mesmo: continuar sendo a vitrine pequena e bem-feita que é, sem pressão de crescer além do que faz sentido pra ela.

## Identidade aplicada aqui (2026-08-15)

> Fonte: `Identidade visual geral.md` e `Identidade Visual - Guia Técnico
> (Código).md` no vault. Único projeto que mistura os dois polos de
> propósito — Lewis escreveu Nárnia (Biblioteca) **e** a Trilogia
> Espacial (Céus), e Sehnsucht é conceito dele mesmo. Teto baixo por
> natureza (página única), então poucos itens, sem inflar.

- [x] Moldura no retrato do Lewis (2026-08-20) — borda dourada dupla
      inspirada em `.frame-tondo`, adaptada pro tamanho de avatar deste
      projeto (o original do Guia é 320px, feito pra retrato de
      destaque). Aplicada sempre, não condicional — o próprio Guia
      Técnico já trata `frame-tondo` como padrão geral pra "retratos/
      avatares e citações de autor", não como algo ligado a tema
- [x] Citações sobre anseio/Sehnsucht/céus/eternidade → `.bg-ceus` +
      `.halo-glow` no card da citação (2026-08-20) — 4 de 76 citações
      marcadas com `theme: "ceus"` em `quotes.ts` (achadas por varredura
      de palavra-chave + confirmação de contexto, não a esmo). É a
      única página do portfólio pequeno que já demonstra o sistema
      inteiro num só lugar
- [x] `.signature-italic` no nome da obra de origem de cada citação
      (2026-08-20) — incondicional, aplicado em todas

## Conexões com o cluster A Biblioteca (2026-08-16)

- [ ] **Citação do dia no Lecionário** — espaço rotativo puxando do
      mesmo pool de citações, com link "mais citações" de volta pra cá.
      Ver `lecionario/ROADMAP.md`, seção 4.7 (lado recíproco) — depende
      de confirmar se os dados aqui são exportáveis como JSON simples
- [ ] **Post editorial (Narniano/Instagram, não é item de código aqui)**:
      "os clássicos que Lewis leu, em domínio público" — o próprio Lewis
      não é PD ainda (morreu 1963, só ~2033+), então o Scriptorium não
      pode hospedar texto dele; a saída é conteúdo editorial sobre os
      autores que ele citava (Boécio, padres da igreja) que já são PD,
      linkando pro Scriptorium. Ver `scriptorium-divinum/ROADMAP.md`
- [x] **Rodapé cruzado** (2026-08-20) — `ClusterFooter`, links pra
      Narniano, Bíblia na Arte, Scriptorium e Lecionário. Falta o lado
      recíproco nos outros 3 projetos do cluster (ver
      `lecionario/ROADMAP.md` 4.8)

## 🛠️ Tecnologias Utilizadas

| Tecnologia      | Descrição                                                              |
| --------------- | ---------------------------------------------------------------------- |
| **Next.js**     | Framework React para produção, com renderização no lado do servidor (SSR). |
| **React**       | Biblioteca para construção de interfaces de usuário.                   |
| **TypeScript**  | Superset do JavaScript que adiciona tipagem estática.                  |
| **Tailwind CSS**| Framework CSS "utility-first" para estilização.                      |
| **Shadcn/UI**   | Coleção de componentes de UI reutilizáveis e customizáveis.            |
| **Next/Font**   | Otimização de fontes do Google (Lato & Lora).                           |

## 🚀 Como Executar Localmente

Siga os passos abaixo para rodar o projeto em sua máquina.

**1. Pré-requisitos:**
   - [Node.js](https://nodejs.org/) (versão 18.17 ou superior)
   - [pnpm](https://pnpm.io/) (ou `npm`/`yarn`)

**2. Clone o Repositório:**
   ```bash
   git clone https://github.com/seu-usuario/gerador-citacoes-cs-lewis.git
   cd gerador-citacoes-cs-lewis
   ```

**3. Instale as Dependências:**
   ```bash
   pnpm install
   ```

**4. Configure as Variáveis de Ambiente:**
   - O projeto utiliza um "tag de afiliado" para os links da Amazon. Você pode configurar o seu no arquivo `src/components/QuoteGenerator.tsx`:
     ```typescript
     const affiliateTag = "seu-tag-aqui-20"; // Altere para o seu tag
     ```

**5. Rode o Servidor de Desenvolvimento:**
   ```bash
   pnpm dev
   ```

**6. Abra no Navegador:**
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação em funcionamento.

## 📁 Estrutura do Projeto

A estrutura de pastas principal segue o padrão do App Router do Next.js:

```
.
├── public/
│   └── Lewis.jpg         # Imagem estática de C. S. Lewis
├── src/
│   ├── app/
│   │   ├── globals.css   # Estilos globais e variáveis do tema Shadcn/UI
│   │   ├── layout.tsx    # Layout raiz com fontes configuradas
│   │   └── page.tsx      # Página principal (HomePage)
│   ├── components/
│   │   ├── ui/           # Componentes Shadcn/UI (ex: button.tsx, card.tsx)
│   │   └── QuoteGenerator.tsx # Componente principal da aplicação
│   └── lib/
│       ├── quotes.ts     # Array com as citações de C. S. Lewis
│       └── utils.ts      # Utilitário do Shadcn/UI para `cn()`
└── tailwind.config.ts    # Configuração do Tailwind CSS
```

## 💡 Lógica do Componente `QuoteGenerator`

-   **Estado:** O componente utiliza o hook `useState` para armazenar a citação (`currentQuote`) que está sendo exibida.
-   **Geração Aleatória:** A função `getRandomQuote` seleciona aleatoriamente uma citação do array `lewisQuotes` localizado em `src/lib/quotes.ts`.
-   **Inicialização:** O hook `useEffect` é usado para carregar uma citação inicial assim que o componente é montado.
-   **Interatividade:** O clique no botão "Gerar nova citação" chama a função `generateNewQuote`, que atualiza o estado com uma nova citação aleatória.
-   **Links Dinâmicos:** A fonte de cada citação é um link clicável que direciona o usuário para uma busca na Amazon pelo livro correspondente, já com o tag de afiliado.

## 🎨 Design e Estilização

-   **Fontes:** A combinação da fonte sans-serif **Lato** (para títulos e botões) com a fonte serif **Lora** (para o corpo das citações) cria uma hierarquia visual clara e uma estética clássica e legível.
-   **Tema:** As cores foram definidas no arquivo `globals.css` utilizando variáveis CSS, seguindo o padrão gerado pelo **Shadcn/UI**, o que facilita a customização e a implementação de um tema escuro (dark mode).
-   **Layout:** O layout principal é centralizado vertical e horizontalmente usando Flexbox, garantindo uma apresentação focada e agradável em qualquer dispositivo.
