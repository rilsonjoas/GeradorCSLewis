#!/usr/bin/env node
/**
 * Resume a diferença entre duas versões da cópia embutida (`lewis-quotes.snapshot.json`) para o corpo do PR que o
 * fluxo `.github/workflows/sync-quotes.yml` abre. Só as citações contam: `geradoEm` e `total` mudam a cada
 * execução e não são diferença.
 *
 * Uso: node scripts/resumo-copia.mjs <antes.json> <depois.json>   (imprime o resumo em Markdown)
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const CAMPOS = ["text", "source", "theme", "affiliateUrl"];

/** @typedef {{citacoes: Array<Record<string, unknown>>, geradoEm?: string, total?: number}} Copia */

/** @param {Copia} antes @param {Copia} depois */
export function resumir(antes, depois) {
  const a = new Map(antes.citacoes.map((q) => [q.id, q]));
  const d = new Map(depois.citacoes.map((q) => [q.id, q]));
  const entram = [...d.keys()].filter((id) => !a.has(id));
  const saem = [...a.keys()].filter((id) => !d.has(id));
  const mudam = [...d.keys()]
    .filter((id) => a.has(id))
    .map((id) => ({ id, campos: CAMPOS.filter((c) => JSON.stringify(a.get(id)?.[c] ?? null) !== JSON.stringify(d.get(id)?.[c] ?? null)) }))
    .filter((m) => m.campos.length > 0);
  const texto = entram.length + saem.length + mudam.length === 0
    ? "Nenhuma diferença nas citações."
    : `Entram ${entram.length}, saem ${saem.length}, mudam ${mudam.length}.`;
  return { entram, saem, mudam, texto };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [antes, depois] = process.argv.slice(2).map((f) => JSON.parse(readFileSync(f, "utf-8")));
  const r = resumir(antes, depois);
  const linhas = [`**${r.texto}**`];
  if (r.saem.length) linhas.push(`- Saem (retiradas do acervo): ${r.saem.map((i) => `\`${i}\``).join(", ")}`);
  if (r.entram.length) linhas.push(`- Entram: ${r.entram.map((i) => `\`${i}\``).join(", ")}`);
  if (r.mudam.length) linhas.push(`- Mudam: ${r.mudam.map((m) => `\`${m.id}\` (${m.campos.join(", ")})`).join("; ")}`);
  console.log(linhas.join("\n"));
}
