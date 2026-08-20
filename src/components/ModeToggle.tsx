"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Evita mismatch de hidratação: até montar no client, não sabemos ainda
  // se o tema resolvido é light ou dark (depende de localStorage/SO).
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden="true" />;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={resolvedTheme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="border-cs-brown-lighter bg-white/70 text-cs-brown-medium hover:bg-white hover:text-cs-brown-dark dark:border-cs-brown-light dark:bg-cs-brown-dark/60 dark:text-cs-beige dark:hover:bg-cs-brown-dark"
    >
      <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  );
}
