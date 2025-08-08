# 📜 Gerador de Citações C. S. Lewis

Este é um projeto web interativo que gera citações inspiradoras e profundas do renomado escritor e teólogo C. S. Lewis. A aplicação foi construída com tecnologias modernas, focando em uma experiência de usuário limpa, elegante e responsiva.

**🔗 Acesse a aplicação:** https://gerador-cs-lewis.vercel.app/

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
