import type { Metadata } from "next";
import { Lato, Lora } from "next/font/google"; // Importar fontes
import "./globals.css";

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
  title: "Gerador de Citações C. S. Lewis",
  description: "Gere citações inspiradoras de C. S. Lewis.",
  icons: {
    icon: '/Lewis.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${lato.variable} ${lora.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
