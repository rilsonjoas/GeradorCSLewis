// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuoteGenerator from '../QuoteGenerator';
import type { LewisQuote } from '@/lib/quote-api';

/**
 * Contrato de CTA do QuoteGenerator contra a API do Scriptorium.
 *
 * O componente tem duas camadas de guarda no bloco da fonte
 * (`currentQuote && currentQuote.source`, e dentro disso
 * `currentQuote.affiliateUrl ? <a> : <span>`). Nenhuma delas tinha teste, e
 * nenhuma delas pode ser removida sem consequência visível:
 *
 *  - sem `affiliateUrl`, tem de cair para `<span>` (obra protegida com fonte
 *    mas sem CTA — texto puro, sem link, e sem sublinhado que finge ser link);
 *  - sem `source`, o bloco inteiro não renderiza, porque o `source` é o que dá
 *    nome ao CTA ("— {source}") — sem ele apareceria "— null ↗".
 *
 * O caso `source: null` é o que o gate de CTA do Scriptorium passou a
 * produzir em 8 citações de Lewis (obra protegida cuja fonte não pôde ser
 * verificada não vira link de afiliado nem título inventado).
 */

const replace = vi.fn();
const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// `next/image` em jsdom não resolve o otimizador; um <img> puro basta para
// os testes de contrato (não testamos layout de imagem).
vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt?: string }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img alt={alt ?? ''} {...props} />;
  },
}));

const comCta: LewisQuote = {
  id: '11111111-1111-4111-8111-111111111111',
  quote: 'A porta para o inferno está trancada por dentro.',
  source: 'O Problema do Sofrimento',
  theme: 'medo',
  affiliateUrl: 'https://www.amazon.com.br/s?k=O%20Problema%20do%20Sofrimento&tag=rilson-20',
};

const semFonte: LewisQuote = {
  id: '22222222-2222-4222-8222-222222222222',
  quote: 'Nota editorial sobre happiness sem obra verificável.',
  source: null,
  theme: null,
  affiliateUrl: null,
};

/** Elemento que renderiza a OBRA — o nome da fonte vive num leaf `<a>` ou
 * `<span>`, não no div pai (o "— " fica no pai, por isso `textContent` do pai
 * não bate exatamente). */
function sourceEl(container: HTMLElement, source: string): Element | null {
  return (
    Array.from(container.querySelectorAll('a, span')).find(
      (n) => n.textContent?.trim() === source,
    ) ?? null
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('QuoteGenerator — CTA de afiliado', () => {
  it('obra verificada: fonte vira link patrocinado com o affiliateUrl pronto', () => {
    const { container } = render(<QuoteGenerator initialQuote={comCta} />);

    const link = screen.getByRole('link', { name: 'O Problema do Sofrimento' });
    expect(link.getAttribute('href')).toBe(comCta.affiliateUrl);
    expect(link.getAttribute('rel')).toBe('sponsored noopener noreferrer');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(sourceEl(container, 'O Problema do Sofrimento')?.tagName.toLowerCase()).toBe('a');
  });

  it('fonte mas sem CTA: mostra a obra como texto puro, sem link e sem sublinhado', () => {
    // `affiliateUrl: null` com `source` preenchido: é o caso de obra de
    // domínio público. O texto tem de continuar legível, mas NÃO pode virar
    // link — link sem destino é pior que ausência de link.
    const { container } = render(<QuoteGenerator initialQuote={{ ...comCta, affiliateUrl: null }} />);

    // Não uso `getByText(/O Problema do Sofrimento/)` aqui: a obra também
    // aparece no `ShareCard` (a versão oculta de compartilhamento), então a
    // busca por texto é ambígua. O helper `sourceEl` é preciso.
    expect(sourceEl(container, 'O Problema do Sofrimento')).not.toBeNull();
    expect(screen.queryByRole('link', { name: 'O Problema do Sofrimento' })).toBeNull();
    expect(sourceEl(container, 'O Problema do Sofrimento')?.tagName.toLowerCase()).toBe('span');
  });

  it('fonte zerada pelo gate: a citação aparece, o CTA inteiro some, e nada vaza "null"', () => {
    const { container } = render(<QuoteGenerator initialQuote={semFonte} />);

    // A citação tem de continuar visível — sumir com ela apagaria 8 citações
    // do acervo da rotação.
    expect(screen.getByText(/"Nota editorial sobre happiness/)).toBeTruthy();

    expect(container.textContent).not.toMatch(/null/);
    expect(sourceEl(container, 'null')).toBeNull();
  });

  it('API inconsistente (affiliateUrl sem source): não renderiza o CTA', () => {
    // Defesa em profundidade: se a API mandar `affiliateUrl` sem `source`, a
    // guarda `currentQuote && currentQuote.source` segura.
    //
    // A asserção olha o HREF, não o texto, e isso é deliberado: sem a guarda,
    // o componente renderiza `<a href="...">{null}</a>` — um link VAZIO. React
    // não transforma `null` na string "null", então procurar "null" no texto
    // passaria batido e a mutação sobreviveria. O que denuncia a regressão é o
    // link de afiliado aparecendo sem obra para nomeá-lo.
    const href = 'https://www.amazon.com.br/s?k=SemFonte&tag=rilson-20';
    const { container } = render(
      <QuoteGenerator initialQuote={{ ...comCta, source: null, affiliateUrl: href }} />,
    );

    expect(screen.getByText(/"A porta para o inferno/)).toBeTruthy();
    expect(container.querySelector(`a[href="${href}"]`)).toBeNull();
    expect(container.textContent).not.toMatch(/null/);
  });

  it('sem citação inicial: convida a gerar, sem CTA nem "null"', () => {
    const { container } = render(<QuoteGenerator initialQuote={null} />);

    expect(screen.getByText(/Clique no botão abaixo/)).toBeTruthy();
    expect(container.textContent).not.toMatch(/null/);
  });
});
