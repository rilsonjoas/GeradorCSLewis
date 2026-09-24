// Fonte ÚNICA das citações de C.S. Lewis (ADR 001): a API do Scriptorium.
// O Gerador consome `/quotes?author=C. S. Lewis` (lista, p/ rotas e
// sitemap) e `/quotes/random?author=C. S. Lewis` (o "tema" fica pronto pra
// futuros filtros). O CTA de afiliado vem pronto (`affiliateUrl`) — o
// cliente não monta URL Amazon nem guarda a tag.
//
// Arquivo src/lib/quotes.ts não é mais consumido pelo app: virou o arquivo
// histórico (seed) que deu origem à tabela quotes no servidor.
const API_BASE = "https://api-scriptorium.narniano.com/api/v1";
const AUTHOR = encodeURIComponent("C. S. Lewis"); // param `?author` na API

export interface LewisQuote {
  id: string;
  quote: string;
  source: string | null;
  theme: string | null;
  affiliateUrl: string | null;
}

interface ApiQuote {
  id: string;
  text: string;
  source: string | null;
  theme: string | null;
  affiliateUrl: string | null;
}

function toLewisQuote(q: ApiQuote): LewisQuote {
  return { id: q.id, quote: q.text, source: q.source, theme: q.theme, affiliateUrl: q.affiliateUrl };
}

export async function fetchLewisQuotes(): Promise<LewisQuote[]> {
  const res = await fetch(`${API_BASE}/quotes?author=${AUTHOR}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as ApiQuote[];
  return data.map(toLewisQuote);
}

export async function fetchLewisQuoteById(id: string): Promise<LewisQuote | null> {
  const quotes = await fetchLewisQuotes();
  return quotes.find((q) => q.id === id) ?? null;
}

export async function fetchRandomLewisQuote(): Promise<LewisQuote | null> {
  const res = await fetch(`${API_BASE}/quotes/random?author=${AUTHOR}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return toLewisQuote((await res.json()) as ApiQuote);
}