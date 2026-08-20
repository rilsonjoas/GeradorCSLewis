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

const affiliateTag = "rilson-20"; // Seu tag de afiliado

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem

  const getAmazonSearchUrl = (source: string): string => {
    return `https://www.amazon.com.br/s?k=${encodeURIComponent(
      source
    )}&tag=${affiliateTag}`;
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
          <Image
            src="/Lewis.jpg"
            alt="Retrato de C.S. Lewis"
            width={120}
            height={120}
            className="rounded-full object-cover mx-auto border-4 border-cs-brown-lighter shadow-md dark:border-cs-beige/60"
            priority
          />
        </a>

        <blockquote className="font-lora text-xl md:text-2xl italic text-cs-brown-dark dark:text-cs-beige mb-3 min-h-[100px] flex items-center justify-center">
          {currentQuote
            ? `"${currentQuote.quote}"`
            : "Clique no botão abaixo para gerar uma citação inspiradora!"}
        </blockquote>

        {currentQuote && currentQuote.source && (
          <CardDescription className="font-lora text-base text-cs-brown-light dark:text-cs-brown-lighter mb-8 min-h-[1.2em]">
            —{" "}
            <a
              href={getAmazonSearchUrl(currentQuote.source)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cs-brown-dark dark:hover:text-cs-beige hover:underline"
            >
              {currentQuote.source}
            </a>
          </CardDescription>
        )}
        {!currentQuote && (
          <p className="font-lora text-base text-cs-brown-light dark:text-cs-brown-lighter mb-8 min-h-[1.2em]">
            {/* Espaço para manter altura quando não há fonte */}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={generateNewQuote}
            size="lg"
            className="font-lato font-bold bg-cs-brown-medium text-white hover:bg-cs-brown-light active:bg-cs-brown-dark active:scale-95 dark:bg-cs-beige dark:text-cs-brown-dark dark:hover:bg-cs-gradient-dark dark:active:bg-cs-brown-lighter"
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
