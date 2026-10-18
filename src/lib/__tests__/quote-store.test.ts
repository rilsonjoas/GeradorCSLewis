import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QuoteApiUnavailableError } from '../quote-api';
import {
  FALHA_ESPERA_MS,
  findLewisQuoteById,
  getLewisQuotes,
  pickRandomLewisQuote,
  reservaEmbutida,
  resetQuoteStore,
  TTL_MS,
} from '../quote-store';

/**
 * O armazém é o que faz o Gerador não depender de o Scriptorium estar no ar. Estes testes cobrem a ordem de
 * preferência (memória fresca > API > última lista boa mesmo vencida > cópia embutida), a espera depois de
 * falha, a deduplicação de chamadas simultâneas e o que significa "id não encontrado" em cada caso.
 */

const api = (n: number) => ({ id: `id-${n}`, text: `Citação ${n}.`, source: 'Obra', theme: null, affiliateUrl: null });
const lista = (...ns: number[]) => ns.map(api);

let respostas: Array<() => Promise<unknown>>;
let chamadas: number;

function programa(...passos: Array<'ok-1' | 'ok-2' | 'cai' | 'vazia' | 'lenta-ok-1'>) {
  respostas = passos.map((p) => async () => {
    if (p === 'cai') throw new Error('ECONNREFUSED');
    if (p === 'vazia') return { ok: true, status: 200, json: async () => [] };
    if (p === 'ok-2') return { ok: true, status: 200, json: async () => lista(3, 4) };
    return { ok: true, status: 200, json: async () => lista(1, 2) };
  });
  chamadas = 0;
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      const passo = respostas[Math.min(chamadas, respostas.length - 1)]!;
      chamadas++;
      return passo();
    }),
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-17T12:00:00Z'));
  resetQuoteStore();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('getLewisQuotes: ordem de preferência', () => {
  it('primeira chamada busca no Scriptorium (ao-vivo) e a lista é autoritativa', async () => {
    programa('ok-1');
    const r = await getLewisQuotes();
    expect(r.origem).toBe('ao-vivo');
    expect(r.autoritativa).toBe(true);
    expect(r.quotes.map((q) => q.id)).toEqual(['id-1', 'id-2']);
    expect(chamadas).toBe(1);
  });

  it('dentro do TTL usa a memória e NÃO chama o Scriptorium de novo', async () => {
    programa('ok-1');
    await getLewisQuotes();
    vi.advanceTimersByTime(TTL_MS - 1000);
    const r = await getLewisQuotes();
    expect(r.origem).toBe('memoria');
    expect(r.autoritativa).toBe(true);
    expect(chamadas).toBe(1);
  });

  it('vencido o TTL busca de novo e passa a mostrar o acervo atualizado', async () => {
    programa('ok-1', 'ok-2');
    await getLewisQuotes();
    vi.advanceTimersByTime(TTL_MS + 1);
    const r = await getLewisQuotes();
    expect(r.origem).toBe('ao-vivo');
    expect(r.quotes.map((q) => q.id)).toEqual(['id-3', 'id-4']);
    expect(chamadas).toBe(2);
  });
});

describe('getLewisQuotes: Scriptorium fora do ar', () => {
  it('processo recém-subido e API fora: usa a cópia embutida, e ela NÃO é autoritativa', async () => {
    programa('cai');
    const r = await getLewisQuotes();
    expect(r.origem).toBe('reserva');
    expect(r.autoritativa).toBe(false);
    expect(r.quotes.length).toBeGreaterThan(50);
    expect(r.quotes).toEqual(reservaEmbutida());
  });

  it('API cai depois de já ter lista: continua servindo a última lista boa, mesmo vencida', async () => {
    programa('ok-1', 'cai');
    await getLewisQuotes();
    vi.advanceTimersByTime(TTL_MS + 1);
    const r = await getLewisQuotes();
    expect(r.origem).toBe('memoria');
    expect(r.autoritativa).toBe(false); // vencida: "id ausente" já não prova que não existe
    expect(r.quotes.map((q) => q.id)).toEqual(['id-1', 'id-2']); // NÃO caiu para a cópia embutida
  });

  it('depois de uma falha, não tenta de novo durante a espera (cada visita não paga o limite de tempo)', async () => {
    programa('cai', 'ok-1');
    await getLewisQuotes();
    expect(chamadas).toBe(1);
    vi.advanceTimersByTime(FALHA_ESPERA_MS - 1000);
    const r = await getLewisQuotes();
    expect(r.origem).toBe('reserva');
    expect(chamadas).toBe(1); // nenhuma chamada nova
  });

  it('passada a espera, tenta de novo e se recupera sozinho', async () => {
    programa('cai', 'ok-1');
    await getLewisQuotes();
    vi.advanceTimersByTime(FALHA_ESPERA_MS + 1);
    const r = await getLewisQuotes();
    expect(r.origem).toBe('ao-vivo');
    expect(r.autoritativa).toBe(true);
    expect(chamadas).toBe(2);
  });

  it('lista VAZIA do Scriptorium é tratada como falha e NÃO apaga a lista que já se tem', async () => {
    programa('ok-1', 'vazia');
    await getLewisQuotes();
    vi.advanceTimersByTime(TTL_MS + 1);
    const r = await getLewisQuotes();
    expect(r.quotes.map((q) => q.id)).toEqual(['id-1', 'id-2']);
    expect(r.autoritativa).toBe(false);
  });

  it('nunca lança por causa do Scriptorium, em nenhuma das falhas', async () => {
    for (const falha of ['cai', 'vazia'] as const) {
      resetQuoteStore();
      programa(falha);
      await expect(getLewisQuotes()).resolves.toMatchObject({ origem: 'reserva' });
    }
  });
});

