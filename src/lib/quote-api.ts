// Fonte ÚNICA das citações de C.S. Lewis (ADR 001): a API do Scriptorium.
//
// Este módulo tem duas metades, e é importado por componente de navegador, então NÃO pode importar a
// cópia embutida (`src/data/lewis-quotes.snapshot.json`): isso vai para `quote-store.ts`, só servidor.
//  - `loadLewisQuotes`: o servidor do Gerador chama a API do Scriptorium (com limite de tempo).
//  - `fetchRandomLewisQuote`: o NAVEGADOR chama o próprio Gerador (`/api/citacao/aleatoria`), nunca o
//    Scriptorium. Assim a tela não depende de o Scriptorium estar no ar, e o limite de requisições dele
//    (100 por minuto por IP) não vira gargalo do tráfego do Gerador.
//
// O CTA de afiliado vem pronto (`affiliateUrl`): o cliente não monta URL Amazon nem guarda a tag.
//
// Arquivo src/lib/quotes.ts não é mais consumido pelo app: virou o arquivo histórico (seed) que deu
// origem à tabela quotes no servidor.
const API_BASE = "https://api-scriptorium.narniano.com/api/v1";
const AUTHOR = encodeURIComponent("C. S. Lewis"); // param `?author` na API

/** Rota do próprio Gerador que o navegador usa para sortear (ver `app/api/citacao/aleatoria/route.ts`). */
export const RANDOM_ROUTE = "/api/citacao/aleatoria";

/** Tempo máximo esperando o Scriptorium. Uma API LENTA é pior que uma API fora do ar: segura a página
 *  e o crawler. Passou disso, conta como indisponível e o armazém usa o que tem. */
export const API_TIMEOUT_MS = 3000;

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
export interface ApiQuote {
  id: string;
  text: string;
  source?: string | null;
  theme?: string | null;
  affiliateUrl?: string | null;
}

export function toLewisQuote(q: ApiQuote): LewisQuote {
  return {
    id: q.id,
    quote: q.text,
    source: q.source ?? null,
    theme: q.theme ?? null,
    affiliateUrl: q.affiliateUrl ?? null,
  };
}

/** Item mínimo para exibir: sem `id` ou `text` (não vazio) não há o que mostrar nem linkar. */
export function isApiQuote(x: unknown): x is ApiQuote {
  if (typeof x !== "object" || x === null) return false;
  const q = x as Record<string, unknown>;
  return typeof q.id === "string" && typeof q.text === "string" && q.text.trim() !== "";
}

/** A API do Scriptorium não respondeu de forma utilizável (rede, tempo esgotado, 4xx/5xx, corpo que não
 *  é a lista esperada ou lista vazia). Existe para NÃO confundir "a API deu um solavanco" com "esta
 *  citação não existe": o primeiro caso é transitório e não pode virar 404 para o crawler. */
export class QuoteApiUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "QuoteApiUnavailableError";
  }
}

/** Lista completa de citações de Lewis, direto do Scriptorium. Lança `QuoteApiUnavailableError` em
 *  qualquer falha. Uma lista VAZIA também conta como falha: o acervo não esvazia de verdade, e aceitar
 *  `[]` faria um erro do lado de lá apagar a lista que o armazém já tem. */
export async function loadLewisQuotes(timeoutMs: number = API_TIMEOUT_MS): Promise<LewisQuote[]> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/quotes?author=${AUTHOR}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (cause) {
    throw new QuoteApiUnavailableError("falha de rede ou tempo esgotado ao buscar as citações", { cause });
  }
  if (!res.ok) throw new QuoteApiUnavailableError(`API respondeu HTTP ${res.status}`);
  let data: unknown;
  try {
    data = await res.json();
  } catch (cause) {
    throw new QuoteApiUnavailableError("resposta da API não é JSON", { cause });
  }
  if (!Array.isArray(data)) throw new QuoteApiUnavailableError("resposta da API não é uma lista");
  const quotes = data.filter(isApiQuote).map(toLewisQuote);
  if (quotes.length === 0) throw new QuoteApiUnavailableError("a API devolveu uma lista sem citações válidas");
  return quotes;
}

/** Sorteio para o NAVEGADOR: chama o próprio Gerador, que sorteia na lista que já tem (ao vivo, em
 *  memória ou a cópia embutida). `null` só se o próprio Gerador estiver inalcançável. */
export async function fetchRandomLewisQuote(): Promise<LewisQuote | null> {
  try {
    const res = await fetch(RANDOM_ROUTE, { cache: "no-store" });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (typeof data !== "object" || data === null) return null;
    const q = data as Record<string, unknown>;
    if (typeof q.id !== "string" || typeof q.quote !== "string" || q.quote.trim() === "") return null;
    return {
      id: q.id,
      quote: q.quote,
      source: typeof q.source === "string" ? q.source : null,
      theme: typeof q.theme === "string" ? q.theme : null,
      affiliateUrl: typeof q.affiliateUrl === "string" ? q.affiliateUrl : null,
    };
  } catch {
    return null;
  }
}
