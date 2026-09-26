"use client"; // Essencial para componentes com interatividade (useState, useEffect, event handlers)

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchRandomLewisQuote, type LewisQuote } from "@/lib/quote-api";
import { Button } from "@/components/ui/button"; // Importar Button do ShadCN
import {
  Card,
  CardContent,
  CardDescription, // Usaremos para a fonte
  CardHeader,
} from "@/components/ui/card"; // Importar Card do ShadCN
import { ShareCard } from "@/components/ShareCard";
import { cn } from "@/lib/utils";

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
  // Citação inicial fixa — usado por /citacao/[id], onde o link já
  // aponta pra uma citação específica (id estável da API). Sem isso,
  // sorteia uma ao montar.
  initialQuote?: LewisQuote | null;
}

export default function QuoteGenerator({ initialQuote }: QuoteGeneratorProps) {
  const router = useRouter();
  const [currentQuote, setCurrentQuote] = useState<LewisQuote | null>(
    initialQuote ?? null
  );
  const [isDownloading, setIsDownloading] = useState(false);
  // CORREÇÃO 2026-09-25 (4.1.3): região de status para o download. O botão
  // trocava o rótulo por "Gerando imagem...", o que só é anunciado se o
  // foco estiver nele — e o fim da operação não era anunciado de jeito
  // nenhum. role="status" announce o sucesso e a falha sem roubar foco.
  const [status, setStatus] = useState("");
  const [fontSizeIndex, setFontSizeIndex] = useState(DEFAULT_FONT_SIZE_INDEX);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const generateNewQuote = async () => {
    const quote = await fetchRandomLewisQuote();
    if (!quote) return; // API fora — mantém a citação atual na tela
    setCurrentQuote(quote);
    // Mantém a URL sempre apontando pra citação em tela — é o que faz
    // "compartilhar o link" funcionar em qualquer momento, sem precisar
    // de um botão de "copiar link" separado (issue #3).
    router.replace(`/citacao/${quote.id}`, { scroll: false });
  };

  useEffect(() => {
    // Se não veio de /citacao/[id] (ou seja, é a home "/"), sorteia uma
    // citação inicial ao montar (sorteio no server, /quotes/random).
    if (initialQuote === undefined) {
      void generateNewQuote();
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
    setStatus("Gerando a imagem da citação.");
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(shareCardRef.current, { scale: 1 });
      const link = document.createElement("a");
      link.download = `citacao-cs-lewis-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setStatus("Imagem gerada ebaixada.");
    } catch (error) {
      console.error("Falha ao gerar imagem da citação:", error);
      // CORREÇÃO 2026-09-25 (4.1.3): o erro só ia para o console. Quem não
      // vê console é exatamente quem precisa do aviso.
      setStatus("Não foi possível gerar a imagem. Tente de novo.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl gap-4 border-t-4 border-[var(--dourado)] py-4 text-center shadow-lg bg-white sm:gap-6 sm:py-6 dark:bg-cs-brown-dark">
      <CardHeader className="px-4 pb-0 sm:px-6">
        {/* whitespace-nowrap + tamanhos por breakpoint: "GERADOR DE
            CITAÇÕES" e "C. S. Lewis" nunca quebram feios em telas estreitas.
            CORREÇÃO 2026-09-25 (1.4.4 / 1.4.10): o nowrap é só a partir de
            sm:. Em 320px com 200% de zoom de texto, "C. S. Lewis" a 80px
            estoura os 288px úteis (main com p-4) e o nowrap transforma isso
            em rolagem horizontal — que é exatamente o que 1.4.10 proíbe.
            No mobile normal o h1 cabe em ~200px, então nada se perde.
            1.4.3: o claro fica como está (#6d4c41 sobre branco = 7.61:1,
            folgado). Só o escuro mudava: #83675e sobre o card #3e2723 dava
            2.68:1 — e aqui a cor do card é #3e2723, não o gradiente da
            página, que é onde este texto NÃO está. */}
        <p className="font-lato text-[10px] font-bold uppercase tracking-[0.25em] text-cs-brown-light sm:whitespace-nowrap sm:text-[11px] sm:tracking-[0.35em] dark:text-[var(--dourado)]">
          Gerador de citações
        </p>
        {/* Título em serifa display — "A Voz da Tradição" do Design Narniano */}
        <h1 className="font-display mt-1 text-[40px] font-semibold leading-none text-cs-brown-dark sm:whitespace-nowrap dark:text-cs-beige sm:text-5xl md:text-6xl">
          C. S. Lewis
        </h1>
        <div aria-hidden="true" className="divider-ornament mt-2 sm:mt-3">
          <span className="divider-line" />
          <span className="text-sm">✦</span>
          <span className="divider-line divider-line-right" />
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <a
          href="https://amzn.to/42HJtHG"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Link para página relacionada a C.S. Lewis na Amazon"
          className="block mx-auto mb-4 sm:mb-6"
        >
          {/* Moldura inspirada em .frame-tondo (Design Narniano) — mesma
              borda dourada dupla, adaptada pro tamanho de avatar deste
              projeto (o original é 320px, feito pra retrato de destaque,
              não pra avatar ao lado do gerador). Menor no mobile pra
              encurtar a altura total do card. */}
          <Image
            src="/Lewis.jpg"
            alt="Retrato de C.S. Lewis"
            width={120}
            height={120}
            className="h-20 w-20 rounded-full object-cover mx-auto shadow-md border-4 border-double border-[var(--dourado)] sm:h-24 sm:w-24 md:h-[120px] md:w-[120px]"
            priority
          />
        </a>

        <div className="mb-3 flex items-center justify-center">
          {/* CORREÇÃO 2026-09-25 (4.1.3, AA): "Gerar nova citação" trocava o
              texto e a URL em silêncio — quem usa leitor de tela apertava o
              botão e não recebia confirmação nenhuma. aria-live="polite"
              anuncia a citação nova sem interromper. */}
          <blockquote
            aria-live="polite"
            className={cn(
              "font-lora italic min-h-[100px] flex items-center justify-center text-cs-brown-dark dark:text-cs-beige",
              QUOTE_FONT_SIZES[fontSizeIndex]
            )}
          >
            {currentQuote
              ? `"${currentQuote.quote}"`
              : "Clique no botão abaixo para gerar uma citação inspiradora!"}
          </blockquote>
        </div>

        {currentQuote && currentQuote.source && (
          <CardDescription className="font-lora text-base mb-8 min-h-[1.2em] text-cs-brown-light dark:text-[var(--dourado)]">
            —{" "}
            {currentQuote.affiliateUrl ? (
              <a
                href={currentQuote.affiliateUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="signature-italic underline decoration-1 underline-offset-2 hover:decoration-2 dark:text-[var(--dourado)]" // 1.95:1 sem isso — falha WCAG AA. CORREÇÃO 2026-09-25 (1.4.1): sublinhado permanente, não só no hover — a cor sozinha não pode ser o único meio de dizer "isto é link", e sem hover o link é idêntico ao texto das linhas 177/184.
              >
                {currentQuote.source}
              </a>
            ) : (
              <span className="signature-italic dark:text-[var(--dourado)]">
                {currentQuote.source}
              </span>
            )}
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
            className="w-full px-4 font-lato font-bold active:scale-95 bg-cs-brown-medium text-white hover:bg-cs-brown-light active:bg-cs-brown-dark sm:w-auto sm:px-8 dark:bg-cs-beige dark:text-cs-brown-dark dark:hover:bg-cs-gradient-dark dark:active:bg-cs-brown-lighter"
          >
            Gerar nova citação
          </Button>

          <Button
            onClick={handleDownloadImage}
            disabled={!currentQuote || isDownloading}
            size="lg"
            variant="outline"
            className="w-full px-4 font-lato font-bold border-cs-brown-medium text-cs-brown-medium hover:bg-cs-brown-medium hover:text-white sm:w-auto sm:px-8 dark:border-cs-beige dark:text-cs-beige dark:hover:bg-cs-beige dark:hover:text-cs-brown-dark"
          >
            {isDownloading ? "Gerando imagem..." : "Baixar como imagem"}
          </Button>
        </div>

        {/* Controle de tamanho da citação — abaixo dos botões, centralizado,
            fora do fluxo de leitura citação → fonte.
            CORREÇÃO 2026-09-25: w-7 h-7 (28×28) passava o mínimo AA (2.5.8 =
            24×24) mas falhava o 44×44 — que é *recomendação* da NBR 17060
            (item 5.1.2.13, derivada do AAA do WCAG 2.1), não requisito. Como
            o P7 do hetzner já pede 44×44 para público que justifique, e aqui
            o controle de fonte já existe, subir para 44 não custou nada.
            2.5.3 (Label in Name, A): o nome acessível agora COMEÇA com o
            texto visível ("A+…"), para quem navega por voz funcionar. */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => changeFontSize(-1)}
            disabled={fontSizeIndex === 0}
            aria-label="A- diminui o tamanho da fonte da citação"
            className="w-11 h-11 flex items-center justify-center rounded-full border text-sm font-lato font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-cs-brown-lighter text-cs-brown-medium hover:bg-cs-brown-lighter/30 dark:border-cs-beige/80 dark:text-cs-beige dark:hover:bg-cs-beige/20"
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => changeFontSize(1)}
            disabled={fontSizeIndex === QUOTE_FONT_SIZES.length - 1}
            aria-label="A+ aumenta o tamanho da fonte da citação"
            className="w-11 h-11 flex items-center justify-center rounded-full border text-sm font-lato font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-cs-brown-lighter text-cs-brown-medium hover:bg-cs-brown-lighter/30 dark:border-cs-beige/80 dark:text-cs-beige dark:hover:bg-cs-beige/20"
          >
            A+
          </button>
        </div>
      </CardContent>

      {/* Região de status do download — visível só para leitor de tela. */}
      <p role="status" className="sr-only">
        {status}
      </p>

      {currentQuote && <ShareCard ref={shareCardRef} quote={currentQuote} />}
    </Card>
  );
}
