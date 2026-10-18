import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchRandomLewisQuote,
  loadLewisQuotes,
  QuoteApiUnavailableError,
  RANDOM_ROUTE,
} from '../quote-api';

/**
 * Contrato do cliente da API do Scriptorium (fonte única, ADR 001) e do sorteio do navegador.
 *
 * `loadLewisQuotes` roda no SERVIDOR do Gerador e fala com o Scriptorium. `fetchRandomLewisQuote` roda no
 * NAVEGADOR e fala só com o próprio Gerador (`/api/citacao/aleatoria`).
 *
 * O `affiliateUrl` vem pronto do servidor (o cliente NÃO monta URL Amazon nem carrega a tag), e pode ser
 * `null`: desde o gate de CTA do Scriptorium (2026-10-01), obra protegida cuja fonte não pôde ser verificada
 * tem `source` e `affiliateUrl` zerados em vez de link inventado.
 */

const BASE = 'https://api-scriptorium.narniano.com/api/v1';

/** Citação com CTA — caminho normal, obra verificada. */
const comCta = {
  id: '11111111-1111-4111-8111-111111111111',
  text: 'A porta para o inferno está trancada por dentro.',
  source: 'O Problema do Sofrimento',
  theme: 'medo',
  affiliateUrl: 'https://www.amazon.com.br/s?k=O%20Problema%20do%20Sofrimento&tag=rilson-20',
};

/** Citação com fonte zerada pelo gate: obra protegida, SEM CTA. */
const semCta = {
  id: '22222222-2222-4222-8222-222222222222',
  text: 'Uma citação cuja obra protegida não teve a fonte verificada.',
  source: null,
  theme: null,
  affiliateUrl: null,
};

function stubFetch(ok: boolean, body?: unknown, status = ok ? 200 : 500) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok, status, json: async () => body }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('loadLewisQuotes (servidor -> Scriptorium)', () => {
  it('consome /quotes filtrado por author, sem cache, com limite de tempo, e mapeia text -> quote', async () => {
    stubFetch(true, [comCta]);
    const result = await loadLewisQuotes();

    // O filtro por autor é o que garante que o Gerador só mostra Lewis.
    expect(fetch).toHaveBeenCalledWith(
      `${BASE}/quotes?author=C.%20S.%20Lewis`,
      expect.objectContaining({ cache: 'no-store', signal: expect.any(AbortSignal) }),
    );
    expect(result).toEqual([
      {
        id: comCta.id,
        quote: comCta.text, // a API chama `text`, o app chama `quote`
        source: comCta.source,
        theme: comCta.theme,
        affiliateUrl: comCta.affiliateUrl,
      },
    ]);
  });

  it('preserva affiliateUrl null (obra protegida sem fonte verificada)', async () => {
    // Se alguém "consertar" o mapper com `affiliateUrl: q.affiliateUrl ?? ''`, o app passa a renderizar um
    // link Amazon quebrado em cima de uma obra cuja fonte ninguém verificou. O null tem de chegar inteiro.
    stubFetch(true, [semCta]);
    const [quote] = await loadLewisQuotes();
    expect(quote!.source).toBeNull();
    expect(quote!.affiliateUrl).toBeNull();
  });

  describe('campos opcionais (a especificação do Scriptorium os declara opcionais E anuláveis)', () => {
    const semCampos = { id: '33333333-3333-4333-8333-333333333333', text: 'Só id e texto.' };

    it('campo ausente vira null, não undefined', async () => {
      stubFetch(true, [semCampos]);
      const [quote] = await loadLewisQuotes();
      expect(quote).toEqual({ id: semCampos.id, quote: semCampos.text, source: null, theme: null, affiliateUrl: null });
    });

    it('string vazia em affiliateUrl NÃO é trocada por null (só ausência é)', async () => {
      stubFetch(true, [{ ...comCta, affiliateUrl: '' }]);
      const [quote] = await loadLewisQuotes();
      expect(quote!.affiliateUrl).toBe('');
    });
  });

  describe('resposta fora do formato esperado', () => {
    it('itens sem id ou texto (ou com texto em branco) são descartados; os válidos continuam', async () => {
      stubFetch(true, [comCta, { id: 'x' }, { text: 'sem id' }, { id: 'y', text: '   ' }, null, 42, 'texto']);
      const result = await loadLewisQuotes();
      expect(result.map((q) => q.id)).toEqual([comCta.id]);
    });

    it.each([
      ['objeto em vez de lista', { error: 'x' }],
      ['null', null],
      ['texto', 'oops'],
    ])('corpo %s → API indisponível', async (_nome, corpo) => {
      stubFetch(true, corpo);
      await expect(loadLewisQuotes()).rejects.toBeInstanceOf(QuoteApiUnavailableError);
    });

    it('lista vazia → API indisponível (o acervo não esvazia de verdade; aceitar [] apagaria a lista que já se tem)', async () => {
      stubFetch(true, []);
      await expect(loadLewisQuotes()).rejects.toBeInstanceOf(QuoteApiUnavailableError);
    });

    it('lista só com itens inválidos → API indisponível', async () => {
      stubFetch(true, [{ id: 'x' }, null]);
      await expect(loadLewisQuotes()).rejects.toBeInstanceOf(QuoteApiUnavailableError);
    });

    it('JSON inválido → API indisponível', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => {
            throw new SyntaxError('x');
          },
        }),
      );
      await expect(loadLewisQuotes()).rejects.toBeInstanceOf(QuoteApiUnavailableError);
    });
  });

  describe('falhas de rede e de servidor', () => {
    it.each([429, 500, 502, 503, 504])('HTTP %i → API indisponível', async (status) => {
      stubFetch(false, undefined, status);
      await expect(loadLewisQuotes()).rejects.toBeInstanceOf(QuoteApiUnavailableError);
    });

    it('erro de rede → API indisponível, guardando a causa', async () => {
      const causa = new Error('ECONNREFUSED');
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(causa));
      const erro = await loadLewisQuotes().catch((e) => e);
      expect(erro).toBeInstanceOf(QuoteApiUnavailableError);
      expect((erro as Error).cause).toBe(causa);
    });

    it('API LENTA: passou do limite de tempo, vira indisponível em vez de segurar a página', async () => {
      // Uma API lenta é pior que uma fora do ar: sem limite, a página e o crawler esperariam sem fim.
      vi.stubGlobal(
        'fetch',
        vi.fn(
          (_url: string, init?: { signal?: AbortSignal }) =>
            new Promise((_resolve, reject) => {
              init?.signal?.addEventListener('abort', () => reject(init.signal!.reason));
            }),
        ),
      );
      const inicio = Date.now();
      await expect(loadLewisQuotes(30)).rejects.toBeInstanceOf(QuoteApiUnavailableError);
      expect(Date.now() - inicio).toBeLessThan(2000);
    });
  });
});

