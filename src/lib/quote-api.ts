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

// Campos opcionais de verdade: a especificação OpenAPI do Scriptorium declara `source`, `theme` e
// `affiliateUrl` como opcionais E anuláveis (podem faltar, não só vir null). O app promete `null`
// em `LewisQuote`, então a normalização é aqui (achado do estudo da Fase 3, 2026-10-17).
interface ApiQuote {
  id: string;
  text: string;
  source?: string | null;
  theme?: string | null;
  affiliateUrl?: string | null;
}

function toLewisQuote(q: ApiQuote): LewisQuote {
  return {
    id: q.id,
    quote: q.text,
    source: q.source ?? null,
    theme: q.theme ?? null,
    affiliateUrl: q.affiliateUrl ?? null,
  };
}

/** Item mínimo para exibir: sem `id` ou `text` não há o que mostrar nem linkar. */
function isApiQuote(x: unknown): x is ApiQuote {
  if (typeof x !== "object" || x === null) return false;
  const q = x as Record<string, unknown>;
  return typeof q.id === "string" && typeof q.text === "string";
}

/** A API do Scriptorium não respondeu de forma utilizável (rede, 4xx/5xx ou corpo que não é a lista
 *  esperada). Existe para NÃO confundir "a API deu um solavanco" com "esta citação não existe":
 *  o primeiro caso é transitório e não pode virar 404 para o crawler (ver `findLewisQuoteById`). */
export class QuoteApiUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "QuoteApiUnavailableError";
  }
}

async function loadLewisQuotes(): Promise<LewisQuote[]> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/quotes?author=${AUTHOR}`, { cache: "no-store" });
  } catch (cause) {
    throw new QuoteApiUnavailableError("falha de rede ao buscar as citações", { cause });
  }
  if (!res.ok) throw new QuoteApiUnavailableError(`API respondeu HTTP ${res.status}`);
  let data: unknown;
  try {
    data = await res.json();
  } catch (cause) {
    throw new QuoteApiUnavailableError("resposta da API não é JSON", { cause });
  }
  if (!Array.isArray(data)) throw new QuoteApiUnavailableError("resposta da API não é uma lista");
  return data.filter(isApiQuote).map(toLewisQuote);
}

// `try/catch` é obrigatório, não defensivo: `if (!res.ok)` só trata a RESPOSTA
// ruim, e a falha mais comum no mundo real — offline, DNS, timeout, corte de
// rede — é o `fetch` REJEITAR. Sem o catch, a rejeição escapa e quebra o
// contrato que os tipos prometem (`[]` / `null`), que é o que permite à UI
// degradar com elegância em vez de estourar. Foi assim que a rota
// /citacao/[id] acabou com `.catch(() => null)` colado nos dois call sites —
// remendo no consumidor em vez de consertar o módulo.
//
// Versão "macia" para quem pode degradar (sitemap, metadados): API fora do ar vira `[]`.
export async function fetchLewisQuotes(): Promise<LewisQuote[]> {
  try {
    return await loadLewisQuotes();
  } catch {
    return [];
  }
}

/** Procura a citação pelo id. `null` = a API respondeu e a citação não existe (404 legítimo).
 *  Lança `QuoteApiUnavailableError` quando a API não respondeu: quem chama decide (a página devolve
 *  500, que o crawler repete, em vez de 404, que ele esquece). */
export async function findLewisQuoteById(id: string): Promise<LewisQuote | null> {
  const quotes = await loadLewisQuotes();
  return quotes.find((q) => q.id === id) ?? null;
}

// Versão "macia": API fora do ar também vira `null`. Use só onde falhar não pode derrubar a tela.
export async function fetchLewisQuoteById(id: string): Promise<LewisQuote | null> {
  try {
    return await findLewisQuoteById(id);
  } catch {
    return null;
  }
}

export async function fetchRandomLewisQuote(): Promise<LewisQuote | null> {
  try {
    const res = await fetch(`${API_BASE}/quotes/random?author=${AUTHOR}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return isApiQuote(data) ? toLewisQuote(data) : null;
  } catch {
    return null;
  }
}
