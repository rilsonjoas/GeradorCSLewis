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
    // CORREÇÃO 2026-10-16 (bug de layout, medido): sem `data-ad-slot` o
    // AdSense não tem o que preencher — o <ins> nunca é processado e o
    // atributo `data-ad-status` NUNCA aparece. O MutationObserver ficava
    // esperando um evento que não vinha, `isUnfilled` nunca virava true e o
    // `return null` nunca disparava: a caixa ficava na tela com 0px de
    // altura mas com as margens do chamador (48px de `my-6` no PageShell)
    // empurrando o ClusterFooter pra baixo da dobra. A versão anterior
    // desta página afirmava que o slot ausente levava a unfilled — medi e é
    // falso. Sem slot não existe unidade de anúncio: não há o que
    // observar nem o que renderizar (guarda também no fim do componente).
    // A guarda fica AQUI e não como return antes dos hooks: return
    // antecipado desliga o rules-of-hooks, e `slot` não é garantidamente
    // constante em toda montagem futura.
    if (!slot) return;
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
  }, [slot]);

  // Sem slot não existe unidade — ver a guarda no useEffect. Aqui o
  // componente inteiro não vira nada, nem a caixa de 0px com margens.
  if (isUnfilled || !slot) return null;

  return (
    /* CORREÇÃO 2026-09-25 (aria-hidden-focus): o container tinha
       aria-hidden="true". O AdSense injeta <iframe> aqui dentro, e se esse
       iframe for focável, o foco entra num elemento que a tecnologia
       assistiva não enxerga — violação crítica, e o tipo de truque que
       "funciona" até o dia em que o Google muda o formato do anúncio.
       Hoje o risco é latente (o PageShell chama <AdUnit /> sem slot, e
       sem slot não renderiza nada), mas a armadilha fica armada se o slot
       voltar. O certo é não esconder nada e deixar o próprio anúncio ser
       announced; se um dia precisar de rótulo, o título vai no iframe. */
    <div className={`overflow-hidden empty:hidden ${className}`}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5482566824255473"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
