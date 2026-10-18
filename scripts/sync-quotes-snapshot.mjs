#!/usr/bin/env node
/**
 * Gera `src/data/lewis-quotes.snapshot.json`: a cópia embutida das citações de C. S. Lewis que o
 * Gerador usa SÓ quando o Scriptorium está fora do ar e ainda não há lista em memória (ver
 * `src/lib/quote-store.ts`). A fonte da verdade continua sendo a API do Scriptorium (ADR 001);
 * este arquivo é gerado dela, nunca editado à mão.
 *
 * Uso:
 *   npm run quotes:sync            regrava o arquivo a partir da API de produção
 *   npm run quotes:sync -- --check só compara (sai 1 se a cópia estiver diferente da API)
 *
 * Guarda o formato da própria API (`id`, `text`, `source`, `theme`, `affiliateUrl`) em vez do formato do
 * app: a normalização acontece na leitura, num lugar só (`toLewisQuote`). Ordenado por id para que
 * a diferença no git mostre só citações que entraram, saíram ou mudaram.
 *
 * Por que isto importa: uma citação RETIRADA do acervo (fabricada, sem direito de uso) não pode
 * continuar sendo servida pela reserva. O canário do cluster compara esta cópia com a API de hora em hora
 * (hetzner-infra/scripts/canario-api-cluster.py) e acusa citação retirada.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const API = process.env.SCRIPTORIUM_API_URL ?? "https://api-scriptorium.narniano.com/api/v1";
const AUTOR = "C. S. Lewis";
const ARQUIVO = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "lewis-quotes.snapshot.json");
const MINIMO = 50; // abaixo disso a API provavelmente devolveu algo errado: não sobrescreve a reserva

function valida(x) {
  return typeof x === "object" && x !== null && typeof x.id === "string" && typeof x.text === "string" && x.text.trim() !== "";
}

const res = await fetch(`${API}/quotes?author=${encodeURIComponent(AUTOR)}`, { signal: AbortSignal.timeout(20_000) });
if (!res.ok) throw new Error(`API respondeu HTTP ${res.status}`);
const corpo = await res.json();
if (!Array.isArray(corpo)) throw new Error("a resposta da API não é uma lista");
const citacoes = corpo
  .filter(valida)
  .map((q) => ({ id: q.id, text: q.text, source: q.source ?? null, theme: q.theme ?? null, affiliateUrl: q.affiliateUrl ?? null }))
  .sort((a, b) => a.id.localeCompare(b.id));
if (citacoes.length < MINIMO) throw new Error(`só ${citacoes.length} citações válidas (mínimo ${MINIMO}): não vou sobrescrever a reserva`);
if (new Set(citacoes.map((q) => q.id)).size !== citacoes.length) throw new Error("ids repetidos na resposta da API");

const novo = { geradoEm: new Date().toISOString(), fonte: `${API}/quotes?author=${AUTOR}`, total: citacoes.length, citacoes };

if (process.argv.includes("--check")) {
  const atual = JSON.parse(readFileSync(ARQUIVO, "utf-8"));
  const mesmo = JSON.stringify(atual.citacoes) === JSON.stringify(citacoes);
  console.log(mesmo ? `✅ a cópia embutida está em dia (${citacoes.length} citações)` : `❌ a cópia embutida difere da API (cópia: ${atual.citacoes.length}, API: ${citacoes.length}). Rode: npm run quotes:sync`);
  process.exit(mesmo ? 0 : 1);
}

writeFileSync(ARQUIVO, JSON.stringify(novo, null, 2) + "\n");
console.log(`✅ ${citacoes.length} citações gravadas em ${path.relative(process.cwd(), ARQUIVO)}`);
