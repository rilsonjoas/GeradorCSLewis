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
          com os links; mesma língua tipográfica do heading do card */}
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cs-brown-light dark:text-cs-brown-lighter">
        Conheça também
      </span>

      {/* Exibe em 2 linhas de 2 links no mobile (2x2) e 1 linha completa (4x1) em breakpoints maiores */}
      <nav
        aria-label="Outros projetos do cluster A Biblioteca"
        className="flex flex-col items-center justify-center gap-y-1.5 text-xs text-cs-brown-medium dark:text-cs-beige/90 sm:flex-row sm:gap-y-0"
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
                    className="transition-colors underline-offset-2 hover:text-[var(--canela)] hover:underline dark:hover:text-[var(--dourado)]"
                  >
                    {link.label}
                  </a>
                </React.Fragment>
              ))}
            </div>
          </React.Fragment>
        ))}
      </nav>

      <p className="text-xs text-cs-brown-light/80 dark:text-cs-brown-lighter/80">
        &copy; {new Date().getFullYear()} Narniano
      </p>
    </footer>
  );
}

