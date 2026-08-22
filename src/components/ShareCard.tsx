import React from "react";
import { Quote } from "@/lib/quotes";

interface ShareCardProps {
  quote: Quote;
}

/* Escala tipográfica por comprimento — o acervo vai de 25 a 408 chars.
   Pior caso (408 chars @ 29px, ~55 chars/linha em 820px): ~8 linhas.
   Somado ao resto da composição (~500px), fecha em ~850px — cabe com
   folga nos 1080 do canvas mesmo na citação mais longa do acervo. */
function quoteFontClass(length: number): string {
  if (length <= 100) return "text-[56px] leading-[1.35]";
  if (length <= 170) return "text-[47px] leading-[1.4]";
  if (length <= 260) return "text-[39px] leading-[1.45]";
  if (length <= 360) return "text-[33px] leading-[1.5]";
  return "text-[29px] leading-[1.5]";
}

/**
 * Card fora da tela, só existe pra ser capturado pelo html2canvas.
 * Design fixo (independe do tema claro/escuro do usuário) — 1080x1080,
 * formato quadrado pra Instagram/WhatsApp, com a URL do site incluída.
 *
 * Visual: fundo branco-quente limpo (fácil de compartilhar sobre qualquer
 * tema), moldura dupla dourada como folha de manuscrito, retrato em tondo
 * e hierarquia clássica: citação (Lora itálico) → autor (caps espaçadas)
 * → obra (itálico-assinatura Cormorant). Só CSS que o html2canvas
 * rasteriza bem: gradientes simples, bordas e sombras — nada de filtro SVG.
 */
export const ShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ quote }, ref) {
    // Citações longas comprimem o respiro vertical pra garantir que tudo
    // caiba no quadrado sem cortar texto.
    const compact = quote.quote.length > 170;

    const gapAspas = compact ? "mt-4" : "mt-8";
    const gapDivider = compact ? "mt-6" : "mt-10";
    const gapAutor = compact ? "mt-5" : "mt-8";
    const gapMarca = compact ? "mt-8" : "mt-12";
    const retratoSize = compact ? 176 : 208;

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className="fixed left-[-9999px] top-0 flex h-[1080px] w-[1080px] items-center justify-center overflow-hidden"
        style={{ backgroundColor: "#fffefb" }}
      >
        {/* Moldura dupla de manuscrito — filete externo + interno */}
        <div
          className="pointer-events-none absolute inset-10"
          style={{ border: "2px solid rgba(122, 78, 45, 0.75)" }}
        />
        <div
          className="pointer-events-none absolute inset-[52px]"
          style={{ border: "1px solid rgba(180, 154, 96, 0.65)" }}
        />
        {/* Ornamentos nos cantos da moldura */}
        <span
          className="pointer-events-none absolute left-14 top-12 text-3xl text-[#b49a60]"
          style={{ lineHeight: 1 }}
        >
          ✦
        </span>
        <span
          className="pointer-events-none absolute right-14 top-12 text-3xl text-[#b49a60]"
          style={{ lineHeight: 1 }}
        >
          ✦
        </span>
        <span
          className="pointer-events-none absolute bottom-12 left-14 text-3xl text-[#b49a60]"
          style={{ lineHeight: 1 }}
        >
          ✦
        </span>
        <span
          className="pointer-events-none absolute bottom-12 right-14 text-3xl text-[#b49a60]"
          style={{ lineHeight: 1 }}
        >
          ✦
        </span>

        <div className="flex w-full max-w-[820px] flex-col items-center px-6 text-center">
          {/* Retrato em tondo com anel dourado duplo. background-image +
              cover em vez de <img> com object-fit: o html2canvas ignora
              object-fit e estica o JPG (300x382, não-quadrado) — achatando
              o retrato na PNG baixada. Background cover ele rasteriza certo. */}
          <div
            className="rounded-full shadow-xl"
            style={{
              width: retratoSize + 24,
              height: retratoSize + 24,
              border: "6px double #b49a60",
              padding: "6px",
            }}
          >
            <div
              className="rounded-full"
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: "url(/Lewis.jpg)",
                backgroundSize: "cover",
                backgroundPosition: "center 20%",
              }}
            />
          </div>

          {/* Aspas decorativa */}
          <span
            className={`block font-display ${gapAspas} text-[104px] leading-[0.4] text-[#b49a60]/70`}
            style={{ height: "44px" }}
          >
            &ldquo;
          </span>

          <blockquote
            className={`font-lora mt-5 italic text-[#3e2723] ${quoteFontClass(
              quote.quote.length
            )}`}
          >
            {quote.quote}&rdquo;
          </blockquote>

          {/* Filigrana separadora */}
          <div className={`divider-ornament ${gapDivider}`}>
            <span className="divider-line" style={{ width: "88px" }} />
            <span className="text-lg">✦</span>
            <span className="divider-line divider-line-right" style={{ width: "88px" }} />
          </div>

          <p
            className={`font-lato ${gapAutor} text-[26px] font-bold uppercase tracking-[0.3em] text-[#7a4e2d]`}
          >
            C. S. Lewis
          </p>

          {quote.source && (
            <p
              className="signature-italic mt-2 text-[30px]"
              style={{ color: "#5d4037" }}
            >
              em {quote.source}
            </p>
          )}

          {/* Marca discreta na base */}
          <p
            className={`font-lato ${gapMarca} text-[19px] font-semibold tracking-wide text-[#7a4e2d]/70`}
          >
            narniano.com
          </p>
        </div>
      </div>
    );
  }
);
