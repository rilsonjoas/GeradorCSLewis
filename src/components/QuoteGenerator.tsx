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

export default function QuoteGenerator() {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

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
  }, []); // Array de dependências vazio para rodar apenas uma vez na montagem

  const getAmazonSearchUrl = (source: string): string => {
    return `https://www.amazon.com.br/s?k=${encodeURIComponent(
      source
    )}&tag=${affiliateTag}`;
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

        <blockquote className="font-lora text-xl md:text-2xl italic text-cs-brown-dark mb-3 min-h-[100px] flex items-center justify-center">
          {currentQuote
            ? `"${currentQuote.quote}"`
            : "Clique no botão abaixo para gerar uma citação inspiradora!"}
        </blockquote>

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
