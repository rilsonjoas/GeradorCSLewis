import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchLewisQuoteById,
  fetchLewisQuotes,
  fetchRandomLewisQuote,
  findLewisQuoteById,
  QuoteApiUnavailableError,
} from '../quote-api';

/**
 * Contrato do cliente da API do Scriptorium (fonte única, ADR 001).
 *
 * Este arquivo não tinha NENHUM teste, e é a única porta de entrada das
 * citações do Gerador: se a API mudar o nome de um campo ou o formato da
 * resposta, nada aqui avisa — o app só passa a exibir `undefined`.
 *
 * O `affiliateUrl` vem pronto do servidor (o cliente NÃO monta URL Amazon nem
 * carrega a tag), e pode ser `null`: desde o gate de CTA do Scriptorium
 * (2026-10-01), obra protegida cuja fonte não pôde ser verificada tem `source`
 * e `affiliateUrl` zerados em vez de link inventado. É o contrato que o
 * `QuoteGenerator` consome, então é o contrato que precisa estar testado.
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
  text: 'A maiorSubnet de happiness... (nota editorial)',
  source: null,
  theme: null,
  affiliateUrl: null,
};

function stubFetch(ok: boolean, body?: unknown, status = ok ? 200 : 500) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok, status, json: async () => body }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchLewisQuotes', () => {
  it('consome /quotes filtrado por author e mapeia text -> quote', async () => {
    stubFetch(true, [comCta]);
    const result = await fetchLewisQuotes();

    // O filtro por autor é o que garante que o Gerador só mostra Lewis.
    expect(fetch).toHaveBeenCalledWith(`${BASE}/quotes?author=C.%20S.%20Lewis`, {
      cache: 'no-store',
    });
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
    // Se alguém "consertar" o mapper com `affiliateUrl: q.affiliateUrl ?? ''`,
    // o app passa a renderizar um link Amazon quebrado em cima de uma obra
    // cuja fonte ninguém verificou. O null tem de chegar inteiro.
    stubFetch(true, [semCta]);
    const [quote] = await fetchLewisQuotes();

    expect(quote.source).toBeNull();
    expect(quote.affiliateUrl).toBeNull();
  });

  it('lista vazia da API → array vazio, sem exceção', async () => {
    stubFetch(true, []);
    expect(await fetchLewisQuotes()).toEqual([]);
  });

  it('API fora do ar → array vazio (não derruba a página)', async () => {
    stubFetch(false, undefined, 503);
    expect(await fetchLewisQuotes()).toEqual([]);
  });

  it('erro de rede → array vazio', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('falha de rede')));
    expect(await fetchLewisQuotes()).toEqual([]);
  });
});

describe('fetchRandomLewisQuote', () => {
  it('sorteia pela API e mapeia o resultado', async () => {
    stubFetch(true, comCta);
    const result = await fetchRandomLewisQuote();

    expect(fetch).toHaveBeenCalledWith(`${BASE}/quotes/random?author=C.%20S.%20Lewis`, {
      cache: 'no-store',
    });
    expect(result?.quote).toBe(comCta.text);
    expect(result?.affiliateUrl).toBe(comCta.affiliateUrl);
  });

  it('fonte zerada: devolve a citação com CTA nulo, não some com graça', async () => {
    // Regressão do gate de 2026-10-01: uma citação de Lewis sem fonte tem de
    // continuar SENDO MOSTRADA (só sem link), senão 8 citações do acervo
    // simplesmente desaparecem da rotação do Gerador.
    stubFetch(true, semCta);
    const result = await fetchRandomLewisQuote();

    expect(result).not.toBeNull();
    expect(result?.quote).toBe(semCta.text);
    expect(result?.affiliateUrl).toBeNull();
  });

  it('API fora do ar → null', async () => {
    stubFetch(false, undefined, 500);
    expect(await fetchRandomLewisQuote()).toBeNull();
  });
});

describe('fetchLewisQuoteById', () => {
  it('acha a citação pelo id na lista', async () => {
    stubFetch(true, [comCta, semCta]);
    const result = await fetchLewisQuoteById(semCta.id);

    expect(result?.id).toBe(semCta.id);
    expect(result?.affiliateUrl).toBeNull();
  });

  it('id inexistente → null (rota /citacao/[id] degrada)', async () => {
    stubFetch(true, [comCta]);
    expect(await fetchLewisQuoteById('nao-existe')).toBeNull();
  });
});

describe('campos opcionais da API (a especificação do Scriptorium os declara opcionais E anuláveis)', () => {
  // Achado do estudo da Fase 3 (2026-10-17): `source`, `theme` e `affiliateUrl` podem FALTAR na resposta,
  // não só vir null. O app promete `null` em `LewisQuote`; sem normalizar, chegaria `undefined`.
  const semCampos = { id: '33333333-3333-4333-8333-333333333333', text: 'Só id e texto.' };

  it('campo ausente vira null, não undefined (lista)', async () => {
    stubFetch(true, [semCampos]);
    const [quote] = await fetchLewisQuotes();
    expect(quote).toEqual({ id: semCampos.id, quote: semCampos.text, source: null, theme: null, affiliateUrl: null });
  });

  it('campo ausente vira null, não undefined (sorteio)', async () => {
    stubFetch(true, semCampos);
    const quote = await fetchRandomLewisQuote();
    expect(quote?.source).toBeNull();
    expect(quote?.theme).toBeNull();
    expect(quote?.affiliateUrl).toBeNull();
  });

  it('string vazia em affiliateUrl NÃO é trocada por null (só ausência é)', async () => {
    stubFetch(true, [{ ...comCta, affiliateUrl: '' }]);
    const [quote] = await fetchLewisQuotes();
    expect(quote.affiliateUrl).toBe('');
  });
});

describe('resposta fora do formato esperado', () => {
  it('itens sem id ou texto são descartados; os válidos continuam', async () => {
    stubFetch(true, [comCta, { id: 'x' }, { text: 'sem id' }, null, 42, 'texto']);
    const result = await fetchLewisQuotes();
    expect(result.map((q) => q.id)).toEqual([comCta.id]);
  });

  it.each([
    ['objeto em vez de lista', { error: 'x' }],
    ['null', null],
    ['texto', 'oops'],
  ])('corpo %s → fetchLewisQuotes devolve [] e findLewisQuoteById sinaliza API indisponível', async (_n, corpo) => {
    stubFetch(true, corpo);
    expect(await fetchLewisQuotes()).toEqual([]);
    await expect(findLewisQuoteById(comCta.id)).rejects.toBeInstanceOf(QuoteApiUnavailableError);
  });

  it('JSON inválido → API indisponível', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => { throw new SyntaxError('x'); } }),
    );
    await expect(findLewisQuoteById(comCta.id)).rejects.toBeInstanceOf(QuoteApiUnavailableError);
    expect(await fetchLewisQuotes()).toEqual([]);
  });

  it('sorteio com corpo que não é uma citação → null', async () => {
    stubFetch(true, { foo: 'bar' });
    expect(await fetchRandomLewisQuote()).toBeNull();
    stubFetch(true, [comCta]);
    expect(await fetchRandomLewisQuote()).toBeNull();
  });
});

describe('findLewisQuoteById: "a API deu um solavanco" é diferente de "a citação não existe"', () => {
  it('achada → a citação', async () => {
    stubFetch(true, [comCta, semCta]);
    expect((await findLewisQuoteById(semCta.id))?.id).toBe(semCta.id);
  });

  it('a API respondeu e o id não está na lista → null (404 legítimo)', async () => {
    stubFetch(true, [comCta]);
    expect(await findLewisQuoteById('nao-existe')).toBeNull();
  });

  it('lista vazia VÁLIDA → null (o acervo pode estar vazio, não é falha)', async () => {
    stubFetch(true, []);
    expect(await findLewisQuoteById(comCta.id)).toBeNull();
  });

  it.each([429, 500, 502, 503, 504])('HTTP %i → lança QuoteApiUnavailableError', async (status) => {
    stubFetch(false, undefined, status);
    await expect(findLewisQuoteById(comCta.id)).rejects.toBeInstanceOf(QuoteApiUnavailableError);
  });

  it('erro de rede → lança QuoteApiUnavailableError, guardando a causa', async () => {
    const causa = new Error('ECONNREFUSED');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(causa));
    const erro = await findLewisQuoteById(comCta.id).catch((e) => e);
    expect(erro).toBeInstanceOf(QuoteApiUnavailableError);
    expect((erro as Error).cause).toBe(causa);
  });

  it('a versão macia (fetchLewisQuoteById) continua devolvendo null nos dois casos', async () => {
    stubFetch(false, undefined, 503);
    expect(await fetchLewisQuoteById(comCta.id)).toBeNull();
  });
});
