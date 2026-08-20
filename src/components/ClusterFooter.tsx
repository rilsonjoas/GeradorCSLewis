const clusterLinks = [
  { label: "Narniano", href: "https://narniano.com" },
  { label: "Bíblia na Arte", href: "https://biblianaarte.narniano.com" },
  { label: "Scriptorium Divinum", href: "https://scriptorium.narniano.com" },
  { label: "Lecionário", href: "https://lecionario.narniano.com" },
];

export function ClusterFooter() {
  return (
    <footer className="mt-8 text-center text-xs text-cs-brown-light dark:text-cs-brown-lighter">
      <p className="mb-2">
        Parte da mesma biblioteca:{" "}
        {clusterLinks.map((link, i) => (
          <span key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cs-brown-medium hover:underline dark:text-cs-beige"
            >
              {link.label}
            </a>
            {i < clusterLinks.length - 1 && <span className="mx-1.5">·</span>}
          </span>
        ))}
      </p>
      <p>&copy; {new Date().getFullYear()} Narniano</p>
    </footer>
  );
}
