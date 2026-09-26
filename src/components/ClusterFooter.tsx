import * as React from "react";

const clusterLinkPairs = [
  [
    { label: "Narniano", href: "https://narniano.com" },
    { label: "Bíblia na Arte", href: "https://biblianaarte.narniano.com" },
  ],
  [
    { label: "Scriptorium Divinum", href: "https://scriptorium.narniano.com" },
    { label: "Lecionário", href: "https://lecionario.narniano.com" },
  ],
];

export function ClusterFooter() {
  return (
    <footer className="mt-9 flex flex-col items-center gap-2.5 text-center font-lato">
      {/* Rótulo-nicho em caps espaçadas — ancora a hierarquia sem competir
          com os links; mesma língua tipográfica do heading do card.
          CORREÇÃO 2026-09-25 (auditoria de a11y): era #6d4c41 no claro e
          #83675e no escuro. Medido no PIOR ponto do gradiente da página
          (#b49a60 na base, #241611 no topo do escuro), dava 2.80:1 e 3.40:1
          — abaixo de 4.5:1 (WCAG 2.2 SC 1.4.3, AA). Trocado por #3e2723
          (claro, 5.09:1 na base) e --dourado (escuro, 6.45:1 no topo):
          os dois passam em toda a altura, e o dourado é a brasa da
          identidade noturna, não um remendo. */}
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cs-brown-dark dark:text-[var(--dourado)]">
        Conheça também
      </span>

      {/* Exibe em 2 linhas de 2 links no mobile (2x2) e 1 linha completa (4x1) em breakpoints maiores.
          CORREÇÃO 2026-09-25: #5d4037 dava 3.43:1 sobre a base dourada do
          gradiente (12px = texto normal, min 4.5:1) → #3e2723, 5.09:1. */}
      <nav
        aria-label="Outros projetos do cluster A Biblioteca"
        className="flex flex-col items-center justify-center gap-y-1.5 text-xs text-cs-brown-dark dark:text-cs-beige/90 sm:flex-row sm:gap-y-0"
      >
        {clusterLinkPairs.map((pair, pairIndex) => (
          <React.Fragment key={pairIndex}>
            {pairIndex > 0 && (
              <span
                aria-hidden="true"
                className="hidden mx-2.5 text-[var(--dourado)] sm:inline"
              >
                ✦
              </span>
            )}
            <div className="flex items-baseline justify-center whitespace-nowrap">
              {pair.map((link, linkIndex) => (
                <React.Fragment key={link.href}>
                  {linkIndex > 0 && (
                    <span
                      aria-hidden="true"
                      className="mx-2.5 text-[var(--dourado)]"
                    >
                      ✦
                    </span>
                  )}
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    /* CORREÇÃO 2026-09-25 (1.4.1): o sublinhado virou
                       permanente, não só hover. A cor sozinha não pode ser o
                       único meio de dizer "isto é link" — e o hover mudava
                       a cor para --canela, que BAIXA o contraste na base
                       dourada. Agora o affordance é o sublinhado, que não
                       depende de contraste nem de passar o mouse. */
                    className="underline decoration-1 underline-offset-2 transition-colors hover:decoration-2 dark:hover:text-[var(--dourado)]"
                  >
                    {link.label}
                  </a>
                </React.Fragment>
              ))}
            </div>
          </React.Fragment>
        ))}
      </nav>

      {/* CORREÇÃO 2026-09-25 (1.4.3): era #6d4c41/80 no claro (3.80:1 no
          meio do gradiente, 2.23:1 na base) e #83675e/80 no escuro
          (2.64:1–2.88:1). A opacidade some e a cor vai a #3e2723 / --dourado,
          que passam com folga. A hierarquia visual fica por tamanho
          (12px) e peso, não por transparência — transparência em texto
          pequeno é o jeito mais rápido de reprovar 1.4.3 sem parecer erro. */}
      <p className="text-xs text-cs-brown-dark dark:text-[var(--dourado)]">
        &copy; {new Date().getFullYear()} Narniano
      </p>
    </footer>
  );
}

