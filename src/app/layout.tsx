import type { Metadata } from "next";
import { Lato, Lora } from "next/font/google"; // Importar fontes
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

export const metadata: Metadata = {
  metadataBase: new URL("https://cslewis.narniano.com"),
  title: "Gerador de Citações C. S. Lewis",
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
      className={`${lato.variable} ${lora.variable}`}
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