describe('fetchRandomLewisQuote (navegador -> o próprio Gerador)', () => {
  const doGerador = { id: comCta.id, quote: comCta.text, source: comCta.source, theme: comCta.theme, affiliateUrl: comCta.affiliateUrl };

  it('chama a rota do Gerador, nunca o Scriptorium, sem cache', async () => {
    stubFetch(true, doGerador);
    const result = await fetchRandomLewisQuote();

    expect(fetch).toHaveBeenCalledWith(RANDOM_ROUTE, { cache: 'no-store' });
    expect(RANDOM_ROUTE).toBe('/api/citacao/aleatoria');
    expect(String((fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]![0])).not.toContain('scriptorium');
    expect(result).toEqual(doGerador);
  });

  it('fonte zerada: devolve a citação com CTA nulo, não some com graça', async () => {
    // Regressão do gate de 2026-10-01: uma citação de Lewis sem fonte tem de continuar SENDO MOSTRADA (só sem
    // link), senão 8 citações do acervo simplesmente desaparecem da rotação do Gerador.
    stubFetch(true, { id: semCta.id, quote: semCta.text, source: null, theme: null, affiliateUrl: null });
    const result = await fetchRandomLewisQuote();
    expect(result).not.toBeNull();
    expect(result?.quote).toBe(semCta.text);
    expect(result?.affiliateUrl).toBeNull();
  });

  it('campo ausente na resposta vira null', async () => {
    stubFetch(true, { id: 'abc', quote: 'Só isto.' });
    expect(await fetchRandomLewisQuote()).toEqual({ id: 'abc', quote: 'Só isto.', source: null, theme: null, affiliateUrl: null });
  });

  it.each([
    ['HTTP 503', () => stubFetch(false, undefined, 503)],
    ['HTTP 500', () => stubFetch(false, undefined, 500)],
    ['corpo que não é citação', () => stubFetch(true, { foo: 'bar' })],
    ['lista em vez de citação', () => stubFetch(true, [doGerador])],
    ['citação sem texto', () => stubFetch(true, { id: 'a', quote: '  ' })],
    ['null', () => stubFetch(true, null)],
    ['rede', () => vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('rede')))],
  ])('%s → null (a tela mantém a citação atual)', async (_nome, preparar) => {
    preparar();
    expect(await fetchRandomLewisQuote()).toBeNull();
  });
});
