import type { Metadata } from "next";
import Script from "next/script"; // CORREÇÃO 2026-10-16 — ver o comentário no <head>
import { Lato, Lora, Cormorant_Garamond } from "next/font/google"; // Importar fontes
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

// Configurar as fontes
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato", // Para usar com Tailwind
});

const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "700"],
  variable: "--font-lora", // Para usar com Tailwind
});

// Fonte de destaque do Design Narniano (--font-display) — "A Voz da
// Tradição" no guia: títulos e o .signature-italic do nome da obra.
// Não substitui Lato/Lora no corpo.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cslewis.narniano.com"),
  // Título descritivo e estático — a citação em tela NUNCA vira <title>
  // (nem via navegação client-side pra /citacao/[id]); ela mora na
  // description/OG. Template dá marca consistente nas rotas filhas.
  title: {
    default: "Gerador de Citações de C. S. Lewis",
    template: "%s | Citações de C. S. Lewis",
  },
  description:
    "Gere citações inspiradoras de C. S. Lewis sobre fé, razão e vida cristã — com sugestão de livros do autor pra ler mais.",
  icons: {
    icon: '/Lewis.png',
  },
  openGraph: {
    title: "Gerador de Citações C. S. Lewis",
    description: "Gere citações inspiradoras de C. S. Lewis sobre fé, razão e vida cristã.",
    type: "website",
    locale: "pt_BR",
    images: ["/Lewis.png"],
  },
  twitter: {
    card: "summary",
    title: "Gerador de Citações C. S. Lewis",
    description: "Gere citações inspiradoras de C. S. Lewis sobre fé, razão e vida cristã.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${lato.variable} ${lora.variable} ${cormorant.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Google AdSense */}
        <meta name="google-adsense-account" content="ca-pub-5482566824255473" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5482566824255473"
          crossOrigin="anonymous"
        />
        {/* Opt-out de anúncios automáticos invasivos no nível da página.

            CORREÇÃO 2026-10-16 — este era o React #418/#423 de hydration.
            Este `<script dangerouslySetInnerHTML>` dentro do `<head>` é
            renderizado pelo servidor com conteúdo VAZIO e o cliente hidrata
            com o conteúdo do `__html`; o React detecta a diferença
            ("Prop `dangerouslySetInnerHTML` did not match. Server: \"\"") e
            descarta a árvore inteira, remontando tudo no cliente. O
            aviso do `next dev` aponta `at script > at head > at html > at
            RootLayout` — esta era a única origem.

            `next/script` é a forma canônica de carregar script de terceiros
            no App Router e resolve: ele devolve o script ao HTML inicial
            sem que exista árvore de hidratação para comparar, e o erro some
            sem `suppressHydrationWarning` — que aqui só encobriria o
            sintoma.

            `strategy="beforeInteractive"` e não `afterInteractive`: este
            script existe para o opt-out valer ANTES de o AdSense decidir
            o que exibir, e o loader (`adsbygoogle.js`) é `async`. Com
            `afterInteractive` o opt-out passaria a rodar depois da
            hidratação, inverter essa ordem. Não medi quebra — medi a
            ordem do script no HTML servido e ela é a mesma da produção com
            `beforeInteractive` — mas trocar a ordem de algo que depende de
            estar pronto antes do terceiro party, sem necessidade, é o tipo
            de mudança que só aparece na fatura de anúncios.

            Os outros dois scripts (loader do AdSense e Umami) não têm
            `dangerouslySetInnerHTML`, então supus que não dessem
            descasamento — e o Umami deu. `defer` é atributo booleano:
            o servidor não o serializa e o cliente o vê como `true`
            ("Prop `defer` did not match. Server: null Client: true").
            Ficava escondido porque o React abortava a hidratação no primeiro
            erro (o do `dangerouslySetInnerHTML`); corrigido aquele, a
            hidratação avançou e batau nele. `strategy="afterInteractive"`
            no Umami entrega a mesma ordem que o `defer` de antes, sem o
            atributo booleano. Para analytics não importa vencer o loader.

            O loader do AdSense (`async src`) NÃO deu descasamento e segue
            como `<script>` puro — trocar por recorridos que funcionam não
            é motivo para mexer. */}
        <Script id="adsense-page-level" strategy="beforeInteractive">
          {`(window.adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: "ca-pub-5482566824255473",
              enable_page_level_ads: false,
            });`}
        </Script>
        {/* Umami Analytics — cookieless, self-hosted */}
        <Script
          id="umami"
          strategy="afterInteractive"
          src="https://umami.narniano.com/script.js"
          data-website-id="27695e05-fa5d-455a-9255-b37b1853a4a9"
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