describe('getLewisQuotes: chamadas simultâneas', () => {
  it('várias visitas ao mesmo tempo dividem UMA chamada ao Scriptorium', async () => {
    programa('ok-1');
    const todas = await Promise.all(Array.from({ length: 25 }, () => getLewisQuotes()));
    expect(chamadas).toBe(1);
    expect(new Set(todas.map((r) => r.quotes[0]!.id)).size).toBe(1);
  });
});

describe('pickRandomLewisQuote', () => {
  it('é uniforme sobre a lista: cada posição é alcançável e o sorteio nunca sai dos limites', async () => {
    programa('ok-1');
    expect((await pickRandomLewisQuote(() => 0)).quote?.id).toBe('id-1');
    expect((await pickRandomLewisQuote(() => 0.49)).quote?.id).toBe('id-1');
    expect((await pickRandomLewisQuote(() => 0.5)).quote?.id).toBe('id-2');
    expect((await pickRandomLewisQuote(() => 0.9999999)).quote?.id).toBe('id-2');
    expect((await pickRandomLewisQuote(() => 1)).quote?.id).toBe('id-2'); // borda: nunca fora do limite
  });

  it('de fato sorteia (Math.random): todas as citações aparecem com a lista toda disponível', async () => {
    programa('ok-1');
    const vistas = new Set<string>();
    for (let i = 0; i < 200; i++) vistas.add((await pickRandomLewisQuote()).quote!.id);
    expect(vistas).toEqual(new Set(['id-1', 'id-2']));
  });

  it('com o Scriptorium fora do ar o botão CONTINUA sorteando, na cópia embutida', async () => {
    programa('cai');
    const reserva = new Set(reservaEmbutida().map((q) => q.id));
    const sorteadas = new Set<string>();
    for (let i = 0; i < 60; i++) {
      const { quote, origem } = await pickRandomLewisQuote();
      expect(origem).toBe('reserva');
      expect(reserva.has(quote!.id)).toBe(true);
      sorteadas.add(quote!.id);
    }
    expect(sorteadas.size).toBeGreaterThan(20); // sorteia de verdade, não devolve sempre a mesma
  });
});

describe('findLewisQuoteById: o que "não encontrado" significa', () => {
  it('lista recente do Scriptorium e o id está nela → a citação', async () => {
    programa('ok-1');
    expect((await findLewisQuoteById('id-2'))?.quote).toBe('Citação 2.');
  });

  it('lista recente e o id NÃO está nela → null (404 legítimo)', async () => {
    programa('ok-1');
    expect(await findLewisQuoteById('nao-existe')).toBeNull();
  });

  it('Scriptorium fora e o id está na cópia embutida → a página funciona (200)', async () => {
    programa('cai');
    const id = reservaEmbutida()[0]!.id;
    expect((await findLewisQuoteById(id))?.id).toBe(id);
  });

  it('Scriptorium fora e o id NÃO está na cópia → lança (500, o crawler repete): pode ser citação nova', async () => {
    programa('cai');
    await expect(findLewisQuoteById('id-novo-que-so-o-scriptorium-conhece')).rejects.toBeInstanceOf(
      QuoteApiUnavailableError,
    );
  });

  it('lista em memória VENCIDA e id ausente → lança, não 404', async () => {
    programa('ok-1', 'cai');
    await getLewisQuotes();
    vi.advanceTimersByTime(TTL_MS + 1);
    await expect(findLewisQuoteById('nao-existe')).rejects.toBeInstanceOf(QuoteApiUnavailableError);
  });
});
