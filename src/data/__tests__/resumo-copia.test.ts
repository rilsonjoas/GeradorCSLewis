import { describe, expect, it } from 'vitest';
import { resumir, temDiferenca } from '../../../scripts/resumo-copia.mjs';

const q = (id: string, text = 't', extra: Record<string, unknown> = {}) => ({ id, text, source: 's', theme: null, affiliateUrl: null, ...extra });
const copia = (citacoes: Record<string, unknown>[]) => ({ geradoEm: '2026-01-01', fonte: 'x', total: citacoes.length, citacoes });

describe('resumir (diferença entre duas cópias, para o corpo do PR)', () => {
  it('conta o que entra, sai e muda, e diz quais campos mudaram', () => {
    const antes = copia([q('a'), q('b'), q('c', 'texto antigo')]);
    const depois = copia([q('a'), q('c', 'texto novo', { source: 'outra' }), q('d')]);
    const r = resumir(antes, depois);
    expect(r).toMatchObject({ entram: ['d'], saem: ['b'], mudam: [{ id: 'c', campos: ['text', 'source'] }] });
    expect(r.texto).toBe('Entram 1, saem 1, mudam 1.');
  });

  it('só geradoEm e total diferentes não é diferença', () => {
    const r = resumir({ ...copia([q('a')]), geradoEm: 'ontem' }, { ...copia([q('a')]), geradoEm: 'hoje' });
    expect(r).toMatchObject({ entram: [], saem: [], mudam: [] });
    expect(r.texto).toBe('Nenhuma diferença nas citações.');
  });
});

describe('temDiferenca', () => {
  it('é falso quando nada entra, sai ou muda (só geradoEm e total diferentes)', () => {
    expect(temDiferenca(resumir(copia([q('a')]), { ...copia([q('a')]), geradoEm: 'depois' }))).toBe(false);
  });
  it('é verdadeiro para entrar, sair ou mudar', () => {
    expect(temDiferenca(resumir(copia([q('a')]), copia([q('a'), q('b')])))).toBe(true);
    expect(temDiferenca(resumir(copia([q('a'), q('b')]), copia([q('a')])))).toBe(true);
    expect(temDiferenca(resumir(copia([q('a', 'x')]), copia([q('a', 'y')])))).toBe(true);
  });
});
