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

// `try/catch` é obrigatório, não defensivo: `if (!res.ok)` só trata a RESPOSTA
// ruim, e a falha mais comum no mundo real — offline, DNS, timeout, corte de
// rede — é o `fetch` REJEITAR. Sem o catch, a rejeição escapa e quebra o
// contrato que os tipos prometem (`[]` / `null`), que é o que permite à UI
// degradar com elegância em vez de estourar. Foi assim que a rota
// /citacao/[id] acabou com `.catch(() => null)` colado nos dois call sites —
// remendo no consumidor em vez de consertar o módulo.
export async function fetchLewisQuotes(): Promise<LewisQuote[]> {
  try {
    const res = await fetch(`${API_BASE}/quotes?author=${AUTHOR}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as ApiQuote[];
    return data.map(toLewisQuote);
  } catch {
    return [];
  }
}

export async function fetchLewisQuoteById(id: string): Promise<LewisQuote | null> {
  const quotes = await fetchLewisQuotes();
  return quotes.find((q) => q.id === id) ?? null;
}

export async function fetchRandomLewisQuote(): Promise<LewisQuote | null> {
  try {
    const res = await fetch(`${API_BASE}/quotes/random?author=${AUTHOR}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return toLewisQuote((await res.json()) as ApiQuote);
  } catch {
    return null;
  }
}