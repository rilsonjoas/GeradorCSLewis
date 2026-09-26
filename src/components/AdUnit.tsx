"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdUnitProps {
  slot?: string;
  className?: string;
}

// Um único slot de anúncio que colapsa totalmente (0px de altura/margem)
// caso o Google não preencha o anúncio ou esteja bloqueado.
export function AdUnit({ slot, className = "" }: AdUnitProps) {
  // O tipo parece errado e não é. O @types/react mapeia `ins:` para
  // HTMLModElement (o elemento experimental <mod>, que carrega cite/dateTime
  // — os mesmos atributos do <ins>), então useRef<HTMLModElement> é
  // exatamente o que faz `<ins ref={insRef} />` passar no typecheck.
  // Trocar por HTMLElement quebra a compilação. Registrado aqui porque
  // "HTMLModElement num <ins>" convida a "corrigir" e a quebra o build.
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const [isUnfilled, setIsUnfilled] = useState(false);

  useEffect(() => {
    const el = insRef.current;
    if (!el) return;

    if (!pushed.current) {
      pushed.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        setIsUnfilled(true);
      }
    }

    const observer = new MutationObserver(() => {
      const status = el.getAttribute("data-ad-status");
      if (status === "unfilled") {
        setIsUnfilled(true);
      } else if (status === "filled") {
        setIsUnfilled(false);
      }
    });

    observer.observe(el, {
      attributes: true,
      attributeFilter: ["data-ad-status", "style"],
    });

    return () => observer.disconnect();
  }, []);

  if (isUnfilled) return null;

  return (
    /* CORREÇÃO 2026-09-25 (aria-hidden-focus): o container tinha
       aria-hidden="true". O AdSense injeta <iframe> aqui dentro, e se esse
       iframe for focável, o foco entra num elemento que a tecnologia
       assistiva não enxerga — violação crítica, e o tipo de truque que
       "funciona" até o dia em que o Google muda o formato do anúncio.
       Hoje o risco é latente (PageShell chama <AdUnit /> sem slot, então o
       anúncio não preenche e o MutationObserver marca unfilled → return
       null), mas a armadilha fica armada se o slot voltar. O certo é não
       esconder nada e deixar o próprio anúncio ser announced; se um dia
       precisar de rótulo, o título vai no iframe. */
    <div className={`overflow-hidden empty:hidden ${className}`}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5482566824255473"
        {...(slot ? { "data-ad-slot": slot } : {})}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
