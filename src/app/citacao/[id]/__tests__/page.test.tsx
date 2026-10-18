import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LewisQuote } from '@/lib/quote-api';

/**
 * A página /citacao/[id] tem de distinguir "a citação não existe" (404) de "não dá para saber, porque o
 * Scriptorium está fora e a lista que o Gerador tem não é recente" (500, que o crawler repete). Antes os dois
 * viravam 404: um solavanco da API (por exemplo durante o deploy dela) fazia uma citação válida parecer
 * removida para o Google. Com o armazém, a maioria das quedas nem chega aqui: a página sai normalmente.
 */

class NextNotFound extends Error {
  constructor() {
    super('NEXT_NOT_FOUND');
  }
}

const notFound = vi.fn(() => {
  throw new NextNotFound();
});

vi.mock('next/navigation', () => ({ notFound: () => notFound() }));
vi.mock('@/components/QuoteGenerator', () => ({ default: () => null }));
vi.mock('@/components/PageShell', () => ({ PageShell: ({ children }: { children: unknown }) => children }));

const findLewisQuoteById = vi.fn();
vi.mock('@/lib/quote-store', () => ({ findLewisQuoteById: (id: string) => findLewisQuoteById(id) }));

const citacao: LewisQuote = { id: 'abc', quote: 'Texto.', source: 'Obra', theme: null, affiliateUrl: null };

async function renderPage(id: string) {
  const { default: QuotePage } = await import('../page');
  return QuotePage({ params: { id } });
}

beforeEach(() => {
  notFound.mockClear();
  findLewisQuoteById.mockReset();
});

afterEach(() => {
  vi.resetModules();
});

describe('/citacao/[id]', () => {
  it('citação existente → renderiza, sem 404', async () => {
    findLewisQuoteById.mockResolvedValue(citacao);
    const arvore = await renderPage('abc');
    expect(arvore).toBeTruthy();
    expect(notFound).not.toHaveBeenCalled();
    expect(findLewisQuoteById).toHaveBeenCalledWith('abc');
  });

  it('id que a API não conhece → 404 (notFound)', async () => {
    findLewisQuoteById.mockResolvedValue(null);
    await expect(renderPage('nao-existe')).rejects.toBeInstanceOf(NextNotFound);
    expect(notFound).toHaveBeenCalledTimes(1);
  });

  it('API fora do ar → o erro SOBE (500) e NÃO vira 404', async () => {
    const { QuoteApiUnavailableError } = await import('@/lib/quote-api');
    findLewisQuoteById.mockRejectedValue(new QuoteApiUnavailableError('API respondeu HTTP 503'));
    await expect(renderPage('abc')).rejects.toBeInstanceOf(QuoteApiUnavailableError);
    expect(notFound).not.toHaveBeenCalled();
  });
});
