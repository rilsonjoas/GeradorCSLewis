// Armazém de citações do servidor do Gerador: o Gerador não depende de o Scriptorium estar no ar.
//
// Ordem de preferência, em cada pedido:
//  1. lista em memória FRESCA (menos de `TTL_MS`): nenhuma chamada ao Scriptorium;
//  2. lista nova do Scriptorium (com limite de tempo), que vira a lista em memória;
//  3. a última lista boa que se tem, MESMO VENCIDA ("stale-while-error"): API fora não apaga o que já se sabe;
//  4. a cópia embutida (`src/data/lewis-quotes.snapshot.json`), só se o processo acabou de subir e a API
//     está fora.
//
// Depois de uma falha, não tenta de novo por `FALHA_ESPERA_MS`: sem isso, cada visita durante uma queda
// esperaria o limite de tempo inteiro. Atualizações concorrentes dividem uma única chamada.
//
// Estado em memória do processo (o container é único). Importa a cópia embutida: usar SÓ no servidor,
// nunca em componente de navegador (ver `quote-api.ts`).
import snapshot from "@/data/lewis-quotes.snapshot.json";
import {
  isApiQuote,
  loadLewisQuotes,
  QuoteApiUnavailableError,
  toLewisQuote,
  type LewisQuote,
} from "@/lib/quote-api";

export const TTL_MS = 10 * 60 * 1000;
export const FALHA_ESPERA_MS = 30 * 1000;

export type OrigemDasCitacoes = "ao-vivo" | "memoria" | "reserva";

export interface ListaDeCitacoes {
  quotes: LewisQuote[];
  /** `ao-vivo`: acabou de vir do Scriptorium. `memoria`: lista guardada (fresca ou vencida). `reserva`: cópia embutida. */
  origem: OrigemDasCitacoes;
  /** A lista veio do Scriptorium há menos de `TTL_MS`: "o id não está nela" significa "não existe". */
  autoritativa: boolean;
}

interface Guardada {
  quotes: LewisQuote[];
  em: number;
}

let guardada: Guardada | null = null;
let ultimaFalhaEm: number | null = null;
let atualizando: Promise<boolean> | null = null;

/** Só para os testes. */
export function resetQuoteStore(): void {
  guardada = null;
  ultimaFalhaEm = null;
  atualizando = null;
}

/** A cópia embutida, já no formato do app. Se a cópia estiver corrompida devolve `[]` (o teste de CI
 *  impede que isso chegue ao ar). */
export function reservaEmbutida(): LewisQuote[] {
  const lista: unknown = (snapshot as { citacoes?: unknown }).citacoes;
  return Array.isArray(lista) ? lista.filter(isApiQuote).map(toLewisQuote) : [];
}

function atualizar(): Promise<boolean> {
  if (atualizando) return atualizando;
  atualizando = (async () => {
    try {
      const quotes = await loadLewisQuotes();
      guardada = { quotes, em: Date.now() };
      ultimaFalhaEm = null;
      return true;
    } catch (erro) {
      if (!(erro instanceof QuoteApiUnavailableError)) throw erro;
      ultimaFalhaEm = Date.now();
      return false;
    } finally {
      atualizando = null;
    }
  })();
  return atualizando;
}

/** Nunca lança por causa do Scriptorium: sempre devolve alguma lista. */
export async function getLewisQuotes(): Promise<ListaDeCitacoes> {
  const agora = Date.now();
  if (guardada && agora - guardada.em < TTL_MS) {
    return { quotes: guardada.quotes, origem: "memoria", autoritativa: true };
  }

  const emFalhaRecente = ultimaFalhaEm !== null && agora - ultimaFalhaEm < FALHA_ESPERA_MS;
  if (!emFalhaRecente) {
    const ok = await atualizar();
    if (ok && guardada) return { quotes: guardada.quotes, origem: "ao-vivo", autoritativa: true };
  }

  if (guardada) return { quotes: guardada.quotes, origem: "memoria", autoritativa: false };
  return { quotes: reservaEmbutida(), origem: "reserva", autoritativa: false };
}

/** Sorteio uniforme na lista disponível (`random` é injetável para teste). `null` só se não houver
 *  nenhuma citação em lugar nenhum, o que o teste da cópia embutida impede. */
export async function pickRandomLewisQuote(random: () => number = Math.random): Promise<{
  quote: LewisQuote | null;
  origem: OrigemDasCitacoes;
}> {
  const { quotes, origem } = await getLewisQuotes();
  if (quotes.length === 0) return { quote: null, origem };
  const i = Math.min(quotes.length - 1, Math.floor(random() * quotes.length));
  return { quote: quotes[i] ?? null, origem };
}

/** Procura pelo id. `null` = a lista do Scriptorium é recente e o id não está nela (404 legítimo).
 *  Lança `QuoteApiUnavailableError` quando o id não está numa lista que NÃO é autoritativa (vencida ou a
 *  cópia embutida): ele pode ser uma citação nova que só o Scriptorium conhece; a página responde 500,
 *  que o crawler repete, em vez de 404, que ele esquece. */
export async function findLewisQuoteById(id: string): Promise<LewisQuote | null> {
  const { quotes, autoritativa } = await getLewisQuotes();
  const achada = quotes.find((q) => q.id === id);
  if (achada) return achada;
  if (autoritativa) return null;
  throw new QuoteApiUnavailableError("o Scriptorium está fora e esta citação não está na lista que o Gerador tem");
}
