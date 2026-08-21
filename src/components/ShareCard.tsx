import React from "react";
import Image from "next/image";
import { Quote } from "@/lib/quotes";

interface ShareCardProps {
  quote: Quote;
}

/**
 * Card fora da tela, só existe pra ser capturado pelo html2canvas.
 * Design fixo (independe do tema claro/escuro do usuário) — 1080x1080,
 * formato quadrado pra Instagram/WhatsApp, com a URL do site incluída.
 */
export const ShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ quote }, ref) {
    return (
      <div
        ref={ref}
        className="fixed left-[-9999px] top-0 flex h-[1080px] w-[1080px] flex-col items-center justify-center gap-10 bg-cs-beige p-24 text-center"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgb(255 254 252), #b99386)",
        }}
        aria-hidden="true"
      >
        <Image
          src="/Lewis.jpg"
          alt=""
          width={160}
          height={160}
          className="rounded-full border-8 border-cs-brown-lighter object-cover shadow-lg"
        />
        <blockquote className="font-lora text-5xl italic leading-snug text-cs-brown-dark">
          &ldquo;{quote.quote}&rdquo;
        </blockquote>
        {quote.source && (
          <p className="font-lora text-3xl text-cs-brown-light">
            — {quote.source}
          </p>
        )}
        <p className="font-lato text-2xl font-bold tracking-wide text-cs-brown-medium">
          cslewis.narniano.com
        </p>
      </div>
    );
  }
);
