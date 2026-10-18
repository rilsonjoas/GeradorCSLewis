import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LewisQuote } from '@/lib/quote-api';

const pick = vi.fn();
vi.mock('@/lib/quote-store', () => ({ pickRandomLewisQuote: () => pick() }));

const citacao: LewisQuote = { id: 'abc', quote: 'Texto.', source: 'Obra', theme: null, affiliateUrl: null };

async function chamar() {
  const { GET } = await import('../route');
  return GET();
}

beforeEach(() => {
  pick.mockReset();
});

describe('GET /api/citacao/aleatoria', () => {
  it('devolve a citação sorteada, nunca em cache, informando de onde veio a lista', async () => {
    pick.mockResolvedValue({ quote: citacao, origem: 'ao-vivo' });
    const res = await chamar();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(citacao);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(res.headers.get('X-Citacao-Origem')).toBe('ao-vivo');
  });

  it('com o Scriptorium fora, responde 200 a partir da reserva e diz isso no cabeçalho', async () => {
    pick.mockResolvedValue({ quote: citacao, origem: 'reserva' });
    const res = await chamar();
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Citacao-Origem')).toBe('reserva');
  });

  it('sem nenhuma citação em lugar nenhum: 503, também sem cache', async () => {
    pick.mockResolvedValue({ quote: null, origem: 'reserva' });
    const res = await chamar();
    expect(res.status).toBe(503);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });

  it('a rota é dinâmica (force-dynamic), senão o Next a congelaria no build', async () => {
    const mod = await import('../route');
    expect(mod.dynamic).toBe('force-dynamic');
  });
});
