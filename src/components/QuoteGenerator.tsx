"use client"; // Essencial para componentes com interatividade (useState, useEffect, event handlers)

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { lewisQuotes, Quote } from "@/lib/quotes"; // Importar citações e tipo
import { Button } from "@/components/ui/button"; // Importar Button do ShadCN
import {
  Card,
  CardContent,
  CardDescription, // Usaremos para a fonte
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Importar Card do ShadCN

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

export default function QuoteGenerator() {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [fontSizeIndex, setFontSizeIndex] = useState(DEFAULT_FONT_SIZE_INDEX);

  const getRandomQuote = (): Quote => {
    if (!lewisQuotes || lewisQuotes.length === 0) {
      // Fallback caso o array esteja vazio (não deveria acontecer)
      return {
        quote: "Erro ao carregar citações.",
        source: "Sistema",
      };
    }
    const randomIndex = Math.floor(Math.random() * lewisQuotes.length);
    return lewisQuotes[randomIndex];
  };

  const generateNewQuote = () => {
    setCurrentQuote(getRandomQuote());
  };

  useEffect(() => {
    // Exibe uma citação inicial quando o componente é montado
    generateNewQuote();

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

  return (
    <Card className="w-full max-w-2xl text-center shadow-lg border-t-4 border-cs-brown-medium bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-lato font-bold text-cs-brown-medium">
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
          <Image
            src="/Lewis.jpg"
            alt="Retrato de C.S. Lewis"
            width={120}
            height={120}
            className="rounded-full object-cover mx-auto border-4 border-cs-brown-lighter shadow-md"
            priority
          />
        </a>

        <blockquote
          className={`font-lora ${QUOTE_FONT_SIZES[fontSizeIndex]} italic text-cs-brown-dark mb-3 min-h-[100px] flex items-center justify-center`}
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
            className="w-7 h-7 flex items-center justify-center rounded-full border border-cs-brown-lighter text-cs-brown-medium text-xs font-lato font-bold hover:bg-cs-brown-lighter/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => changeFontSize(1)}
            disabled={fontSizeIndex === QUOTE_FONT_SIZES.length - 1}
            aria-label="Aumentar tamanho da fonte da citação"
            className="w-7 h-7 flex items-center justify-center rounded-full border border-cs-brown-lighter text-cs-brown-medium text-xs font-lato font-bold hover:bg-cs-brown-lighter/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            A+
          </button>
        </div>

        {currentQuote && currentQuote.source && (
          <CardDescription className="font-lora text-base text-cs-brown-light mb-8 min-h-[1.2em]">
            —{" "}
            <a
              href={getAmazonSearchUrl(currentQuote.source)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cs-brown-dark hover:underline"
            >
              {currentQuote.source}
            </a>
          </CardDescription>
        )}
        {!currentQuote && (
          <p className="font-lora text-base text-cs-brown-light mb-8 min-h-[1.2em]">
            {/* Espaço para manter altura quando não há fonte */}
          </p>
        )}

        <Button
          onClick={generateNewQuote}
          size="lg"
          className="font-lato font-bold bg-cs-brown-medium text-white hover:bg-cs-brown-light active:bg-cs-brown-dark active:scale-95"
        >
          Gerar nova citação
        </Button>

        <div className="mt-8 text-center text-xs text-cs-brown-light">
          <span>&copy; 2025 - Desenvolvido por </span>
          <a
            href="https://github.com/rilsonjoas"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cs-brown-medium hover:underline"
          >
            Rilson Joás
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
