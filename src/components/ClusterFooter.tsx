const clusterLinks = [
  { label: "Narniano", href: "https://narniano.com" },
  { label: "Bíblia na Arte", href: "https://biblianaarte.narniano.com" },
  { label: "Scriptorium Divinum", href: "https://scriptorium.narniano.com" },
  { label: "Lecionário", href: "https://lecionario.narniano.com" },
];

export function ClusterFooter() {
  return (
    <footer className="mt-9 flex flex-col items-center gap-2.5 text-center font-lato">
      {/* Rótulo-nicho em caps espaçadas — ancora a hierarquia sem competir
          com os links; mesma língua tipográfica do heading do card */}
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cs-brown-light dark:text-cs-brown-lighter">
        Conheça também
      </span>

      {/* flex-wrap com itens atômicos: cada par ornamento+link é indivisível,
          então a quebra de linha nunca deixa um ✦ órfão no fim/começo da
          linha (era isso que dava o espaçamento estranho) */}
      <nav
        aria-label="Outros projetos do cluster A Biblioteca"
        className="flex max-w-md flex-wrap items-baseline justify-center gap-y-1.5 text-xs text-cs-brown-medium dark:text-cs-beige/90 sm:max-w-none"
      >
        {clusterLinks.map((link, i) => (
          <span key={link.href} className="flex items-baseline whitespace-nowrap">
            {i > 0 && (
              <span aria-hidden="true" className="mx-2.5 text-[var(--dourado)]">
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
          </span>
        ))}
      </nav>

      <p className="text-xs text-cs-brown-light/80 dark:text-cs-brown-lighter/80">
        &copy; {new Date().getFullYear()} Narniano
      </p>
    </footer>
  );
}
