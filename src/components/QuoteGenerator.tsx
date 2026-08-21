"use client"; // Essencial para componentes com interatividade (useState, useEffect, event handlers)

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { lewisQuotes, Quote } from "@/lib/quotes"; // Importar citações e tipo
import { Button } from "@/components/ui/button"; // Importar Button do ShadCN
import {
  Card,
  CardContent,
  CardDescription, // Usaremos para a fonte
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Importar Card do ShadCN
import { ShareCard } from "@/components/ShareCard";
import { cn } from "@/lib/utils";

const affiliateTag = "rilson-20"; // Seu tag de afiliado

// Passos de tamanho de fonte da citação — índice 2 é o padrão (visual original).
const QUOTE_FONT_SIZES = [
  "text-base md:text-lg",
  "text-lg md:text-xl",
  "text-xl md:text-2xl",
  "text-2xl md:text-3xl",
  "text-3xl md:text-4xl",
];
const DEFAULT_FONT_SIZE_INDEX = 2;
const FONT_SIZE_STORAGE_KEY = "cslewis-quote-font-size";

interface QuoteGeneratorProps {
  // Índice inicial fixo — usado por /citacao/[id], onde o link já
  // aponta pra uma citação específica. Sem isso, sorteia ao montar.
  initialQuoteId?: number;
}

export default function QuoteGenerator({ initialQuoteId }: QuoteGeneratorProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState<number | null>(
    initialQuoteId ?? null
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [fontSizeIndex, setFontSizeIndex] = useState(DEFAULT_FONT_SIZE_INDEX);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const currentQuote: Quote | null =
    currentIndex !== null ? lewisQuotes[currentIndex] : null;

  const generateNewQuote = () => {
    if (!lewisQuotes || lewisQuotes.length === 0) return; // não deveria acontecer
    const randomIndex = Math.floor(Math.random() * lewisQuotes.length);
    setCurrentIndex(randomIndex);
    // Mantém a URL sempre apontando pra citação em tela — é o que faz
    // "compartilhar o link" funcionar em qualquer momento, sem precisar
    // de um botão de "copiar link" separado (issue #3).
    router.replace(`/citacao/${randomIndex}`, { scroll: false });
  };

  useEffect(() => {
    // Se não veio de /citacao/[id] (ou seja, é a home "/"), sorteia uma
    // citação inicial ao montar.
    if (initialQuoteId === undefined) {
      generateNewQuote();
    }

    // Restaura a preferência de tamanho de fonte salva (se houver) — em
    // useEffect, não no useState inicial, pra não divergir da renderização
    // do servidor (Next.js) e causar hydration mismatch.
    try {
      const saved = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
      if (saved !== null) {
        const idx = parseInt(saved, 10);
        if (!Number.isNaN(idx) && idx >= 0 && idx < QUOTE_FONT_SIZES.length) {
          setFontSizeIndex(idx);
        }
      }
    } catch {
      // localStorage indisponível (modo privado, etc.) — segue com o padrão
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem

  const getAmazonSearchUrl = (source: string): string => {
    // Inclui "C. S. Lewis" na busca além do título — sem isso, títulos
    // genéricos (ex.: "Milagres") ou com grafia levemente diferente da
    // edição em catálogo podiam cair em resultados de outros livros/autores.
    return `https://www.amazon.com.br/s?k=${encodeURIComponent(
      `${source} C. S. Lewis`
    )}&tag=${affiliateTag}`;
  };

  const changeFontSize = (delta: number) => {
    setFontSizeIndex((prev) => {
      const next = Math.min(
        QUOTE_FONT_SIZES.length - 1,
        Math.max(0, prev + delta)
      );
      try {
        localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(next));
      } catch {
        // localStorage indisponível — a preferência só não persiste
      }
      return next;
    });
  };

  const handleDownloadImage = async () => {
    if (!shareCardRef.current || !currentQuote) return;
    setIsDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(shareCardRef.current, { scale: 1 });
      const link = document.createElement("a");
      link.download = `citacao-cs-lewis-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Falha ao gerar imagem da citação:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl text-center shadow-lg border-t-4 border-cs-brown-medium bg-white dark:border-cs-beige dark:bg-cs-brown-dark">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-lato font-bold text-cs-brown-medium dark:text-cs-beige">
          Gerador de citações de C. S. Lewis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <a
          href="https://amzn.to/42HJtHG"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Link para página relacionada a C.S. Lewis na Amazon"
          className="block mx-auto mb-6"
        >
          {/* Moldura inspirada em .frame-tondo (Design Narniano) — mesma
              borda dourada dupla, adaptada pro tamanho de avatar deste
              projeto (o original é 320px, feito pra retrato de destaque,
              não pra avatar ao lado do gerador) */}
          <Image
            src="/Lewis.jpg"
            alt="Retrato de C.S. Lewis"
            width={120}
            height={120}
            className="rounded-full object-cover mx-auto shadow-md border-4 border-double border-[var(--dourado)]"
            priority
          />
        </a>

        <blockquote
          className={cn(
            "font-lora italic mb-3 min-h-[100px] flex items-center justify-center text-cs-brown-dark dark:text-cs-beige",
            QUOTE_FONT_SIZES[fontSizeIndex]
          )}
        >
          {currentQuote
            ? `"${currentQuote.quote}"`
            : "Clique no botão abaixo para gerar uma citação inspiradora!"}
        </blockquote>

        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => changeFontSize(-1)}
            disabled={fontSizeIndex === 0}
            aria-label="Diminuir tamanho da fonte da citação"
            className="w-7 h-7 flex items-center justify-center rounded-full border text-xs font-lato font-bold disabled:opacity-30 disabled:cursor-not-allowed border-cs-brown-lighter text-cs-brown-medium hover:bg-cs-brown-lighter/30 dark:border-cs-beige dark:text-cs-beige dark:hover:bg-cs-beige/20"
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => changeFontSize(1)}
            disabled={fontSizeIndex === QUOTE_FONT_SIZES.length - 1}
            aria-label="Aumentar tamanho da fonte da citação"
            className="w-7 h-7 flex items-center justify-center rounded-full border text-xs font-lato font-bold disabled:opacity-30 disabled:cursor-not-allowed border-cs-brown-lighter text-cs-brown-medium hover:bg-cs-brown-lighter/30 dark:border-cs-beige dark:text-cs-beige dark:hover:bg-cs-beige/20"
          >
            A+
          </button>
        </div>

        {currentQuote && currentQuote.source && (
          <CardDescription className="font-lora text-base mb-8 min-h-[1.2em] text-cs-brown-light dark:text-[var(--dourado)]">
            —{" "}
            <a
              href={getAmazonSearchUrl(currentQuote.source)}
              target="_blank"
              rel="noopener noreferrer"
              className="signature-italic hover:underline dark:text-[var(--dourado)]" // 1.95:1 sem isso — falha WCAG AA
            >
              {currentQuote.source}
            </a>
          </CardDescription>
        )}
        {!currentQuote && (
          <p className="font-lora text-base text-cs-brown-light dark:text-[var(--dourado)] mb-8 min-h-[1.2em]">
            {/* Espaço para manter altura quando não há fonte */}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={generateNewQuote}
            size="lg"
            className="font-lato font-bold active:scale-95 bg-cs-brown-medium text-white hover:bg-cs-brown-light active:bg-cs-brown-dark dark:bg-cs-beige dark:text-cs-brown-dark dark:hover:bg-cs-gradient-dark dark:active:bg-cs-brown-lighter"
          >
            Gerar nova citação
          </Button>

          <Button
            onClick={handleDownloadImage}
            disabled={!currentQuote || isDownloading}
            size="lg"
            variant="outline"
            className="font-lato font-bold border-cs-brown-medium text-cs-brown-medium hover:bg-cs-brown-medium hover:text-white dark:border-cs-beige dark:text-cs-beige dark:hover:bg-cs-beige dark:hover:text-cs-brown-dark"
          >
            {isDownloading ? "Gerando imagem..." : "Baixar como imagem"}
          </Button>
        </div>
      </CardContent>

      {currentQuote && <ShareCard ref={shareCardRef} quote={currentQuote} />}
    </Card>
  );
}
