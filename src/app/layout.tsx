import type { Metadata } from "next";
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
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
